import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const published = searchParams.get("published");

    // Use admin client to bypass RLS in the admin panel
    const supabase = await createSupabaseAdminClient();

    let query = supabase
      .from("BlogPost")
      .select("*")
      .order("createdAt", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    if (published === "true") {
      query = query.eq("is_published", true);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    return NextResponse.json({ posts: posts || [] });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des articles" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Use admin client for DB operations to avoid UUID/RLS insert errors
    const supabase = await createSupabaseAdminClient();
    const body = await request.json();

    const {
      title,
      slug,
      excerpt,
      content,
      category,
      authorId,
      authorName,
      coverImage,
      readTime,
      isPublished,
    } = body;

    // Generate slug from title if not provided
    const finalSlug =
      slug ||
      title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // Get an admin UUID to avoid "admin" invalid UUID error
    let validAuthorId = authorId;
    if (!validAuthorId || validAuthorId === "admin") {
      const { data: adminUser } = await supabase.from("User").select("id").eq("role", "ADMIN").limit(1).single();
      validAuthorId = adminUser?.id;
    }

    const { data: post, error } = await supabase
      .from("BlogPost")
      .insert({
        title,
        slug: finalSlug,
        excerpt,
        content,
        category: category || "general",
        author_id: validAuthorId,
        author_name: authorName || "Admin Mah.AI",
        cover_image: coverImage,
        read_time: readTime || 5,
        is_published: isPublished || false,
        published_at: isPublished ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'article" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseAdminClient();
    const body = await request.json();

    const {
      id,
      title,
      slug,
      excerpt,
      content,
      category,
      authorName,
      coverImage,
      readTime,
      isPublished,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "L'ID de l'article est requis" },
        { status: 400 },
      );
    }

    // Generate slug from title if updated
    const finalSlug =
      slug ||
      title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const { data: post, error } = await supabase
      .from("BlogPost")
      .update({
        title,
        slug: finalSlug,
        excerpt,
        content,
        category: category || "general",
        author_name: authorName || "Admin Mah.AI",
        cover_image: coverImage,
        read_time: readTime || 5,
        is_published: isPublished || false,
        published_at: isPublished ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'article" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "L'ID de l'article est requis" },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("BlogPost").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'article" },
      { status: 500 },
    );
  }
}
