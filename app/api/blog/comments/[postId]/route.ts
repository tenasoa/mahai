import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = await createSupabaseServerClient()
    
    const { data: comments, error } = await supabase
      .from('BlogComment')
      .select('*')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('createdAt', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json({ comments: comments || [] })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commentaires' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour commenter' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { content, parentId } = body
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le commentaire ne peut pas être vide' },
        { status: 400 }
      )
    }
    
    // Get user info
    const { data: userData } = await supabase
      .from('User')
      .select('prenom, nom')
      .eq('id', session.user.id)
      .single()
    
    const userName = userData ? [userData.prenom, userData.nom].filter(Boolean).join(' ') : session.user.email
    
    const { data: comment, error } = await supabase
      .from('BlogComment')
      .insert({
        post_id: postId,
        user_id: session.user.id,
        user_name: userName,
        content: content.trim(),
        parent_id: parentId || null
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du commentaire' },
      { status: 500 }
    )
  }
}
