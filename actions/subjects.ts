'use server'

import { prisma } from '@/lib/prisma'
import { ExamenType, Difficulte, Langue, Format, Badge, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

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

export async function getSubjects(filters: SubjectFilters = {}, userId?: string) {
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
        include: userId ? {
          purchases: {
            where: { userId, status: 'COMPLETED' }
          }
        } : undefined
      }),
      prisma.subject.count({ where })
    ])

    // Mapper pour inclure isUnlocked
    const subjectsWithAccess = subjects.map(s => ({
      ...s,
      isUnlocked: userId ? s.purchases.length > 0 : false
    }))

    return {
      subjects: subjectsWithAccess,
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

export async function getSubjectById(id: string, userId?: string) {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        author: {
          select: { prenom: true, nom: true, role: true }
        }
      }
    })

    if (!subject) return null

    let isUnlocked = false
    if (userId) {
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId,
          subjectId: id,
          status: 'COMPLETED'
        }
      })
      isUnlocked = !!purchase
    }

    return { ...subject, isUnlocked }
  } catch (error) {
    console.error('Error fetching subject by id:', error)
    return null
  }
}

export async function purchaseSubject(subjectId: string, userId: string) {
  try {
    // 1. Get subject and user
    const [subject, user] = await Promise.all([
      prisma.subject.findUnique({ where: { id: subjectId } }),
      prisma.user.findUnique({ where: { id: userId } })
    ])

    if (!subject || !user) {
      return { success: false, error: 'Sujet ou utilisateur introuvable' }
    }

    // 2. Check if already purchased
    const existingPurchase = await prisma.purchase.findFirst({
      where: { userId, subjectId, status: 'COMPLETED' }
    })

    if (existingPurchase) {
      return { success: true, alreadyOwned: true }
    }

    // 3. Check credits
    if (user.credits < subject.credits) {
      return { success: false, error: 'Crédits insuffisants' }
    }

    // 4. Transaction: Update credits and create purchase
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: subject.credits } }
      }),
      prisma.purchase.create({
        data: {
          userId,
          subjectId,
          creditsAmount: subject.credits,
          amount: 0, // Transaction en crédits
          status: 'COMPLETED'
        }
      }),
      prisma.creditTransaction.create({
        data: {
          userId,
          amount: -subject.credits,
          type: 'SPEND',
          description: `Achat du sujet: ${subject.titre}`,
          status: 'COMPLETED'
        }
      })
    ])

    revalidatePath('/catalogue')
    revalidatePath(`/sujet/${subjectId}`)

    return { success: true }
  } catch (error) {
    console.error('Error purchasing subject:', error)
    return { success: false, error: 'Erreur lors de la transaction' }
  }
}
