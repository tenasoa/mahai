'use client'

import { useState, useEffect } from 'react'

interface FilterState {
  types: string[]
  matieres: string[]
  annees: string[]
  maxCredits: number
  hasCorrectionIa: boolean
  hasCorrectionProf: boolean
}

interface FilterSidebarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

const examTypes = ['BAC', 'BEPC', 'CEPE', 'CONCOURS']
const matieres = ['Maths', 'Physique', 'SVT', 'Histoire-Géo', 'Français', 'Anglais', 'Philosophie', 'Économie']
const annees = ['2025', '2024', '2023', '2022', '2021', '2020']

export function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const toggleArrayFilter = (key: 'types' | 'matieres' | 'annees', value: string) => {
    const current = localFilters[key]
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    updateFilter(key, updated)
  }

  const resetFilters = () => {
    const reset: FilterState = {
      types: [],
      matieres: [],
      annees: [],
      maxCredits: 100,
      hasCorrectionIa: false,
      hasCorrectionProf: false,
    }
    setLocalFilters(reset)
    onFilterChange(reset)
  }

  const hasActiveFilters = 
    localFilters.types.length > 0 ||
    localFilters.matieres.length > 0 ||
    localFilters.annees.length > 0 ||
    localFilters.maxCredits < 100 ||
    localFilters.hasCorrectionIa ||
    localFilters.hasCorrectionProf

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filtres</h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Type d'examen</h4>
          <div className="space-y-2">
            {examTypes.map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.types.includes(type)}
                  onChange={() => toggleArrayFilter('types', type)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Matière</h4>
          <div className="space-y-2">
            {matieres.map(matiere => (
              <label key={matiere} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.matieres.includes(matiere)}
                  onChange={() => toggleArrayFilter('matieres', matiere)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">{matiere}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Année</h4>
          <div className="space-y-2">
            {annees.map(annee => (
              <label key={annee} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.annees.includes(annee)}
                  onChange={() => toggleArrayFilter('annees', annee)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">{annee}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Prix maximum: {localFilters.maxCredits} crédits
          </h4>
          <input
            type="range"
            min="0"
            max="100"
            value={localFilters.maxCredits}
            onChange={(e) => updateFilter('maxCredits', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>100</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Correction</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.hasCorrectionIa}
                onChange={(e) => updateFilter('hasCorrectionIa', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">🤖 Correction IA</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.hasCorrectionProf}
                onChange={(e) => updateFilter('hasCorrectionProf', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">👨‍🏫 Correction Prof</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { FilterState }
