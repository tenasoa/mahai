import { NextResponse } from 'next/server'
import { db } from '@/lib/db-client'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = 'demo-user-id' // In production, get from session

    // Get subject details
    const subject = await db.subject.findUnique({
      where: { id },
    })

    if (!subject) {
      return NextResponse.json(
        { error: 'Sujet non trouvé' },
        { status: 404 }
      )
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Check if already purchased
    const existingPurchase = await db.purchase.findFirst({
      where: {
        userId,
        subjectId: id,
        status: 'COMPLETED',
      },
    })

    if (existingPurchase) {
      return NextResponse.json({
        message: 'Déjà acheté',
        alreadyPurchased: true,
      })
    }

    // Check if user has enough credits
    if (user.credits < subject.credits) {
      return NextResponse.json(
        { error: 'Crédits insuffisants' },
        { status: 400 }
      )
    }

    // Perform purchase in a transaction
    const [purchase] = await db.$transaction([
      // Deduct credits from user
      db.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: subject.credits,
          },
        },
      }),

      // Create purchase record
      db.purchase.create({
        data: {
          userId,
          subjectId: id,
          creditsAmount: subject.credits,
          amount: 0, // Free purchase with credits
          status: 'COMPLETED',
        },
      }),

      // Create credit transaction record
      db.creditTransaction.create({
        data: {
          userId,
          amount: subject.credits,
          type: 'SPEND',
          description: `Achat du sujet: ${subject.titre}`,
          status: 'COMPLETED',
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Achat réussi',
      remainingCredits: user.credits - subject.credits,
    })
  } catch (error) {
    console.error('Error processing purchase:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'achat' },
      { status: 500 }
    )
  }
}
