import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireAuth, isAuthFailure } from '@/lib/auth-guards'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = await createSupabaseAdminClient()
    
    const { data: comments, error } = await supabase
      .from('BlogComment')
      .select(`
        *,
        User (
          id,
          prenom,
          nom,
          profilePicture
        )
      `)
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('createdAt', { ascending: true })

    let finalComments = comments || []
    
    if (error) {
      console.error('Database error fetching comments with join:', error)
      // Try fetching without User join if it fails
      const { data: simpleComments, error: simpleError } = await supabase
        .from('BlogComment')
        .select('*')
        .eq('post_id', postId)
        .eq('is_approved', true)
        .order('createdAt', { ascending: true })
      
      if (simpleError) throw simpleError
      
      // Manually fetch user profiles for these comments
      const userIds = [...new Set((simpleComments || []).map(c => c.user_id))]
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('User')
          .select('id, prenom, nom, profilePicture')
          .in('id', userIds)
        
        if (users) {
          const userMap = new Map(users.map(u => [u.id, u]))
          finalComments = (simpleComments || []).map(c => ({
            ...c,
            User: userMap.get(c.user_id)
          }))
        } else {
          finalComments = simpleComments || []
        }
      } else {
        finalComments = simpleComments || []
      }
    }
    
    const mappedComments = finalComments.map(c => ({
      ...c,
      userName: c.user_name,
      postId: c.post_id,
      userId: c.user_id
    }))
    
    return NextResponse.json({ comments: mappedComments })
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
    const auth = await requireAuth()

    if (isAuthFailure(auth)) {
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
    const { data: userData } = await auth.supabase
      .from('User')
      .select('prenom, nom')
      .eq('id', auth.userId)
      .single()

    const fullName = userData ? [userData.prenom, userData.nom].filter(Boolean).join(' ') : auth.email
    const userName = fullName || 'Utilisateur'

    // Use admin client to bypass RLS for comment insertion
    const adminClient = await createSupabaseAdminClient()

    const { data: comment, error } = await adminClient
      .from('BlogComment')
      .insert({
        post_id: postId as string,
        user_id: auth.userId,
        user_name: userName,
        content: content.trim(),
        parent_id: parentId || null,
        is_approved: true
      })
      .select()
      .single()

    if (error) throw error
    
    // Map to camelCase for frontend
    const mappedComment = {
      ...comment,
      userName: comment.user_name,
      postId: comment.post_id,
      userId: comment.user_id
    }
    
    return NextResponse.json({ success: true, comment: mappedComment })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du commentaire' },
      { status: 500 }
    )
  }
}
