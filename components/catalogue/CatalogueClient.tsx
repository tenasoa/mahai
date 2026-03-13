'use client'

import { useState, useEffect, useCallback } from 'react'
import { SubjectCard } from '@/components/catalogue/SubjectCard'
import { ViewToggle, type ViewMode } from '@/components/catalogue/ViewToggle'
import { Pagination } from '@/components/catalogue/Pagination'
import { FilterSidebar, type FilterState } from '@/components/catalogue/FilterSidebar'
import { ActiveFilters } from '@/components/catalogue/ActiveFilters'
import { SearchBar } from '@/components/catalogue/SearchBar'

interface Subject {
  id: string
  titre: string
  type: string
  matiere: string
  annee: string
  credits: number
  hasCorrectionIa: boolean
  hasCorrectionProf: boolean
}

interface CatalogueClientProps {
  initialSubjects: Subject[]
  initialPage: number
  totalPages: number
  initialQuery?: string
}

const defaultFilters: FilterState = {
  types: [],
  matieres: [],
  annees: [],
  maxCredits: 100,
  hasCorrectionIa: false,
  hasCorrectionProf: false,
}

export function CatalogueClient({ initialSubjects, initialPage, totalPages, initialQuery = '' }: CatalogueClientProps) {
  const [subjects, setSubjects] = useState(initialSubjects)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [total, setTotal] = useState(totalPages)
  const [viewMode, setViewMode] = useState<ViewMode>('grid-3')
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [loading, setLoading] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  useEffect(() => {
    const saved = localStorage.getItem('catalogue-view-mode') as ViewMode
    if (saved) {
      setViewMode(saved)
    }
  }, [])

  const fetchSubjects = useCallback(async (page: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      })

      if (filters.types.length > 0) params.append('types', filters.types.join(','))
      if (filters.matieres.length > 0) params.append('matieres', filters.matieres.join(','))
      if (filters.annees.length > 0) params.append('annees', filters.annees.join(','))
      if (filters.maxCredits < 100) params.append('maxCredits', filters.maxCredits.toString())
      if (filters.hasCorrectionIa) params.append('hasCorrectionIa', 'true')
      if (filters.hasCorrectionProf) params.append('hasCorrectionProf', 'true')
      if (searchQuery && searchQuery.length >= 2) params.append('q', searchQuery)

      const res = await fetch(`/api/subjects?${params.toString()}`)
      const data = await res.json()
      setSubjects(data.subjects || [])
      setCurrentPage(data.currentPage || 1)
      setTotal(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, searchQuery])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    fetchSubjects(1)
  }

  const handleRemoveFilter = (key: keyof FilterState, value?: string) => {
    const newFilters = { ...filters }
    if (value && Array.isArray(newFilters[key])) {
      (newFilters[key] as string[]) = (newFilters[key] as string[]).filter(v => v !== value)
    } else if (key === 'maxCredits') {
      newFilters.maxCredits = 100
    } else {
      (newFilters as any)[key] = false
    }
    setFilters(newFilters)
    fetchSubjects(1)
  }

  const handleReset = () => {
    setFilters(defaultFilters)
    fetchSubjects(1)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    fetchSubjects(1)
  }

  const gridClasses = {
    'grid-3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    'grid-2': 'grid-cols-1 md:grid-cols-2 gap-6',
    'list': 'grid-cols-1 gap-4',
  }

  return (
    <div className="flex gap-6">
      <div className="hidden lg:block w-64 flex-shrink-0">
        <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
      </div>

      <div className="flex-1">
        <div className="mb-4">
          <SearchBar initialQuery={initialQuery} onSearch={handleSearch} />
        </div>

        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full py-2 px-4 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {showMobileFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </button>
          {showMobileFilters && (
            <div className="mt-4">
              <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              {subjects.length} résultat(s)
            </p>
            <ViewToggle initialMode={viewMode} onChange={setViewMode} />
          </div>
        </div>

        <ActiveFilters
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onReset={handleReset}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun sujet ne correspond à vos filtres</p>
            <button
              onClick={handleReset}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className={`grid ${gridClasses[viewMode]}`}>
            {subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} viewMode={viewMode} />
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={total}
          onPageChange={fetchSubjects}
        />
      </div>
    </div>
  )
}
