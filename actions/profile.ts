'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import { updateProfileSchema, type UpdateProfileData } from '@/lib/validations/profile'

type AuthenticatedContext =
  | {
      supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
      userId: string
    }
  | {
      error: string
    }

async function getAuthenticatedContext(): Promise<AuthenticatedContext> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: 'Vous devez être connecté pour effectuer cette action' }
  }

  return {
    supabase,
    userId: user.id,
  }
}

function extractProfileStoragePath(profilePicture: string | null | undefined) {
  if (!profilePicture) {
    return null
  }

  try {
    const url = new URL(profilePicture)
    const marker = '/object/public/profiles/'
    const index = url.pathname.indexOf(marker)

    if (index === -1) {
      return null
    }

    return decodeURIComponent(url.pathname.slice(index + marker.length))
  } catch {
    return null
  }
}

async function getProfileByUserId(userId: string) {
  const result = await query('SELECT * FROM "User" WHERE id = $1 LIMIT 1', [userId])
  return result.rows[0] ?? null
}

export async function getCurrentProfileAction() {
  const context = await getAuthenticatedContext()

  if ('error' in context) {
    return { success: false, error: context.error }
  }

  try {
    const profile = await getProfileByUserId(context.userId)

    if (!profile) {
      return { success: false, error: 'Erreur lors de la récupération du profil' }
    }

    return { success: true, data: profile }
  } catch (error) {
    console.error('Erreur serveur:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}

export async function updateCurrentUserProfileAction(data: UpdateProfileData) {
  const context = await getAuthenticatedContext()

  if ('error' in context) {
    return { success: false, error: context.error }
  }

  try {
    const validatedData = updateProfileSchema.parse(data)
    const entries = Object.entries(validatedData).filter(([, value]) => value !== undefined)
    const updatedAt = new Date().toISOString()
    const assignments: string[] = []
    const values: unknown[] = []

    entries.forEach(([field, value], index) => {
      assignments.push(`"${field}" = $${index + 1}`)
      values.push(value)
    })

    assignments.push(`"updatedAt" = $${entries.length + 1}`)
    values.push(updatedAt)
    values.push(context.userId)

    const result = await query(
      `UPDATE "User" SET ${assignments.join(', ')} WHERE id = $${entries.length + 2} RETURNING *`,
      values
    )

    const profile = result.rows[0] ?? null

    if (!profile) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du profil',
      }
    }

    revalidatePath('/profil')
    revalidatePath(`/profil/${context.userId}`)

    return { success: true, data: profile }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Données invalides',
        details: error.errors.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      }
    }

    console.error('Erreur serveur inattendue:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur inattendue',
    }
  }
}

const securitySettingsSchema = z.object({
  securityTwoFactorEnabled: z.boolean(),
  securityLoginAlertEnabled: z.boolean(),
  securityUnknownDeviceBlock: z.boolean(),
  securityRecoveryEmailEnabled: z.boolean(),
  securitySessionTimeoutMinutes: z.number().int().min(15).max(1440),
})

export interface PurchasedSubjectItem {
  id: string
  titre: string
  type: string
  matiere: string
  annee: string
  serie: string | null
  credits: number
  rating: number
  reviewsCount: number
  creditsAmount: number
  purchasedAt: string
}

export async function getCurrentUserPurchasedSubjectsAction() {
  const context = await getAuthenticatedContext()

  if ('error' in context) {
    return { success: false, error: context.error, data: [] as PurchasedSubjectItem[] }
  }

  try {
    const result = await query(
      `SELECT
         s.id,
         s.titre,
         s.type,
         s.matiere,
         s.annee,
         s.serie,
         s.credits,
         s.rating,
         s."reviewsCount",
         p."creditsAmount",
         p."createdAt" AS "purchasedAt"
       FROM "Purchase" p
       JOIN "Subject" s ON s.id = p."subjectId"
       WHERE p."userId" = $1
         AND p.status = 'COMPLETED'
       ORDER BY p."createdAt" DESC`,
      [context.userId]
    )

    return { success: true, data: result.rows as PurchasedSubjectItem[] }
  } catch (error) {
    console.error('Erreur récupération sujets achetés:', error)
    return { success: false, error: 'Impossible de récupérer vos sujets débloqués', data: [] as PurchasedSubjectItem[] }
  }
}

export async function updateCurrentUserSecuritySettingsAction(data: unknown) {
  const context = await getAuthenticatedContext()

  if ('error' in context) {
    return { success: false, error: context.error }
  }

  try {
    const validatedData = securitySettingsSchema.parse(data)
    const now = new Date().toISOString()

    const result = await query(
      `UPDATE "User"
       SET
         "securityTwoFactorEnabled" = $1,
         "securityLoginAlertEnabled" = $2,
         "securityUnknownDeviceBlock" = $3,
         "securityRecoveryEmailEnabled" = $4,
         "securitySessionTimeoutMinutes" = $5,
         "securitySettingsUpdatedAt" = $6,
         "updatedAt" = $6
       WHERE id = $7
       RETURNING
         "securityTwoFactorEnabled",
         "securityLoginAlertEnabled",
         "securityUnknownDeviceBlock",
         "securityRecoveryEmailEnabled",
         "securitySessionTimeoutMinutes",
         "securitySettingsUpdatedAt"`,
      [
        validatedData.securityTwoFactorEnabled,
        validatedData.securityLoginAlertEnabled,
        validatedData.securityUnknownDeviceBlock,
        validatedData.securityRecoveryEmailEnabled,
        validatedData.securitySessionTimeoutMinutes,
        now,
        context.userId,
      ]
    )

    revalidatePath('/profil')
    return { success: true, data: result.rows[0] ?? null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Paramètres de sécurité invalides' }
    }

    console.error('Erreur mise à jour sécurité:', error)
    return { success: false, error: 'Impossible de sauvegarder les paramètres de sécurité' }
  }
}

export async function uploadCurrentUserProfilePictureAction(file: File) {
  const context = await getAuthenticatedContext()

  if ('error' in context) {
    return { success: false, error: context.error }
  }

  try {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Type de fichier non supporté' }
    }

    if (file.size > maxSize) {
      return { success: false, error: 'Fichier trop volumineux (max 5MB)' }
    }

    const fileExt = file.name.split('.').pop() || 'webp'
    const fileName = `${context.userId}/profile.${fileExt}`

    const { error: uploadError } = await context.supabase.storage
      .from('profiles')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Erreur upload:', uploadError)
      return { success: false, error: 'Erreur lors du téléchargement' }
    }

    const {
      data: { publicUrl },
    } = context.supabase.storage.from('profiles').getPublicUrl(fileName)

    const updateResult = await query(
      'UPDATE "User" SET "profilePicture" = $1, "updatedAt" = $2 WHERE id = $3 RETURNING *',
      [publicUrl, new Date().toISOString(), context.userId]
    )

    const profile = updateResult.rows[0] ?? null

    if (!profile) {
      return { success: false, error: 'Erreur lors de la mise à jour du profil' }
    }

    revalidatePath('/profil')
    revalidatePath(`/profil/${context.userId}`)

    return { success: true, data: profile }
  } catch (error) {
    console.error('Erreur serveur:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}

export async function deleteCurrentUserProfilePictureAction() {
  const context = await getAuthenticatedContext()

  if ('error' in context) {
    return { success: false, error: context.error }
  }

  try {
    const profileResult = await query('SELECT "profilePicture" FROM "User" WHERE id = $1 LIMIT 1', [
      context.userId,
    ])
    const profile = profileResult.rows[0] ?? null

    if (!profile) {
      return { success: false, error: 'Erreur lors de la récupération du profil' }
    }

    const storagePath = extractProfileStoragePath(profile?.profilePicture)

    if (storagePath) {
      const { error: deleteError } = await context.supabase.storage
        .from('profiles')
        .remove([storagePath])

      if (deleteError) {
        console.error('Erreur suppression image:', deleteError)
      }
    }

    const updateResult = await query(
      'UPDATE "User" SET "profilePicture" = NULL, "updatedAt" = $1 WHERE id = $2 RETURNING *',
      [new Date().toISOString(), context.userId]
    )
    const updatedProfile = updateResult.rows[0] ?? null

    if (!updatedProfile) {
      return { success: false, error: 'Erreur lors de la mise à jour du profil' }
    }

    revalidatePath('/profil')
    revalidatePath(`/profil/${context.userId}`)

    return { success: true, data: updatedProfile }
  } catch (error) {
    console.error('Erreur serveur:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}

// Schema pour le changement de mot de passe
const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Le mot de passe actuel doit contenir au moins 6 caractères'),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ['confirmPassword'],
})

export async function changeUserPasswordAction(data: unknown) {
  const context = await getAuthenticatedContext()

  if ('error' in context) {
    return { success: false, error: context.error }
  }

  try {
    const validatedData = changePasswordSchema.parse(data)
    const supabase = context.supabase

    // Récupérer l'email de l'utilisateur
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    // Vérifier le mot de passe actuel
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: validatedData.currentPassword,
    })

    if (signInError) {
      return { success: false, error: 'Le mot de passe actuel est incorrect' }
    }

    // Changer le mot de passe
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.newPassword,
    })

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    revalidatePath('/profil')

    return { success: true, message: 'Mot de passe mis à jour avec succès' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Validation échouée',
      }
    }
    console.error('Erreur serveur:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}
