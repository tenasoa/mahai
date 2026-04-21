import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItem[]
  homeHref?: string
  homeLabel?: string
}

export function AdminBreadcrumb({ items, homeHref = '/admin', homeLabel = 'Dashboard Admin' }: AdminBreadcrumbProps) {
  return (
    <nav className="admin-breadcrumb" aria-label="Fil d'Ariane">
      <Link href={homeHref} className="admin-breadcrumb-home" aria-label={homeLabel}>
        <Home size={14} />
      </Link>
      {items.map((item, index) => (
        <span key={index} className="admin-breadcrumb-item">
          <ChevronRight size={12} className="admin-breadcrumb-separator" />
          {item.href ? (
            <Link href={item.href} className="admin-breadcrumb-link">
              {item.label}
            </Link>
          ) : (
            <span className="admin-breadcrumb-current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
