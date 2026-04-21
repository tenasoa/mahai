'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const contributorApplicationSchema = z.object({
  fullName: z.string().min(4, 'Nom complet requis (min 4 caractères)'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  subjects: z.string().min(3, 'Indiquez au moins une matière'),
  educationLevel: z.string().min(3, 'Niveau académique requis'),
  teachingExperience: z.string().min(20, 'Décrivez votre expérience (min 20 caractères)'),
  motivation: z.string().min(50, 'La motivation doit contenir au moins 50 caractères'),
  availability: z.string().min(10, 'Précisez votre disponibilité'),
  portfolioUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  sampleLesson: z.string().optional(),
})

async function contributorApplicationTableExists() {
  const result = await query(
    `SELECT 1
     FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'ContributorApplication'
     LIMIT 1`,
  )
  return result.rows.length > 0
}

export interface ContributorApplicationState {
  success: boolean
  message: string
  errors?: Record<string, string>
}

export async function getCurrentUserAndApplication() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return null
  }

  const userResult = await query('SELECT id, role, prenom, nom, email, phone FROM "User" WHERE id = $1 LIMIT 1', [
    session.user.id,
  ])

  let application: any = null
  const hasApplicationTable = await contributorApplicationTableExists()
  if (hasApplicationTable) {
    const applicationResult = await query('SELECT * FROM "ContributorApplication" WHERE "userId" = $1 LIMIT 1', [
      session.user.id,
    ])
    application = applicationResult.rows[0] ?? null
  }

  return {
    user: userResult.rows[0] ?? null,
    application,
  }
}

export async function submitContributorApplication(
  _prevState: ContributorApplicationState,
  formData: FormData,
): Promise<ContributorApplicationState> {
  try {
    const sessionData = await getCurrentUserAndApplication()

    if (!sessionData?.user) {
      return {
        success: false,
        message: 'Veuillez vous connecter pour envoyer votre candidature.',
      }
    }

    if (['CONTRIBUTEUR', 'PROFESSEUR', 'ADMIN', 'VALIDATEUR', 'VERIFICATEUR'].includes(sessionData.user.role)) {
      return {
        success: false,
        message: 'Votre compte possède déjà les droits contributeur ou supérieurs.',
      }
    }

    const parsed = contributorApplicationSchema.safeParse({
      fullName: formData.get('fullName'),
      phone: formData.get('phone'),
      subjects: formData.get('subjects'),
      educationLevel: formData.get('educationLevel'),
      teachingExperience: formData.get('teachingExperience'),
      motivation: formData.get('motivation'),
      availability: formData.get('availability'),
      portfolioUrl: formData.get('portfolioUrl'),
      sampleLesson: formData.get('sampleLesson'),
    })

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      const errors = Object.fromEntries(
        Object.entries(fieldErrors)
          .filter(([, value]) => value && value.length > 0)
          .map(([key, value]) => [key, value?.[0] ?? 'Champ invalide']),
      )

      return {
        success: false,
        message: 'Veuillez corriger les champs invalides.',
        errors,
      }
    }

    const data = parsed.data

    const hasApplicationTable = await contributorApplicationTableExists()
    if (!hasApplicationTable) {
      return {
        success: false,
        message:
          'La migration des candidatures n’est pas encore appliquée. Lancez d’abord migrations_manual/018_contributor_applications.sql.',
      }
    }

    await query(
      `
      INSERT INTO "ContributorApplication" (
        "userId",
        "fullName",
        "phone",
        "subjects",
        "educationLevel",
        "teachingExperience",
        motivation,
        availability,
        "portfolioUrl",
        "sampleLesson",
        status,
        "adminNotes",
        "reviewedBy",
        "reviewedAt",
        "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING', NULL, NULL, NULL, NOW()
      )
      ON CONFLICT ("userId")
      DO UPDATE SET
        "fullName" = EXCLUDED."fullName",
        "phone" = EXCLUDED."phone",
        "subjects" = EXCLUDED."subjects",
        "educationLevel" = EXCLUDED."educationLevel",
        "teachingExperience" = EXCLUDED."teachingExperience",
        motivation = EXCLUDED.motivation,
        availability = EXCLUDED.availability,
        "portfolioUrl" = EXCLUDED."portfolioUrl",
        "sampleLesson" = EXCLUDED."sampleLesson",
        status = 'PENDING',
        "adminNotes" = NULL,
        "reviewedBy" = NULL,
        "reviewedAt" = NULL,
        "updatedAt" = NOW()
      `,
      [
        sessionData.user.id,
        data.fullName,
        data.phone,
        data.subjects,
        data.educationLevel,
        data.teachingExperience,
        data.motivation,
        data.availability,
        data.portfolioUrl || null,
        data.sampleLesson || null,
      ],
    )

    revalidatePath('/contributeur/candidature')
    revalidatePath('/admin/candidatures')

    return {
      success: true,
      message: 'Votre candidature a été envoyée avec succès. Elle sera examinée par un administrateur.',
    }
  } catch (error) {
    console.error('submitContributorApplication error', error)
    return {
      success: false,
      message: 'Une erreur est survenue lors de l’envoi de la candidature.',
    }
  }
}
