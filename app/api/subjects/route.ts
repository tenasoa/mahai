import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '12', 10)
  
  const types = searchParams.get('types')?.split(',').filter(Boolean) || []
  const matieres = searchParams.get('matieres')?.split(',').filter(Boolean) || []
  const annees = searchParams.get('annees')?.split(',').filter(Boolean) || []
  const maxCredits = parseInt(searchParams.get('maxCredits') || '100', 10)
  const hasCorrectionIa = searchParams.get('hasCorrectionIa') === 'true'
  const hasCorrectionProf = searchParams.get('hasCorrectionProf') === 'true'
  const q = searchParams.get('q')?.trim()
  
  const skip = (page - 1) * limit

  const where: any = {}

  if (types.length > 0) {
    where.type = { in: types }
  }
  
  if (matieres.length > 0) {
    where.matiere = { in: matieres }
  }
  
  if (annees.length > 0) {
    where.annee = { in: annees }
  }
  
  where.credits = { lte: maxCredits }
  
  if (hasCorrectionIa) {
    where.hasCorrectionIa = true
  }
  
  if (hasCorrectionProf) {
    where.hasCorrectionProf = true
  }

  if (q && q.length >= 2) {
    where.OR = [
      { titre: { contains: q, mode: 'insensitive' } },
      { matiere: { contains: q, mode: 'insensitive' } },
    ]
  }

  try {
    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subject.count({ where }),
    ])

    return NextResponse.json({
      subjects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sujets' },
      { status: 500 }
    )
  }
}
