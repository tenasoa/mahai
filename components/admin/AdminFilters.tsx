'use client'

import { Search, X, Filter } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface AdminFiltersProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: {
    label: string
    options: FilterOption[]
    value?: string
    onChange?: (value: string) => void
  }[]
  onClear?: () => void
  className?: string
}

export function AdminFilters({
  searchPlaceholder = 'Rechercher...',
  searchValue = '',
  onSearchChange,
  filters = [],
  onClear,
  className = ''
}: AdminFiltersProps) {
  const hasActiveFilters = searchValue || filters.some(f => f.value && f.value !== 'ALL')

  return (
    <div className={`admin-filters ${className}`}>
      {/* Search */}
      <div className="admin-filters-search">
        <div className="admin-search-input">
          <Search size={16} style={{ color: 'var(--text-3)' }} />
          <input
            type="text"
            className="admin-input"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            style={{ paddingLeft: '2.5rem', border: 'none', background: 'transparent', boxShadow: 'none' }}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange?.('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '0.25rem' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      {filters.length > 0 && (
        <div className="admin-filters-tabs">
          {filters.map((filter, filterIndex) => (
            <div key={filterIndex} className="admin-filter-group">
              <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '0.5rem' }}>
                {filter.label}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {filter.options.map((option) => {
                  const isActive = filter.value === option.value || (!filter.value && option.value === 'ALL')
                  return (
                    <button
                      key={option.value}
                      className={`admin-filter-chip ${isActive ? 'active' : ''}`}
                      onClick={() => filter.onChange?.(option.value)}
                    >
                      {option.label}
                      {option.count !== undefined && (
                        <span style={{ marginLeft: '0.25rem', opacity: 0.7 }}>
                          ({option.count})
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && onClear && (
        <button className="admin-clear-filters" onClick={onClear}>
          <Filter size={14} />
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Effacer les filtres
          </span>
        </button>
      )}
    </div>
  )
}
