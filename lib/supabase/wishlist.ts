'use server'

import { query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user.id
}

export async function getWishlist() {
  const userId = await getAuthenticatedUserId()

  if (!userId) {
    return []
  }

  try {
    const result = await query(
      `SELECT w.id, w."subjectId", s.* as subject
       FROM "Wishlist" w
       LEFT JOIN "Subject" s ON s.id = w."subjectId"
       WHERE w."userId" = $1
       ORDER BY w."createdAt" DESC`,
      [userId]
    )

    return result.rows.map(row => ({
      id: row.id,
      subjectId: row.subjectId,
      subject: row.subject
    }))
  } catch (error) {
    console.error('Erreur fetch wishlist:', error)
    return []
  }
}

async function addToWishlist(subjectId: string) {
  const userId = await getAuthenticatedUserId()

  if (!userId || !subjectId) {
    return { success: false, error: 'Utilisateur ou sujet invalide' }
  }

  try {
    // Vérifier si déjà dans la wishlist
    const existing = await query(
      `SELECT id FROM "Wishlist" WHERE "userId" = $1 AND "subjectId" = $2`,
      [userId, subjectId]
    )

    if (existing.rows.length > 0) {
      return { success: false, error: 'Déjà dans la wishlist' }
    }

    const result = await query(
      `INSERT INTO "Wishlist" (id, "userId", "subjectId")
       VALUES (gen_random_uuid()::TEXT, $1, $2)
       RETURNING *`,
      [userId, subjectId]
    )

    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error('Erreur add wishlist:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

async function removeFromWishlist(subjectId: string) {
  const userId = await getAuthenticatedUserId()

  if (!userId || !subjectId) {
    return { success: false, error: 'Utilisateur ou sujet invalide' }
  }

  try {
    await query(
      `DELETE FROM "Wishlist" WHERE "userId" = $1 AND "subjectId" = $2`,
      [userId, subjectId]
    )

    return { success: true }
  } catch (error) {
    console.error('Erreur remove wishlist:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

export async function toggleWishlist(subjectId: string) {
  const userId = await getAuthenticatedUserId()

  if (!userId || !subjectId) {
    return { success: false, error: 'Utilisateur ou sujet invalide' }
  }

  try {
    const existing = await query(
      `SELECT id FROM "Wishlist" WHERE "userId" = $1 AND "subjectId" = $2`,
      [userId, subjectId]
    )

    if (existing.rows.length > 0) {
      return removeFromWishlist(subjectId)
    }

    return addToWishlist(subjectId)
  } catch (error) {
    console.error('Erreur toggle wishlist:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

export async function isInWishlist(subjectId: string) {
  const userId = await getAuthenticatedUserId()

  if (!userId || !subjectId) {
    return false
  }

  try {
    const result = await query(
      `SELECT id FROM "Wishlist" WHERE "userId" = $1 AND "subjectId" = $2`,
      [userId, subjectId]
    )

    return result.rows.length > 0
  } catch {
    return false
  }
}
