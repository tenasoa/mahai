'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

async function getAuthenticatedWishlistContext() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return { supabase, userId: user.id }
}

export async function getWishlist() {
  const context = await getAuthenticatedWishlistContext()

  if (!context) {
    return []
  }

  const { data, error } = await context.supabase
    .from('Wishlist')
    .select(`
      id,
      subjectId,
      subject:Subject(*)
    `)
    .eq('userId', context.userId)
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Erreur fetch wishlist:', error)
    return []
  }

  return data || []
}

async function addToWishlist(subjectId: string) {
  const context = await getAuthenticatedWishlistContext()

  if (!context || !subjectId) {
    return { success: false, error: 'Utilisateur ou sujet invalide' }
  }

  const { data: existing } = await context.supabase
    .from('Wishlist')
    .select('id')
    .eq('userId', context.userId)
    .eq('subjectId', subjectId)
    .single()

  if (existing) {
    return { success: false, error: 'Déjà dans la wishlist' }
  }

  const { data, error } = await context.supabase
    .from('Wishlist')
    .insert({
      id: crypto.randomUUID(),
      userId: context.userId,
      subjectId,
    })
    .select()
    .single()

  if (error) {
    console.error('Erreur add wishlist:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

async function removeFromWishlist(subjectId: string) {
  const context = await getAuthenticatedWishlistContext()

  if (!context || !subjectId) {
    return { success: false, error: 'Utilisateur ou sujet invalide' }
  }

  const { error } = await context.supabase
    .from('Wishlist')
    .delete()
    .eq('userId', context.userId)
    .eq('subjectId', subjectId)

  if (error) {
    console.error('Erreur remove wishlist:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function toggleWishlist(subjectId: string) {
  const context = await getAuthenticatedWishlistContext()

  if (!context || !subjectId) {
    return { success: false, error: 'Utilisateur ou sujet invalide' }
  }

  const { data: existing } = await context.supabase
    .from('Wishlist')
    .select('id')
    .eq('userId', context.userId)
    .eq('subjectId', subjectId)
    .single()

  if (existing) {
    return removeFromWishlist(subjectId)
  }

  return addToWishlist(subjectId)
}

export async function isInWishlist(subjectId: string) {
  const context = await getAuthenticatedWishlistContext()

  if (!context || !subjectId) {
    return false
  }

  const { data } = await context.supabase
    .from('Wishlist')
    .select('id')
    .eq('userId', context.userId)
    .eq('subjectId', subjectId)
    .single()

  return !!data
}
