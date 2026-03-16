'use server'

import { createClient } from '@supabase/supabase-js'
import { updateProfileSchema, type UpdateProfileData } from '@/lib/validations/profile'
import { z } from 'zod'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function getProfileAction(userId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Erreur récupération profil:', error)
      return { success: false, error: 'Erreur lors de la récupération du profil' }
    }

    return { success: true, data: profile }
  } catch (error) {
    console.error('Erreur serveur:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}

export async function updateProfileAction(userId: string, data: UpdateProfileData) {
  try {
    // Valider les données avec Zod
    const validatedData = updateProfileSchema.parse(data)

    const { data: profile, error } = await supabase
      .from('User')
      .update({
        ...validatedData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour profil:', error)
      return { success: false, error: 'Erreur lors de la mise à jour du profil' }
    }

    return { success: true, data: profile }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Données invalides',
        details: error.errors 
      }
    }

    console.error('Erreur serveur:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}

export async function uploadProfilePictureAction(userId: string, file: File) {
  try {
    // Validation du fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Type de fichier non supporté' }
    }

    if (file.size > maxSize) {
      return { success: false, error: 'Fichier trop volumineux (max 5MB)' }
    }

    // Upload vers Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/profile.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Erreur upload:', uploadError)
      return { success: false, error: 'Erreur lors du téléchargement' }
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName)

    // Mettre à jour le profil avec l'URL de l'image
    const { data: profile, error: updateError } = await supabase
      .from('User')
      .update({
        profilePicture: publicUrl,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur mise à jour profil:', updateError)
      return { success: false, error: 'Erreur lors de la mise à jour du profil' }
    }

    return { success: true, data: profile }
  } catch (error) {
    console.error('Erreur serveur:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}

export async function deleteProfilePictureAction(userId: string) {
  try {
    // Supprimer l'ancienne image
    const { error: deleteError } = await supabase.storage
      .from('profiles')
      .remove([`${userId}/profile`])

    if (deleteError) {
      console.error('Erreur suppression image:', deleteError)
      // Continuer même si la suppression échoue
    }

    // Mettre à jour le profil
    const { data: profile, error: updateError } = await supabase
      .from('User')
      .update({
        profilePicture: null,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur mise à jour profil:', updateError)
      return { success: false, error: 'Erreur lors de la mise à jour du profil' }
    }

    return { success: true, data: profile }
  } catch (error) {
    console.error('Erreur serveur:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}
