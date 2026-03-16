'use server'

import { createClient } from '@supabase/supabase-js'
import type { CatalogueQueryParams, PaginatedResponse, Subject } from '@/types/catalogue'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function getSubjects(
  params: CatalogueQueryParams & { userId?: string }
): Promise<PaginatedResponse<Subject>> {
  const {
    page = 1,
    limit = 9,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    types,
    matieres,
    annees,
    difficultes,
    langues,
    formats,
    badges,
    minRating,
    maxCredits,
    search,
    featured,
    userId,
  } = params

  try {
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

    if (annees && annees.length > 0) {
      query = query.in('annee', annees)
    }

    if (difficultes && difficultes.length > 0) {
      query = query.in('difficulte', difficultes)
    }

    if (langues && langues.length > 0) {
      query = query.in('langue', langues)
    }

    if (formats && formats.length > 0) {
      query = query.in('format', formats)
    }

    if (badges && badges.length > 0) {
      query = query.in('badge', badges)
    }

    if (minRating !== undefined && minRating > 0) {
      query = query.gte('rating', minRating)
    }

    if (maxCredits !== undefined && maxCredits < 999) {
      query = query.lte('credits', maxCredits)
    }

    if (featured !== undefined) {
      query = query.eq('featured', featured)
    }

    // Recherche textuelle multi-critères
    if (search && search.trim()) {
      const searchTerms = search.trim().split(/\s+/).filter(term => term.length > 0)
      
      if (searchTerms.length > 0) {
        // Pour chaque mot, il doit correspondre à au moins une des colonnes
        searchTerms.forEach((term) => {
          const orConditions = [
            `titre.ilike.%${term}%`,
            `matiere.ilike.%${term}%`,
            `type.ilike.%${term}%`,
            `annee.ilike.%${term}%`,
            `serie.ilike.%${term}%`,
            `description.ilike.%${term}%`,
          ]
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
      const hasPurchase = userId && Array.isArray(subject.Purchase) && 
        subject.Purchase.some((p: any) => p.userId === userId && p.status === 'COMPLETED')
      
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
  const { data, error } = await supabase
    .from('Subject')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erreur fetch subject:', error)
    return null
  }

  return data as Subject
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
