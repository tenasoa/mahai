'use server'

import { query } from '@/lib/db'
import { revalidatePath } from 'next/cache'

/**
 * Vérifie si une colonne existe dans une table
 */
async function columnExists(table: string, column: string): Promise<boolean> {
  const result = await query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = $1 AND column_name = $2`,
    [table, column]
  )
  return result.rows.length > 0
}

/**
 * Vérifie si une table existe
 */
async function tableExists(table: string): Promise<boolean> {
  const result = await query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_name = $1`,
    [table]
  )
  return result.rows.length > 0
}

/**
 * Convertit un sujet en examen blanc
 * @param subjectId - ID du sujet à convertir
 * @param userId - ID de l'utilisateur qui crée l'examen
 * @returns L'ID de l'examen blanc créé ou une erreur
 */
export async function convertSubjectToExamAction(subjectId: string, userId: string) {
  try {
    // 1. Récupérer le sujet
    const subjectResult = await query(
      'SELECT * FROM "Subject" WHERE id = $1',
      [subjectId]
    )

    if (subjectResult.rows.length === 0) {
      return { success: false, error: 'Sujet introuvable' }
    }

    const subject = subjectResult.rows[0]

    // 2. Vérifier que l'utilisateur a acheté le sujet
    const purchaseResult = await query(
      'SELECT * FROM "Purchase" WHERE "userId" = $1 AND "subjectId" = $2 AND status = $3',
      [userId, subjectId, 'COMPLETED']
    )

    if (purchaseResult.rows.length === 0) {
      return { success: false, error: 'Vous devez posséder ce sujet pour le convertir en examen' }
    }

    // 3. Vérifier si un examen existe déjà pour ce sujet et cet utilisateur
    //    (seulement si la colonne subjectId existe)
    const hasSubjectIdCol = await columnExists('ExamenBlanc', 'subjectId')

    if (hasSubjectIdCol) {
      const existingExam = await query(
        'SELECT id FROM "ExamenBlanc" WHERE "userId" = $1 AND "subjectId" = $2 ORDER BY "createdAt" DESC LIMIT 1',
        [userId, subjectId]
      )
      if (existingExam.rows.length > 0) {
        // Rediriger vers l'examen existant
        return { success: true, examId: existingExam.rows[0].id }
      }
    }

    // 4. Créer l'examen blanc
    const examId = crypto.randomUUID()

    // Durée estimée basée sur les métadonnées du sujet
    const nbExercices = subject.nb_exercices || subject.pages || 5
    const estimatedDurationMinutes = nbExercices * 12 // ~12 min par exercice
    const dureeSecondes = estimatedDurationMinutes * 60

    if (hasSubjectIdCol) {
      // Schéma complet avec subjectId
      await query(
        `INSERT INTO "ExamenBlanc" (
          id,
          titre,
          "typeExamen",
          matiere,
          annee,
          "dureeSecondes",
          "userId",
          "subjectId",
          "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          examId,
          `Examen Blanc — ${subject.titre}`,
          subject.type || 'BAC',
          subject.matiere,
          subject.annee,
          dureeSecondes,
          userId,
          subjectId,
        ]
      )
    } else {
      // Schéma sans subjectId (avant migration)
      await query(
        `INSERT INTO "ExamenBlanc" (
          id,
          titre,
          "typeExamen",
          matiere,
          annee,
          "dureeSecondes",
          "userId",
          "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          examId,
          `Examen Blanc — ${subject.titre}`,
          subject.type || 'BAC',
          subject.matiere,
          subject.annee,
          dureeSecondes,
          userId,
        ]
      )
    }

    // 5. Créer des questions si la table QuestionExamen existe
    const hasQuestionTable = await tableExists('QuestionExamen')

    if (hasQuestionTable) {
      const nbQuestions = subject.nb_exercices || 3

      for (let i = 1; i <= nbQuestions; i++) {
        const questionId = crypto.randomUUID()
        await query(
          `INSERT INTO "QuestionExamen" (
            id,
            numero,
            texte,
            type,
            points,
            "examenId",
            "createdAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            questionId,
            i,
            `Exercice ${i} — Basé sur le sujet "${subject.matiere}" (${subject.annee})`,
            'réponse',
            subject.bareme ? Math.round(subject.bareme / nbQuestions) : 5,
            examId,
          ]
        )
      }
    }

    revalidatePath('/examens')

    return { success: true, examId }
  } catch (error) {
    console.error('Erreur lors de la conversion du sujet en examen:', error)
    return { success: false, error: 'Erreur lors de la création de l\'examen' }
  }
}
