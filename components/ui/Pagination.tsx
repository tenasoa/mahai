'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  totalItems?: number
  showPageSizeSelector?: boolean
  pageSizes?: number[]
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  totalItems,
  showPageSizeSelector = false,
  pageSizes = [10, 20, 50, 100]
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()
  const startItem = totalItems ? (currentPage - 1) * pageSize + 1 : 0
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : 0

  return (
    <div className="pagination-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 1.25rem',
      background: 'var(--surface)',
      borderTop: '1px solid var(--b1)',
      borderRadius: '0 0 var(--r-lg) var(--r-lg)',
      fontFamily: 'var(--mono)',
      fontSize: '0.75rem',
      color: 'var(--text-3)'
    }}>
      {/* Page size selector */}
      {showPageSizeSelector && onPageSizeChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Par page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--b1)',
              borderRadius: 'var(--r)',
              padding: '0.25rem 0.5rem',
              color: 'var(--text)',
              fontFamily: 'var(--mono)',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            {pageSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      )}

      {/* Items count */}
      {totalItems !== undefined && (
        <div style={{ flex: 1, textAlign: 'center' }}>
          {startItem}-{endItem} sur {totalItems}
        </div>
      )}

      {/* Pagination controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={{
            padding: '0.35rem 0.5rem',
            background: currentPage === 1 ? 'transparent' : 'var(--card)',
            border: '1px solid var(--b1)',
            borderRadius: 'var(--r)',
            color: currentPage === 1 ? 'var(--text-4)' : 'var(--text-3)',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.borderColor = 'var(--gold-line)'
              e.currentTarget.style.color = 'var(--gold)'
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.borderColor = 'var(--b1)'
              e.currentTarget.style.color = 'var(--text-3)'
            }
          }}
          title="Première page"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '0.35rem 0.5rem',
            background: currentPage === 1 ? 'transparent' : 'var(--card)',
            border: '1px solid var(--b1)',
            borderRadius: 'var(--r)',
            color: currentPage === 1 ? 'var(--text-4)' : 'var(--text-3)',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.borderColor = 'var(--gold-line)'
              e.currentTarget.style.color = 'var(--gold)'
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.borderColor = 'var(--b1)'
              e.currentTarget.style.color = 'var(--text-3)'
            }
          }}
          title="Page précédente"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', margin: '0 0.5rem' }}>
          {pageNumbers.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              style={{
                minWidth: '32px',
                height: '32px',
                padding: '0.25rem 0.5rem',
                background: page === currentPage ? 'var(--gold)' : 'var(--card)',
                border: '1px solid var(--b1)',
                borderRadius: 'var(--r)',
                color: page === currentPage ? 'var(--void)' : 'var(--text-3)',
                fontFamily: 'var(--mono)',
                fontSize: '0.75rem',
                fontWeight: page === currentPage ? 600 : 400,
                cursor: page === '...' ? 'default' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (page !== '...' && page !== currentPage) {
                  e.currentTarget.style.borderColor = 'var(--gold-line)'
                  e.currentTarget.style.color = 'var(--gold)'
                }
              }}
              onMouseLeave={(e) => {
                if (page !== '...' && page !== currentPage) {
                  e.currentTarget.style.borderColor = 'var(--b1)'
                  e.currentTarget.style.color = 'var(--text-3)'
                }
              }}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '0.35rem 0.5rem',
            background: currentPage === totalPages ? 'transparent' : 'var(--card)',
            border: '1px solid var(--b1)',
            borderRadius: 'var(--r)',
            color: currentPage === totalPages ? 'var(--text-4)' : 'var(--text-3)',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.borderColor = 'var(--gold-line)'
              e.currentTarget.style.color = 'var(--gold)'
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.borderColor = 'var(--b1)'
              e.currentTarget.style.color = 'var(--text-3)'
            }
          }}
          title="Page suivante"
        >
          <ChevronRight size={16} />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={{
            padding: '0.35rem 0.5rem',
            background: currentPage === totalPages ? 'transparent' : 'var(--card)',
            border: '1px solid var(--b1)',
            borderRadius: 'var(--r)',
            color: currentPage === totalPages ? 'var(--text-4)' : 'var(--text-3)',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.borderColor = 'var(--gold-line)'
              e.currentTarget.style.color = 'var(--gold)'
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.borderColor = 'var(--b1)'
              e.currentTarget.style.color = 'var(--text-3)'
            }
          }}
          title="Dernière page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  )
}
