import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { answers } = body

    const exam = await prisma.examenBlanc.findUnique({
      where: { id },
    })

    if (!exam) {
      return NextResponse.json({ error: 'Examen non trouvé' }, { status: 404 })
    }

    let score = 0
    const correctAnswers: Record<string, string> = {
      q1: '3x² + 4x - 5',
      q2: 'x² + x + C',
      q3: '4',
    }

    if (answers) {
      Object.entries(answers).forEach(([questionId, answer]) => {
        if (correctAnswers[questionId] === answer) {
          const questionPoints: Record<string, number> = {
            q1: 5,
            q2: 3,
            q3: 2,
          }
          score += questionPoints[questionId] || 0
        }
      })
    }

    await prisma.examenBlanc.update({
      where: { id },
      data: {
        score,
        submittedAt: new Date(),
        status: 'GRADED',
      },
    })

    await prisma.creditTransaction.create({
      data: {
        userId: session.user.id,
        amount: score > 0 ? Math.floor(score / 10) : 0,
        type: 'EARNED',
        description: `Points examen ${exam.titre}`,
      },
    })

    return NextResponse.json({ score, maxScore: exam.scoreMax || 10 })
  } catch (error) {
    console.error('Error submitting exam:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la soumission' },
      { status: 500 }
    )
  }
}
