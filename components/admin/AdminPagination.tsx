'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface AdminPaginationProps {
  currentPage: number
  totalPages: number
  totalItems?: number
  itemsPerPage?: number
  onPageChange: (page: number) => void
  className?: string
}

export function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  className = ''
}: AdminPaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0)

  return (
    <div className={`admin-pagination ${className}`}>
      <div className="admin-pagination-info">
        {totalItems && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
            Affichage de {startItem} à {endItem} sur {totalItems} résultats
          </span>
        )}
      </div>

      <div className="admin-pagination-controls">
        <button
          className="admin-pagination-btn"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="Première page"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          className="admin-pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Page précédente"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="admin-pagination-pages">
          {getPageNumbers().map((page, index) =>
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="admin-pagination-ellipsis">
                ...
              </span>
            ) : (
              <button
                key={page}
                className={`admin-pagination-btn ${currentPage === page ? 'admin-pagination-btn-active' : ''}`}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          className="admin-pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Page suivante"
        >
          <ChevronRight size={16} />
        </button>

        <button
          className="admin-pagination-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Dernière page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  )
}
