'use client'

import styles from './ActiveFilters.module.css'

export interface ActiveFilter {
  id: string
  label: string
  value: string
  onRemove?: () => void
}

export interface ActiveFiltersProps {
  filters: ActiveFilter[]
  onClearAll?: () => void
}

export function ActiveFilters({ filters, onClearAll }: ActiveFiltersProps) {
  if (filters.length === 0) {
    return null
  }

  return (
    <div className={styles.activeFilters}>
      <span className={styles.filtersLabel}>Filtres actifs :</span>
      
      {filters.map((filter) => (
        <div key={filter.id} className={styles.filterChip}>
          <span className={styles.filterLabel}>{filter.label}</span>
          <span className={styles.filterValue}>{filter.value}</span>
          {filter.onRemove && (
            <button
              className={styles.removeButton}
              onClick={filter.onRemove}
              aria-label={`Supprimer le filtre ${filter.label}`}
            >
              ×
            </button>
          )}
        </div>
      ))}

      {onClearAll && filters.length > 0 && (
        <button className={styles.clearAllButton} onClick={onClearAll}>
          Tout effacer
        </button>
      )}
    </div>
  )
}

export default ActiveFilters
