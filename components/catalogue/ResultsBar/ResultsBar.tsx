'use client'

import styles from './ResultsBar.module.css'

export interface ResultsBarProps {
  totalResults: number
  currentPage?: number
  totalPages?: number
  searchTerm?: string
  activeFilters?: number
  sortBy?: string
  viewMode?: 'grid' | 'list'
  onSortChange?: (value: string) => void
  onViewModeChange?: (mode: 'grid' | 'list') => void
  onClearFilters?: () => void
}

export function ResultsBar({
  totalResults,
  currentPage = 1,
  totalPages = 1,
  searchTerm = '',
  activeFilters = 0,
  sortBy = 'createdAt',
  viewMode = 'grid',
  onSortChange,
  onViewModeChange,
  onClearFilters,
}: ResultsBarProps) {
  const sortOptions = [
    { value: 'createdAt', label: 'Plus récent' },
    { value: 'title', label: 'Titre (A-Z)' },
    { value: 'price', label: 'Prix croissant' },
    { value: 'rating', label: 'Meilleures notes' },
  ]

  return (
    <div className={styles.resultsBar}>
      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          {totalResults} {totalResults > 1 ? 'résultats' : 'résultat'}
        </span>
        {searchTerm && (
          <span className={styles.searchTerm}>
            pour &quot;{searchTerm}&quot;
          </span>
        )}
        {activeFilters > 0 && (
          <button className={styles.clearFilters} onClick={onClearFilters}>
            {activeFilters} filtre(s) actif(s) · Clear all
          </button>
        )}
      </div>

      <div className={styles.controls}>
        {/* Sort */}
        <div className={styles.sortControl}>
          <label htmlFor="sort-select" className={styles.sortLabel}>
            Trier par
          </label>
          <select
            id="sort-select"
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => onSortChange?.(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode */}
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => onViewModeChange?.('grid')}
            aria-label="Vue grille"
            aria-pressed={viewMode === 'grid'}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => onViewModeChange?.('list')}
            aria-label="Vue liste"
            aria-pressed={viewMode === 'list'}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <rect x="3" y="4" width="18" height="4" rx="1" />
              <rect x="3" y="10" width="18" height="4" rx="1" />
              <rect x="3" y="16" width="18" height="4" rx="1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultsBar
