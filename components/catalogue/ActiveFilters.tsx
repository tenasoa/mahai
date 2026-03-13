'use client'

import { FilterState } from './FilterSidebar'

interface ActiveFiltersProps {
  filters: FilterState
  onRemoveFilter: (key: keyof FilterState, value?: string) => void
  onReset: () => void
}

export function ActiveFilters({ filters, onRemoveFilter, onReset }: ActiveFiltersProps) {
  const hasFilters = 
    filters.types.length > 0 ||
    filters.matieres.length > 0 ||
    filters.annees.length > 0 ||
    filters.maxCredits < 100 ||
    filters.hasCorrectionIa ||
    filters.hasCorrectionProf

  if (!hasFilters) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-gray-500">Filtres actifs:</span>
      
      {filters.types.map(type => (
        <button
          key={type}
          onClick={() => onRemoveFilter('types', type)}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
        >
          {type}
          <span className="text-blue-500">×</span>
        </button>
      ))}
      
      {filters.matieres.map(matiere => (
        <button
          key={matiere}
          onClick={() => onRemoveFilter('matieres', matiere)}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200"
        >
          {matiere}
          <span className="text-green-500">×</span>
        </button>
      ))}
      
      {filters.annees.map(annee => (
        <button
          key={annee}
          onClick={() => onRemoveFilter('annees', annee)}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
        >
          {annee}
          <span className="text-purple-500">×</span>
        </button>
      ))}
      
      {filters.maxCredits < 100 && (
        <button
          onClick={() => onRemoveFilter('maxCredits')}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200"
        >
          ≤{filters.maxCredits} crédits
          <span className="text-orange-500">×</span>
        </button>
      )}
      
      {filters.hasCorrectionIa && (
        <button
          onClick={() => onRemoveFilter('hasCorrectionIa')}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200"
        >
          🤖 IA
          <span className="text-pink-500">×</span>
        </button>
      )}
      
      {filters.hasCorrectionProf && (
        <button
          onClick={() => onRemoveFilter('hasCorrectionProf')}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-teal-100 text-teal-700 rounded-full hover:bg-teal-200"
        >
          👨‍🏫 Prof
          <span className="text-teal-500">×</span>
        </button>
      )}
      
      <button
        onClick={onReset}
        className="text-sm text-red-600 hover:text-red-700 underline"
      >
        Tout effacer
      </button>
    </div>
  )
}
