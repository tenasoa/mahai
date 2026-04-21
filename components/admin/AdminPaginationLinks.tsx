import Link from 'next/link'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface AdminPaginationLinksProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  buildUrl: (page: number) => string
}

export function AdminPaginationLinks({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  buildUrl,
}: AdminPaginationLinksProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
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
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="admin-pagination">
      <div className="admin-pagination-info">
        Affichage de <strong>{startItem}</strong> à <strong>{endItem}</strong> sur{' '}
        <strong>{totalItems}</strong> résultats
      </div>

      <div className="admin-pagination-controls">
        {currentPage > 1 ? (
          <>
            <Link
              href={buildUrl(1)}
              className="admin-pagination-btn"
              title="Première page"
              aria-label="Première page"
            >
              <ChevronsLeft size={14} />
            </Link>
            <Link
              href={buildUrl(currentPage - 1)}
              className="admin-pagination-btn"
              title="Page précédente"
              aria-label="Page précédente"
            >
              <ChevronLeft size={14} />
            </Link>
          </>
        ) : (
          <>
            <span className="admin-pagination-btn admin-pagination-btn-disabled">
              <ChevronsLeft size={14} />
            </span>
            <span className="admin-pagination-btn admin-pagination-btn-disabled">
              <ChevronLeft size={14} />
            </span>
          </>
        )}

        <div className="admin-pagination-pages">
          {getPageNumbers().map((page, index) =>
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="admin-pagination-ellipsis">
                ···
              </span>
            ) : page === currentPage ? (
              <span
                key={page}
                className="admin-pagination-btn admin-pagination-btn-active"
                aria-current="page"
              >
                {page}
              </span>
            ) : (
              <Link
                key={page}
                href={buildUrl(page as number)}
                className="admin-pagination-btn"
              >
                {page}
              </Link>
            )
          )}
        </div>

        {currentPage < totalPages ? (
          <>
            <Link
              href={buildUrl(currentPage + 1)}
              className="admin-pagination-btn"
              title="Page suivante"
              aria-label="Page suivante"
            >
              <ChevronRight size={14} />
            </Link>
            <Link
              href={buildUrl(totalPages)}
              className="admin-pagination-btn"
              title="Dernière page"
              aria-label="Dernière page"
            >
              <ChevronsRight size={14} />
            </Link>
          </>
        ) : (
          <>
            <span className="admin-pagination-btn admin-pagination-btn-disabled">
              <ChevronRight size={14} />
            </span>
            <span className="admin-pagination-btn admin-pagination-btn-disabled">
              <ChevronsRight size={14} />
            </span>
          </>
        )}
      </div>
    </div>
  )
}
