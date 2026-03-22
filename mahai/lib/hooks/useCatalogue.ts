'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { CatalogueQueryParams, PaginatedResponse, Subject } from '@/types/catalogue'
import { getSubjects } from '@/lib/supabase/subjects'
import { getWishlist, toggleWishlist as toggleWishlistApi } from '@/lib/supabase/wishlist'

interface UseCatalogueOptions {
  initialFilters?: CatalogueQueryParams
  userId?: string
  pageSize?: number
}

interface UseCatalogueReturn {
  // Données
  subjects: Subject[]
  loading: boolean
  error: Error | null

  // Pagination
  pagination: PaginatedResponse<Subject>['pagination']
  currentPage: number
  totalPages: number
  totalItems: number

  // Actions
  setPage: (page: number) => void
  setFilters: (filters: CatalogueQueryParams) => void
  clearFilters: () => void
  refresh: () => Promise<void>

  // Wishlist
  wishedIds: Set<string>
  toggleWishlist: (subjectId: string) => Promise<void>
  isWished: (subjectId: string) => boolean

  // Filtres actuels
  activeFilters: CatalogueQueryParams
}

export function useCatalogue({
  initialFilters = {},
  userId,
  pageSize = 9,
}: UseCatalogueOptions = {}): UseCatalogueReturn {
  // États
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [pagination, setPagination] = useState<PaginatedResponse<Subject>['pagination']>({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: pageSize,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [activeFilters, setActiveFilters] = useState<CatalogueQueryParams>({
    ...initialFilters,
    page: 1,
    limit: pageSize,
  })
  const [wishedIds, setWishedIds] = useState<Set<string>>(new Set())

  // Charger les sujets
  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getSubjects({
        ...activeFilters,
        limit: pageSize,
      })

      setSubjects(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'))
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }, [activeFilters, pageSize, userId])

  // Charger la wishlist
  const fetchWishlist = useCallback(async () => {
    if (!userId) return

    try {
      const items = await getWishlist()
      const ids = new Set(items.map((item) => item.subjectId))
      setWishedIds(ids)
    } catch (err) {
      console.error('Erreur fetch wishlist:', err)
    }
  }, [userId])

  // Initialisation
  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  // Changer de page
  const setPage = useCallback(
    (page: number) => {
      setActiveFilters((prev) => ({ ...prev, page }))
    },
    []
  )

  // Mettre à jour les filtres
  const setFilters = useCallback((filters: CatalogueQueryParams) => {
    setActiveFilters((prev) => ({
      ...prev,
      ...filters,
      page: 1, // Reset à la page 1
    }))
  }, [])

  // Effacer les filtres
  const clearFilters = useCallback(() => {
    setActiveFilters({
      page: 1,
      limit: pageSize,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  }, [pageSize])

  // Refresh manuel
  const refresh = useCallback(async () => {
    await fetchSubjects()
    await fetchWishlist()
  }, [fetchSubjects, fetchWishlist])

  // Toggle wishlist
  const toggleWishlist = useCallback(
    async (subjectId: string) => {
      if (!userId) {
        // Fallback localStorage si pas connecté
        setWishedIds((prev) => {
          const next = new Set(prev)
          if (next.has(subjectId)) {
            next.delete(subjectId)
          } else {
            next.add(subjectId)
          }
          localStorage.setItem('mah-wishlist', JSON.stringify([...next]))
          return next
        })
        return
      }

      const result = await toggleWishlistApi(subjectId)

      if (result.success) {
        setWishedIds((prev) => {
          const next = new Set(prev)
          if (next.has(subjectId)) {
            next.delete(subjectId)
          } else {
            next.add(subjectId)
          }
          return next
        })
      }
    },
    [userId]
  )

  // Vérifier si un sujet est dans la wishlist
  const isWished = useCallback(
    (subjectId: string) => wishedIds.has(subjectId),
    [wishedIds]
  )

  return {
    subjects,
    loading,
    error,
    pagination,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,
    setPage,
    setFilters,
    clearFilters,
    refresh,
    wishedIds,
    toggleWishlist,
    isWished,
    activeFilters,
  }
}
