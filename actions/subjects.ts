'use server'

import { revalidatePath } from 'next/cache'
import { getSubjects as getSubjectsFromDB, getSubjectById as getSubjectByIdFromDB } from '@/lib/sql-queries'
import { purchaseSubject as purchaseSubjectFromDB } from '@/actions/user'

export interface SubjectFilters {
  search?: string
  types?: string[]
  matiere?: string
  difficultes?: string[]
  langues?: string[]
  formats?: string[]
  minRating?: number
  maxPrice?: number
  page?: number
  limit?: number
  sortBy?: 'recent' | 'rating' | 'price_asc' | 'price_desc' | 'relevance'
}

export async function getSubjectsAction(filters: SubjectFilters = {}, userId?: string) {
  try {
    return await getSubjectsFromDB(filters, userId)
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
    return await getSubjectByIdFromDB(id, userId)
  } catch (error) {
    console.error('Error fetching subject by id:', error)
    return null
  }
}

export { purchaseSubjectFromDB as purchaseSubject }
