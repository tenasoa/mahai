import { db } from '@/lib/db-client'
import ExamTakingClient from './page.client'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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

  const questions = [
    {
      id: 'q1',
      numero: 1,
      texte: 'Calculer la dérivée de f(x) = x³ + 2x² - 5x + 1',
      type: '郎答' as const,
      points: 5,
    },
    {
      id: 'q2',
      numero: 2,
      texte: 'Quelle est la primitive de g(x) = 2x + 1 ?',
      type: 'qcm' as const,
      options: [
        'x² + x + C',
        '2x² + x + C',
        'x² + 1 + C',
        '2x + C',
      ],
      points: 3,
    },
    {
      id: 'q3',
      numero: 3,
      texte: 'Résoudre l\'équation: 2x + 5 = 13',
      type: 'numérique' as const,
      points: 2,
    },
  ]

  return <ExamTakingClient exam={{ ...exam, questions }} />
}
