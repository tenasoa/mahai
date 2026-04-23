'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

async function getAuthenticatedContributor() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const result = await query('SELECT id, role FROM "User" WHERE id = $1', [session.user.id])
  const user = result.rows[0]

  if (!user || !['CONTRIBUTEUR', 'ADMIN', 'PROFESSEUR'].includes(user.role)) return null
  return { userId: user.id, role: user.role }
}

async function ensureTable() {
  // Table de base (compat + idempotent)
  await query(`
    CREATE TABLE IF NOT EXISTS "SubjectSubmission" (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      matiere TEXT NOT NULL DEFAULT '',
      niveau TEXT NOT NULL DEFAULT '',
      serie TEXT,
      annee INT,
      duree TEXT,
      coefficient INT,
      "contentType" TEXT NOT NULL DEFAULT 'sujet_seul',
      content JSONB NOT NULL DEFAULT '{}',
      tags TEXT[] NOT NULL DEFAULT '{}',
      prix INT NOT NULL DEFAULT 0,
      "prixMode" TEXT NOT NULL DEFAULT 'forfait',
      visibilite TEXT NOT NULL DEFAULT 'public',
      status TEXT NOT NULL DEFAULT 'DRAFT',
      "authorId" TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // Ajout idempotent des nouvelles colonnes (métadonnées enrichies)
  const addCols = [
    `ADD COLUMN IF NOT EXISTS "examType" TEXT`,
    `ADD COLUMN IF NOT EXISTS "bepcOption" TEXT`,
    `ADD COLUMN IF NOT EXISTS "baccType" TEXT`,
    `ADD COLUMN IF NOT EXISTS "concoursType" TEXT`,
    `ADD COLUMN IF NOT EXISTS "etablissement" TEXT`,
    `ADD COLUMN IF NOT EXISTS "semestre" TEXT`,
    `ADD COLUMN IF NOT EXISTS "filiere" TEXT`,
    `ADD COLUMN IF NOT EXISTS "anneeScolaire" TEXT`,
    `ADD COLUMN IF NOT EXISTS "dateOfficielle" TEXT`,
    `ADD COLUMN IF NOT EXISTS "customMeta" JSONB NOT NULL DEFAULT '[]'::jsonb`,
  ]
  await query(`ALTER TABLE "SubjectSubmission" ${addCols.join(', ')}`)
}

// ─── Types d'entrée ──────────────────────────────────────────────

export interface OnboardingData {
  title: string
  matiere: string
  examType: string
  bepcOption?: string
  baccType?: string
  serie?: string
  concoursType?: string
  etablissement?: string
  semestre?: string
  filiere?: string
  anneeScolaire?: string
  dateOfficielle?: string
  duree?: string
  coefficient?: number | string
  contentType?: string
  customMeta?: Array<{ id: string; label: string; value: string }>
  prix?: number
  prixMode?: string
}

function deriveNiveau(examType: string): string {
  if (examType === 'BACC') return 'BAC'
  if (examType === 'BEPC' || examType === 'CEPE') return examType
  return examType || ''
}

function parseAnneeAsInt(annee: string | undefined | null): number | null {
  if (!annee) return null
  const m = annee.match(/(\d{4})/)
  return m ? parseInt(m[1], 10) : null
}

// ─── createSubjectDraft ──────────────────────────────────────────

export async function createSubjectDraft(data: OnboardingData) {
  const contributor = await getAuthenticatedContributor()
  if (!contributor) return { success: false as const, error: 'Non autorisé' }

  try {
    await ensureTable()
    const id = crypto.randomUUID()
    const niveau = deriveNiveau(data.examType)
    const anneeInt = parseAnneeAsInt(data.anneeScolaire)

    await query(
      `INSERT INTO "SubjectSubmission"
        (id, title, matiere, niveau, serie, annee, duree, coefficient,
         "contentType", prix, "prixMode", "authorId",
         "examType", "bepcOption", "baccType", "concoursType",
         "etablissement", "semestre", "filiere",
         "anneeScolaire", "dateOfficielle", "customMeta")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
               $13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
      [
        id,
        data.title || '',
        data.matiere || '',
        niveau,
        data.serie || null,
        anneeInt,
        data.duree || null,
        data.coefficient ? Number(data.coefficient) : null,
        data.contentType || 'sujet_seul',
        data.prix || 0,
        data.prixMode || 'forfait',
        contributor.userId,
        data.examType || null,
        data.bepcOption || null,
        data.baccType || null,
        data.concoursType || null,
        data.etablissement || null,
        data.semestre || null,
        data.filiere || null,
        data.anneeScolaire || null,
        data.dateOfficielle || null,
        JSON.stringify(data.customMeta || []),
      ]
    )
    return { success: true as const, id }
  } catch (error) {
    console.error('createSubjectDraft:', error)
    return { success: false as const, error: (error as Error).message || 'Erreur lors de la création' }
  }
}

// ─── saveSubjectDraft ────────────────────────────────────────────

export interface DraftUpdates {
  title?: string
  matiere?: string
  examType?: string
  bepcOption?: string
  baccType?: string
  serie?: string | null
  concoursType?: string
  etablissement?: string
  semestre?: string
  filiere?: string
  anneeScolaire?: string
  dateOfficielle?: string
  duree?: string | null
  coefficient?: number | null
  contentType?: string
  content?: object
  tags?: string[]
  customMeta?: Array<{ id: string; label: string; value: string }>
  prix?: number
  prixMode?: string
  visibilite?: string
}

export async function saveSubjectDraft(id: string, updates: DraftUpdates) {
  const contributor = await getAuthenticatedContributor()
  if (!contributor) return { success: false as const, error: 'Non autorisé' }

  try {
    await ensureTable()

    const ownerRes = await query('SELECT "authorId" FROM "SubjectSubmission" WHERE id = $1', [id])
    if (!ownerRes.rows[0] || ownerRes.rows[0].authorId !== contributor.userId) {
      return { success: false as const, error: 'Non autorisé' }
    }

    const setClauses: string[] = ['"updatedAt" = NOW()']
    const values: unknown[] = []
    let p = 1

    const fieldMap: Record<string, string> = {
      title: 'title',
      matiere: 'matiere',
      examType: '"examType"',
      bepcOption: '"bepcOption"',
      baccType: '"baccType"',
      serie: 'serie',
      concoursType: '"concoursType"',
      etablissement: '"etablissement"',
      semestre: '"semestre"',
      filiere: '"filiere"',
      anneeScolaire: '"anneeScolaire"',
      dateOfficielle: '"dateOfficielle"',
      duree: 'duree',
      coefficient: 'coefficient',
      contentType: '"contentType"',
      content: 'content',
      tags: 'tags',
      customMeta: '"customMeta"',
      prix: 'prix',
      prixMode: '"prixMode"',
      visibilite: 'visibilite',
    }

    for (const [key, col] of Object.entries(fieldMap)) {
      const val = updates[key as keyof DraftUpdates]
      if (val !== undefined) {
        setClauses.push(`${col} = $${p++}`)
        if (key === 'content' || key === 'customMeta') {
          values.push(JSON.stringify(val))
        } else {
          values.push(val)
        }
      }
    }

    // Si examType est modifié, synchroniser "niveau" et "annee" (compat anciens champs)
    if (updates.examType !== undefined) {
      setClauses.push(`niveau = $${p++}`)
      values.push(deriveNiveau(updates.examType))
    }
    if (updates.anneeScolaire !== undefined) {
      setClauses.push(`annee = $${p++}`)
      values.push(parseAnneeAsInt(updates.anneeScolaire))
    }

    values.push(id)
    await query(
      `UPDATE "SubjectSubmission" SET ${setClauses.join(', ')} WHERE id = $${p}`,
      values
    )
    return { success: true as const }
  } catch (error) {
    console.error('saveSubjectDraft:', error)
    return { success: false as const, error: (error as Error).message || 'Erreur de sauvegarde' }
  }
}

// ─── submitSubject ───────────────────────────────────────────────

export async function submitSubject(id: string) {
  const contributor = await getAuthenticatedContributor()
  if (!contributor) return { success: false as const, error: 'Non autorisé' }

  try {
    const res = await query('SELECT * FROM "SubjectSubmission" WHERE id = $1', [id])
    const sub = res.rows[0]
    if (!sub || sub.authorId !== contributor.userId) {
      return { success: false as const, error: 'Non autorisé' }
    }

    const errors: string[] = []
    if (!sub.title?.trim()) errors.push('Titre requis')
    if (!sub.matiere) errors.push('Matière requise')
    if (!sub.examType) errors.push('Type d\'examen requis')
    if (!sub.anneeScolaire) errors.push('Année requise')
    if (!sub.prix || sub.prix <= 0) errors.push('Prix requis (> 0 Ar)')

    const content = sub.content as { content?: unknown[] } | null
    const hasContent = content?.content && Array.isArray(content.content) && content.content.length > 0
    if (!hasContent) errors.push('Le contenu de l\'éditeur ne peut pas être vide')

    if (errors.length > 0) return { success: false as const, errors }

    await query(
      'UPDATE "SubjectSubmission" SET status = $1, "updatedAt" = NOW() WHERE id = $2',
      ['SUBMITTED', id]
    )
    revalidatePath('/contributeur/sujets')
    return { success: true as const }
  } catch (error) {
    console.error('submitSubject:', error)
    return { success: false as const, error: (error as Error).message || 'Erreur lors de la soumission' }
  }
}

// ─── getSubjectDraft ─────────────────────────────────────────────

export async function getSubjectDraft(id: string) {
  const contributor = await getAuthenticatedContributor()
  if (!contributor) return null

  try {
    await ensureTable()
    const res = await query(
      'SELECT * FROM "SubjectSubmission" WHERE id = $1 AND "authorId" = $2',
      [id, contributor.userId]
    )
    return res.rows[0] || null
  } catch (error) {
    console.error('getSubjectDraft:', error)
    return null
  }
}
