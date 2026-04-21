import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    // Use admin client to bypass RLS - this is a public-facing API
    const supabase = await createSupabaseAdminClient()
    
    // Increment view count atomically
    const { data: currentPost } = await supabase
      .from('BlogPost')
      .select('views')
      .eq('slug', slug)
      .single()
    
    await supabase
      .from('BlogPost')
      .update({ views: (currentPost?.views ?? 0) + 1 })
      .eq('slug', slug)
    
    const { data: post, error } = await supabase
      .from('BlogPost')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    
    if (error) throw error
    
    if (!post) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error fetching blog post by slug:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'article' },
      { status: 500 }
    )
  }
}
