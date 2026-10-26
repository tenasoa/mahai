'use server'

import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import { query } from '@/lib/db'
import { logger } from '@/lib/logger'
import { requireAuth, isAuthFailure } from '@/lib/auth-guards'
import { deleteFile, keyFromUrl, publicUrl, putFile, readImageUpload } from '@/lib/storage'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

async function getCurrentPicture(userId: string): Promise<string | null> {
  const result = await query('SELECT "profilePicture" FROM "User" WHERE id = $1 LIMIT 1', [userId])
  return result.rows[0]?.profilePicture ?? null
}

// Suppression de l'ancien fichier : best-effort, le profil est déjà à jour.
async function deletePreviousPicture(url: string | null) {
  const key = keyFromUrl(url)
  if (!key) return
  try {
    await deleteFile(key)
  } catch (error) {
    logger.apiError('avatar deletePrevious', error)
  }
}

/**
 * Upload d'un avatar vers R2
 */
export async function uploadAvatarAction(file: File) {
  try {
    // Sécurité : l'utilisateur cible est TOUJOURS dérivé de la session
    // serveur (JWT revalidé), jamais d'un paramètre fourni par le client.
    const auth = await requireAuth()
    if (isAuthFailure(auth)) {
      return { success: false, error: auth.error }
    }
    const userId = auth.userId

    const upload = await readImageUpload(file, MAX_SIZE)
    if (!upload.ok) {
      return { success: false, error: upload.error }
    }

    // Nom unique à chaque envoi : les URLs sont mises en cache sans expiration.
    const key = `avatars/${userId}/${crypto.randomUUID()}.${upload.extension}`
    await putFile(key, upload.data, upload.contentType)
    const url = publicUrl(key)

    const previous = await getCurrentPicture(userId)
    try {
      await query('UPDATE "User" SET "profilePicture" = $1, "updatedAt" = $2 WHERE id = $3', [
        url,
        new Date().toISOString(),
        userId,
      ])
    } catch (updateError) {
      logger.apiError('avatar updateProfile', updateError)
      await deleteFile(key).catch(() => {})
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du profil',
      }
    }
    await deletePreviousPicture(previous)

    revalidatePath('/profil')
    revalidatePath('/dashboard')

    return {
      success: true,
      url,
      message: 'Avatar mis à jour avec succès',
    }
  } catch (error) {
    logger.apiError('avatar upload', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'upload',
    }
  }
}

/**
 * Supprimer l'avatar de l'utilisateur connecté
 */
export async function deleteAvatarAction() {
  try {
    // Sécurité : utilisateur cible dérivé de la session serveur uniquement.
    const auth = await requireAuth()
    if (isAuthFailure(auth)) {
      return { success: false, error: auth.error }
    }
    const userId = auth.userId

    const previous = await getCurrentPicture(userId)
    try {
      await query('UPDATE "User" SET "profilePicture" = NULL, "updatedAt" = $1 WHERE id = $2', [
        new Date().toISOString(),
        userId,
      ])
    } catch (updateError) {
      logger.apiError('avatar updateProfile', updateError)
      return {
        success: false,
        error: 'Erreur lors de la suppression de l\'avatar',
      }
    }
    await deletePreviousPicture(previous)

    revalidatePath('/profil')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Avatar supprimé avec succès',
    }
  } catch (error) {
    logger.apiError('avatar delete', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la suppression',
    }
  }
}
