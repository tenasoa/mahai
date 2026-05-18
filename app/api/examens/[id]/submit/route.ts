import { NextResponse } from 'next/server'

/**
 * Endpoint DÉSACTIVÉ — la fonctionnalité « examens blancs » est en pause.
 *
 * L'ancienne implémentation présentait une faille critique (audit sécurité) :
 * elle créditait `balanceAr` sans vérifier que l'examen appartenait à
 * l'utilisateur ni empêcher la re-soumission → farming de crédits illimité.
 *
 * À la réimplémentation de la feature, NE PAS restaurer le code tel quel.
 * Corriger impérativement avant réactivation :
 *  1. Vérifier la propriété : `exam.userId === auth.userId` (sinon 403).
 *  2. Idempotence : refuser si l'examen est déjà SUBMITTED/GRADED
 *     (UPDATE conditionnel + contrôle du rowCount).
 *  3. Englober mise à jour de l'examen + crédit du solde + Transaction
 *     dans une seule transaction atomique.
 *
 * L'implémentation d'origine reste disponible dans l'historique git.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'La soumission d’examens est temporairement indisponible.' },
    { status: 503 },
  )
}
