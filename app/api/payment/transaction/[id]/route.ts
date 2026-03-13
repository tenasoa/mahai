import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const transaction = await prisma.creditTransaction.findUnique({
      where: { id },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Get user separately to avoid Prisma type issues
    const user = await prisma.user.findUnique({
      where: { id: transaction.userId },
      select: {
        email: true,
        credits: true,
      },
    })

    return NextResponse.json({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      createdAt: transaction.createdAt,
      user: user ? {
        email: user.email,
        credits: user.credits,
      } : null,
    })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la transaction' },
      { status: 500 }
    )
  }
}
