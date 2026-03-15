'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function getWishlist(userId: string) {
  if (!userId) {
    return []
  }

  const { data, error } = await supabase
    .from('Wishlist')
    .select(`
      id,
      subjectId,
      subject:Subject(*)
    `)
    .eq('userId', userId)
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Erreur fetch wishlist:', error)
    return []
  }

  return data || []
}

export async function addToWishlist(userId: string, subjectId: string) {
  if (!userId || !subjectId) {
    return { success: false, error: 'Utilisateur ou sujet invalide' }
  }

  // Vérifier si existe déjà
  const { data: existing } = await supabase
    .from('Wishlist')
    .select('id')
    .eq('userId', userId)
    .eq('subjectId', subjectId)
    .single()

  if (existing) {
    return { success: false, error: 'Déjà dans la wishlist' }
  }

  // Générer un ID unique
  const { data, error } = await supabase
    .from('Wishlist')
    .insert({
      id: crypto.randomUUID(),
      userId,
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

export async function removeFromWishlist(userId: string, subjectId: string) {
  if (!userId || !subjectId) {
    return { success: false, error: 'Utilisateur ou sujet invalide' }
  }

  const { error } = await supabase
    .from('Wishlist')
    .delete()
    .eq('userId', userId)
    .eq('subjectId', subjectId)

  if (error) {
    console.error('Erreur remove wishlist:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function toggleWishlist(userId: string, subjectId: string) {
  if (!userId || !subjectId) {
    return { success: false, error: 'Utilisateur ou sujet invalide' }
  }

  // Vérifier si existe
  const { data: existing } = await supabase
    .from('Wishlist')
    .select('id')
    .eq('userId', userId)
    .eq('subjectId', subjectId)
    .single()

  if (existing) {
    return await removeFromWishlist(userId, subjectId)
  } else {
    return await addToWishlist(userId, subjectId)
  }
}

export async function isInWishlist(userId: string, subjectId: string) {
  if (!userId || !subjectId) {
    return false
  }

  const { data } = await supabase
    .from('Wishlist')
    .select('id')
    .eq('userId', userId)
    .eq('subjectId', subjectId)
    .single()

  return !!data
}
