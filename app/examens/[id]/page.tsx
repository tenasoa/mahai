import { Suspense } from 'react'
import { db } from '@/lib/db-client'
import ExamTakingClient from './page.client'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ExamenDetailSkeleton } from '@/components/ui/PageSkeletons'

interface ExamPageProps {
  params: Promise<{ id: string }>
}

export default async function ExamPage({ params }: ExamPageProps) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const exam = await db.examenBlanc.findUnique({
    where: { id },
  })

  if (!exam) {
    redirect('/examens')
  }

  // Charger les vraies questions depuis la DB
  let questions = await db.questionExamen.findMany({
    where: { examenId: id },
    orderBy: { numero: 'asc' },
  })

  // Si aucune question en DB, générer des questions de fallback basées sur le sujet
  if (!questions || questions.length === 0) {
    const nbQuestions = 3
    questions = Array.from({ length: nbQuestions }, (_, i) => ({
      id: `fallback-q${i + 1}`,
      numero: i + 1,
      texte: `Question ${i + 1} — ${exam.matiere || 'Exercice'} (${exam.annee || ''})`,
      type: 'réponse',
      points: 5,
      examenId: id,
    }))
  }

  // Normaliser le type pour le client
  const normalizedQuestions = questions.map((q: any) => ({
    id: q.id,
    numero: q.numero,
    texte: q.texte,
    type: (q.type === 'réponse' || q.type === 'rponse' || q.type === 'libre') ? '郎答' : q.type,
    options: q.options ? (Array.isArray(q.options) ? q.options : JSON.parse(q.options)) : undefined,
    points: q.points,
  }))

  return (
    <Suspense fallback={<ExamenDetailSkeleton />}>
      <ExamTakingClient exam={{ ...exam, questions: normalizedQuestions }} />
    </Suspense>
  )
}
