'use server'

import { prisma } from '@/lib/prisma'
import { ExamenType, Difficulte, Langue, Format, Badge, Prisma } from '@prisma/client'

export interface SubjectFilters {
  search?: string
  types?: ExamenType[]
  matiere?: string
  difficultes?: Difficulte[]
  langues?: Langue[]
  formats?: Format[]
  minRating?: number
  maxPrice?: number
  page?: number
  limit?: number
  sortBy?: 'recent' | 'rating' | 'price_asc' | 'price_desc' | 'relevance'
}

export async function getSubjects(filters: SubjectFilters = {}) {
  const {
    search,
    types,
    matiere,
    difficultes,
    langues,
    formats,
    minRating,
    maxPrice,
    page = 1,
    limit = 9,
    sortBy = 'relevance'
  } = filters

  const skip = (page - 1) * limit

  const where: Prisma.SubjectWhereInput = {
    AND: [
      search ? {
        OR: [
          { titre: { contains: search, mode: 'insensitive' } },
          { matiere: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      } : {},
      types && types.length > 0 ? { type: { in: types } } : {},
      matiere ? { matiere: { equals: matiere } } : {},
      difficultes && difficultes.length > 0 ? { difficulte: { in: difficultes } } : {},
      langues && langues.length > 0 ? { langue: { in: langues } } : {},
      formats && formats.length > 0 ? { format: { in: formats } } : {},
      minRating ? { rating: { gte: minRating } } : {},
      maxPrice !== undefined ? { credits: { lte: maxPrice } } : {},
    ]
  }

  let orderBy: Prisma.SubjectOrderByWithRelationInput = {}
  
  switch (sortBy) {
    case 'recent':
      orderBy = { createdAt: 'desc' }
      break
    case 'rating':
      orderBy = { rating: 'desc' }
      break
    case 'price_asc':
      orderBy = { credits: 'asc' }
      break
    case 'price_desc':
      orderBy = { credits: 'desc' }
      break
    case 'relevance':
    default:
      orderBy = { featured: 'desc' }
  }

  try {
    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.subject.count({ where })
    ])

    return {
      subjects,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    }
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return {
      subjects: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
      error: 'Erreur lors de la récupération des sujets'
    }
  }
}
