'use server'

import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query as dbQuery } from '@/lib/db'
import type { CatalogueQueryParams, PaginatedResponse, Subject } from '@/types/catalogue'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function getCurrentUserId() {
  const supabaseServer = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser()

  if (error || !user) {
    return null
  }

  return user.id
}

export async function getSubjects(
  params: CatalogueQueryParams
): Promise<PaginatedResponse<Subject>> {
  const {
    page = 1,
    limit = 9,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    types,
    matieres,
    minRating,
    maxCredits,
    search,
  } = params

  try {
    const currentUserId = await getCurrentUserId()

    // Construction de la query avec une jointure pour vérifier les achats
    let query = supabase
      .from('Subject')
      .select(`
        *,
        Purchase!left (
          id,
          userId,
          status
        )
      `, { count: 'exact' })

    // Filtres
    if (types && types.length > 0) {
      query = query.in('type', types)
    }

    if (matieres && matieres.length > 0) {
      query = query.in('matiere', matieres)
    }

    if (minRating !== undefined && minRating > 0) {
      query = query.gte('rating', minRating)
    }

    if (maxCredits !== undefined && maxCredits < 999) {
      query = query.lte('credits', maxCredits)
    }

    // Recherche textuelle multi-critères
    if (search && search.trim()) {
      const searchTerms = search.trim().split(/\s+/).filter(term => term.length > 0)
      
      if (searchTerms.length > 0) {
        searchTerms.forEach((term) => {
          const orConditions = [
            `titre.ilike.%${term}%`,
            `matiere.ilike.%${term}%`,
            `annee.ilike.%${term}%`,
            `serie.ilike.%${term}%`,
            `description.ilike.%${term}%`,
          ]
          
          // Pour l'Enum type, on utilise une comparaison exacte si le mot correspond
          const upperTerm = term.toUpperCase()
          if (['BAC', 'BEPC', 'CEPE'].includes(upperTerm)) {
            orConditions.push(`type.eq.${upperTerm}`)
          }
          
          query = query.or(orConditions.join(','))
        })
      }
    }

    // Tri
    const orderMap: Record<string, string> = {
      rating: 'rating',
      reviewsCount: 'reviewsCount',
      credits: 'credits',
      annee: 'annee',
      createdAt: 'createdAt',
    }

    const orderColumn = orderMap[sortBy] || 'createdAt'
    query = query.order(orderColumn, { ascending: sortOrder === 'asc' })

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    // Exécution
    const { data, error, count } = await query

    if (error) {
      console.error('Erreur fetch subjects:', error)
      throw new Error(`Impossible de récupérer les sujets: ${error.message}`)
    }

    // Transformer les données pour ajouter isUnlocked
    const subjectsWithUnlockStatus = (data || []).map((subject: any) => {
      // Vérifier si l'utilisateur a acheté ce sujet
      const hasPurchase = currentUserId && Array.isArray(subject.Purchase) &&
        subject.Purchase.some((p: any) => p.userId === currentUserId && p.status === 'COMPLETED')
      
      // Return subject with isUnlocked flag
      const { Purchase, ...subjectData } = subject
      return {
        ...subjectData,
        isUnlocked: hasPurchase || false,
      } as Subject
    })

    const totalItems = count || 0
    const totalPages = Math.ceil(totalItems / limit)

    return {
      data: subjectsWithUnlockStatus || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }
  } catch (error) {
    console.error('Erreur getSubjects:', error)
    throw error
  }
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  const currentUserId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('Subject')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erreur fetch subject:', error)
    return null
  }

  let isUnlocked = false

  if (currentUserId && data?.id) {
    try {
      const purchaseById = await dbQuery(
        `SELECT 1
         FROM "Purchase"
         WHERE "userId" = $1
           AND "subjectId" = $2
           AND status = 'COMPLETED'
         LIMIT 1`,
        [currentUserId, data.id]
      )

      if ((purchaseById.rowCount ?? 0) > 0) {
        isUnlocked = true
      } else if (data.titre) {
        // Fallback demandé: considérer le sujet comme débloqué si un achat COMPLETED existe sur un sujet au même titre.
        const purchaseByTitle = await dbQuery(
          `SELECT 1
           FROM "Purchase" p
           JOIN "Subject" s ON s.id = p."subjectId"
           WHERE p."userId" = $1
             AND p.status = 'COMPLETED'
             AND LOWER(TRIM(s.titre)) = LOWER(TRIM($2))
           LIMIT 1`,
          [currentUserId, data.titre]
        )

        isUnlocked = (purchaseByTitle.rowCount ?? 0) > 0
      }
    } catch (purchaseCheckError) {
      console.error('Erreur vérification achat sujet:', purchaseCheckError)
    }
  }

  return {
    ...(data as Subject),
    isUnlocked,
  }
}

export async function getSubjectSuggestions(query: string, limit = 5) {
  if (!query || query.trim().length < 2) {
    return []
  }

  const { data, error } = await supabase
    .from('Subject')
    .select('id, titre, matiere, type, annee')
    .or(`titre.ilike.%${query}%,matiere.ilike.%${query}%`)
    .limit(limit)

  if (error) {
    console.error('Erreur fetch suggestions:', error)
    return []
  }

  return (data || []).map((s) => ({
    id: s.id,
    text: `${s.titre} (${s.matiere} ${s.type} ${s.annee})`,
  }))
}

export async function getFilterOptions() {
  const { data: matieres, error: errMat } = await supabase
    .from('Subject')
    .select('matiere')
    .not('matiere', 'is', null)

  const { data: annees, error: errAnnee } = await supabase
    .from('Subject')
    .select('annee')
    .not('annee', 'is', null)

  const { data: series, error: errSerie } = await supabase
    .from('Subject')
    .select('serie')
    .not('serie', 'is', null)

  if (errMat || errAnnee || errSerie) {
    console.error('Erreur fetch filter options:', { errMat, errAnnee, errSerie })
    return null
  }

  return {
    matieres: [...new Set(matieres?.map((m) => m.matiere).filter(Boolean))] as string[],
    annees: [...new Set(annees?.map((a) => a.annee).filter(Boolean))].sort() as string[],
    series: [...new Set(series?.map((s) => s.serie).filter(Boolean))] as string[],
  }
}
