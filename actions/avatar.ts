'use server'

import { put, del, list } from '@vercel/blob'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const BLOB_FOLDER = 'avatars'

// Obtenir le token d'accès pour Vercel Blob
function getBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN n\'est pas configuré dans les variables d\'environnement')
  }
  return token
}

/**
 * Upload d'un avatar vers Vercel Blob
 */
export async function uploadAvatarAction(userId: string, file: File) {
  try {
    const token = getBlobToken()

    // Validation du fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { 
        success: false, 
        error: 'Type de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.' 
      }
    }

    if (file.size > maxSize) {
      return { 
        success: false, 
        error: 'Fichier trop volumineux (max 5MB)' 
      }
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${BLOB_FOLDER}/${userId}/avatar.${fileExt}`

    // Upload vers Vercel Blob
    const data = await put(fileName, file, {
      access: 'public',
      token,
      contentType: file.type,
      addRandomSuffix: false, // On garde le même nom pour overwrite
    })

    // Mettre à jour le profil utilisateur dans Supabase
    const supabase = await createSupabaseAdminClient()
    const { error: updateError } = await supabase
      .from('User')
      .update({
        profilePicture: data.url,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Erreur mise à jour profil:', updateError)
      // Supprimer le fichier uploadé
      await del(data.url, { token })
      return { 
        success: false, 
        error: 'Erreur lors de la mise à jour du profil' 
      }
    }

    revalidatePath('/profil')
    revalidatePath('/dashboard')

    return { 
      success: true, 
      url: data.url,
      message: 'Avatar mis à jour avec succès' 
    }
  } catch (error) {
    console.error('Erreur upload avatar:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur lors de l\'upload' 
    }
  }
}

/**
 * Supprimer un avatar de Vercel Blob
 */
export async function deleteAvatarAction(userId: string) {
  try {
    const token = getBlobToken()

    // Récupérer l'URL actuelle de l'avatar
    const supabase = await createSupabaseAdminClient()
    const { data: userData } = await supabase
      .from('User')
      .select('profilePicture')
      .eq('id', userId)
      .single()

    if (userData?.profilePicture) {
      // Supprimer de Vercel Blob
      await del(userData.profilePicture, { token })
    }

    // Mettre à jour le profil
    const { error: updateError } = await supabase
      .from('User')
      .update({
        profilePicture: null,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Erreur mise à jour profil:', updateError)
      return { 
        success: false, 
        error: 'Erreur lors de la suppression de l\'avatar' 
      }
    }

    revalidatePath('/profil')
    revalidatePath('/dashboard')

    return { 
      success: true, 
      message: 'Avatar supprimé avec succès' 
    }
  } catch (error) {
    console.error('Erreur suppression avatar:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur lors de la suppression' 
    }
  }
}

/**
 * Lister tous les avatars (pour admin)
 */
export async function listAvatarsAction() {
  try {
    const token = getBlobToken()
    
    const data = await list({
      prefix: `${BLOB_FOLDER}/`,
      token,
    })

    return {
      success: true,
      blobs: data.blobs
    }
  } catch (error) {
    console.error('Erreur liste avatars:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la liste'
    }
  }
}
