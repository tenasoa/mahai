'use client'

import { usePathname } from 'next/navigation'
import { LuxuryNavbar } from './LuxuryNavbar'

export function ConditionalNavbar() {
  const pathname = usePathname()

  // Masquer LuxuryNavbar pour les pages contributeur
  const isContributorPage = pathname?.startsWith('/contributeur')
  
  // Debug log (à supprimer en prod)
  if (typeof window !== 'undefined') {
    console.log('[ConditionalNavbar] pathname:', pathname, 'isContributor:', isContributorPage)
  }

  return isContributorPage ? null : <LuxuryNavbar />
}
