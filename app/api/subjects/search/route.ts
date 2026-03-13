import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const q = searchParams.get('q')?.trim() || ''
  const limit = parseInt(searchParams.get('limit') || '5', 10)

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    const subjects = await prisma.subject.findMany({
      where: {
        OR: [
          { titre: { contains: q, mode: 'insensitive' } },
          { matiere: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        titre: true,
        matiere: true,
      },
      take: limit * 2,
      orderBy: { createdAt: 'desc' },
    })

    const suggestions = Array.from(
      new Set([
        ...subjects.map((s) => s.titre),
        ...subjects.map((s) => s.matiere),
      ])
    ).slice(0, limit)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des suggestions' },
      { status: 500 }
    )
  }
}
