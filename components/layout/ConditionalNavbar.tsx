'use client'

import { usePathname } from 'next/navigation'
import { LuxuryNavbar } from './LuxuryNavbar'

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Masquer LuxuryNavbar pour les pages contributeur
  const isContributorPage = pathname?.startsWith('/contributeur')

  return isContributorPage ? null : <LuxuryNavbar />
}
