"use client";

import { useId, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
  showPageSizeSelector?: boolean;
  pageSizes?: number[];
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  totalItems,
  showPageSizeSelector = false,
  pageSizes = [10, 20, 50, 100],
}: PaginationProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = isMobile ? 5 : 7;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageSizeId = useId();
  const pageNumbers = getPageNumbers();
  const startItem = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : 0;

  return (
    <>
      <div
        className="pagination-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "var(--pg-justify, space-between)",
          flexWrap: "wrap",
          gap: "var(--pg-container-gap, 0.75rem)",
          padding: "var(--pg-container-padding, 1rem 1.25rem)",
          background: "var(--surface)",
          borderTop: "1px solid var(--b1)",
          borderRadius: "0 0 var(--r-lg) var(--r-lg)",
          fontFamily: "var(--mono)",
          fontSize: "0.75rem",
          color: "var(--text-3)",
        }}
      >
        {/* Page size selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <div
            className="page-size-selector"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexBasis: "var(--pg-selector-basis, auto)",
              order: "var(--pg-selector-order, 0)",
            }}
          >
            <label htmlFor={pageSizeId}>Par page:</label>
            <select
              id={pageSizeId}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                background: "var(--card)",
                border: "1px solid var(--b1)",
                borderRadius: "var(--r)",
                padding: "0.25rem 0.5rem",
                color: "var(--text)",
                fontFamily: "var(--mono)",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Items count */}
        {totalItems !== undefined && (
          <div
            className="items-count"
            style={{
              flex: "var(--pg-items-flex, 1)",
              textAlign: "center",
              flexBasis: "var(--pg-items-basis, auto)",
              order: "var(--pg-items-order, 0)",
            }}
          >
            {startItem}-{endItem} sur {totalItems}
          </div>
        )}

        {/* Pagination controls */}
        <div
          className="pagination-controls"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--pg-controls-gap, 0.25rem)",
          }}
        >
          {/* First page */}
          <button
            className="nav-btn first-last-btn"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            style={{
              minWidth: "var(--pg-nav-min-w, 44px)",
              minHeight: "var(--pg-nav-min-h, 44px)",
              padding: "0.35rem 0.5rem",
              background: currentPage === 1 ? "transparent" : "var(--card)",
              border: "1px solid var(--b1)",
              borderRadius: "var(--r)",
              color: currentPage === 1 ? "var(--text-4)" : "var(--text-3)",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
              transition: "all 0.2s",
              display: "var(--pg-first-last-display, flex)",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.borderColor = "var(--gold-line)";
                e.currentTarget.style.color = "var(--gold)";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.borderColor = "var(--b1)";
                e.currentTarget.style.color = "var(--text-3)";
              }
            }}
            title="Première page"
            aria-label="Première page"
          >
            <ChevronsLeft size={16} />
          </button>

          {/* Previous page */}
          <button
            className="nav-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              minWidth: "var(--pg-nav-min-w, 44px)",
              minHeight: "var(--pg-nav-min-h, 44px)",
              padding: "0.35rem 0.5rem",
              background: currentPage === 1 ? "transparent" : "var(--card)",
              border: "1px solid var(--b1)",
              borderRadius: "var(--r)",
              color: currentPage === 1 ? "var(--text-4)" : "var(--text-3)",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.borderColor = "var(--gold-line)";
                e.currentTarget.style.color = "var(--gold)";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.borderColor = "var(--b1)";
                e.currentTarget.style.color = "var(--text-3)";
              }
            }}
            title="Page précédente"
            aria-label="Page précédente"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          <div
            className="page-numbers"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--pg-numbers-gap, 0.25rem)",
              margin: "var(--pg-numbers-margin, 0 0.5rem)",
            }}
          >
            {pageNumbers.map((page, index) => (
              <button
                key={index}
                className="page-btn"
                onClick={() => typeof page === "number" && onPageChange(page)}
                disabled={page === "..."}
                {...(page === currentPage
                  ? { "aria-current": "page" as const }
                  : {})}
                style={{
                  minWidth: "var(--pg-btn-min-w, 44px)",
                  height: "var(--pg-btn-h, 44px)",
                  padding: "0.25rem 0.5rem",
                  background:
                    page === currentPage ? "var(--gold)" : "var(--card)",
                  border: "1px solid var(--b1)",
                  borderRadius: "var(--r)",
                  color: page === currentPage ? "var(--void)" : "var(--text-3)",
                  fontFamily: "var(--mono)",
                  fontSize: "0.75rem",
                  fontWeight: page === currentPage ? 600 : 400,
                  cursor: page === "..." ? "default" : "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  if (page !== "..." && page !== currentPage) {
                    e.currentTarget.style.borderColor = "var(--gold-line)";
                    e.currentTarget.style.color = "var(--gold)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== "..." && page !== currentPage) {
                    e.currentTarget.style.borderColor = "var(--b1)";
                    e.currentTarget.style.color = "var(--text-3)";
                  }
                }}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next page */}
          <button
            className="nav-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              minWidth: "var(--pg-nav-min-w, 44px)",
              minHeight: "var(--pg-nav-min-h, 44px)",
              padding: "0.35rem 0.5rem",
              background:
                currentPage === totalPages ? "transparent" : "var(--card)",
              border: "1px solid var(--b1)",
              borderRadius: "var(--r)",
              color:
                currentPage === totalPages ? "var(--text-4)" : "var(--text-3)",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? 0.5 : 1,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.borderColor = "var(--gold-line)";
                e.currentTarget.style.color = "var(--gold)";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.borderColor = "var(--b1)";
                e.currentTarget.style.color = "var(--text-3)";
              }
            }}
            title="Page suivante"
            aria-label="Page suivante"
          >
            <ChevronRight size={16} />
          </button>

          {/* Last page */}
          <button
            className="nav-btn first-last-btn"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            style={{
              minWidth: "var(--pg-nav-min-w, 44px)",
              minHeight: "var(--pg-nav-min-h, 44px)",
              padding: "0.35rem 0.5rem",
              background:
                currentPage === totalPages ? "transparent" : "var(--card)",
              border: "1px solid var(--b1)",
              borderRadius: "var(--r)",
              color:
                currentPage === totalPages ? "var(--text-4)" : "var(--text-3)",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? 0.5 : 1,
              transition: "all 0.2s",
              display: "var(--pg-first-last-display, flex)",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.borderColor = "var(--gold-line)";
                e.currentTarget.style.color = "var(--gold)";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.borderColor = "var(--b1)";
                e.currentTarget.style.color = "var(--text-3)";
              }
            }}
            title="Dernière page"
            aria-label="Dernière page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
      <style jsx>{`
        .pagination-container {
          --pg-justify: space-between;
          --pg-container-gap: 0.75rem;
          --pg-container-padding: 1rem 1.25rem;
          --pg-btn-min-w: 44px;
          --pg-btn-h: 44px;
          --pg-nav-min-w: 44px;
          --pg-nav-min-h: 44px;
          --pg-first-last-display: flex;
          --pg-controls-gap: 0.25rem;
          --pg-numbers-gap: 0.25rem;
          --pg-numbers-margin: 0 0.5rem;
          --pg-selector-basis: auto;
          --pg-selector-order: 0;
          --pg-items-flex: 1;
          --pg-items-basis: auto;
          --pg-items-order: 0;
        }

        @media (max-width: 640px) {
          .pagination-container {
            --pg-justify: center;
            --pg-container-gap: 0.5rem;
            --pg-container-padding: 0.75rem 0.5rem;
            --pg-btn-min-w: 40px;
            --pg-btn-h: 40px;
            --pg-nav-min-w: 40px;
            --pg-nav-min-h: 40px;
            --pg-first-last-display: none;
            --pg-controls-gap: 0.125rem;
            --pg-numbers-gap: 0.125rem;
            --pg-numbers-margin: 0 0.25rem;
            --pg-selector-basis: 100%;
            --pg-selector-order: 1;
            --pg-items-flex: 0;
            --pg-items-basis: 100%;
            --pg-items-order: 0;
          }
        }
      `}</style>
    </>
  );
}
