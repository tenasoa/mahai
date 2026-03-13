import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = 'demo-user-id' // In production, get from session
    const { add } = await request.json()

    if (add) {
      // Add to wishlist
      await prisma.wishlist.upsert({
        where: {
          userId_subjectId: {
            userId,
            subjectId: id,
          },
        },
        update: {},
        create: {
          userId,
          subjectId: id,
        },
      })
    } else {
      // Remove from wishlist
      await prisma.wishlist.delete({
        where: {
          userId_subjectId: {
            userId,
            subjectId: id,
          },
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating wishlist:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des favoris' },
      { status: 500 }
    )
  }
}
