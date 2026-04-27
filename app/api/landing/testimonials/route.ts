import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const revalidate = 3600; // Cache 1h

export async function GET() {
  try {
    const supabase = await createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("id, name, role, quote, avatar_initial, rating, is_example")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .limit(6);

    if (error) {
      console.error("Testimonials fetch error:", error);
      return NextResponse.json({ testimonials: [] });
    }

    return NextResponse.json({ testimonials: data ?? [] });
  } catch (err) {
    console.error("Testimonials API error:", err);
    return NextResponse.json({ testimonials: [] });
  }
}
