'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ContributorSidebar } from '@/components/contributeur/ContributorSidebar'
import { ToastContainer } from '@/components/ui/ToastContainer'

// Routes éditeur — rendu full-width sans sidebar contributeur
const EDITOR_PATHS = ['/contributeur/sujets/nouveau', '/edit']

interface ContributorLayoutProps {
  children: React.ReactNode
  user: {
    prenom: string
    nom: string
    role: string
    profilePicture?: string | null
  }
  stats?: {
    earnings: number
    monthEarnings: number
    totalSubjects: number
  }
}

export function ContributorLayout({ children, user, stats }: ContributorLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const saved = localStorage.getItem('mahai_contributor_sidebar_collapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  // Fermer le menu mobile au changement de page
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Bloquer le scroll quand menu mobile ouvert
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobileOpen])

  const handleToggle = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('mahai_contributor_sidebar_collapsed', String(newState))
  }

  const isEditorPage = EDITOR_PATHS.some(p => pathname.includes(p))

  // Full-width mode for editor pages
  if (isEditorPage) {
    return (
      <>
        {children}
        <ToastContainer />
      </>
    )
  }

  return (
    <div
      className={`contributor-dashboard-page ${isCollapsed ? 'sidebar-collapsed' : ''}`}
      suppressHydrationWarning
    >
      <div className="contributor-noise" suppressHydrationWarning />

      <ContributorSidebar
        user={user}
        stats={stats}
        isCollapsed={isCollapsed}
        onToggle={handleToggle}
        isMobileOpen={isMobileOpen}
        onMobileOpen={() => setIsMobileOpen(true)}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <main id="main-content" className="main" suppressHydrationWarning>
        {children}
      </main>
      <ToastContainer />
    </div>
  )
}