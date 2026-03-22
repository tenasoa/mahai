'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ContributorSidebar } from '@/components/contributeur/ContributorSidebar'

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
  const pathname = usePathname()

  useEffect(() => {
    const saved = localStorage.getItem('mahai_contributor_sidebar_collapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  const handleToggle = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('mahai_contributor_sidebar_collapsed', String(newState))
  }

  return (
    <div className={`contributor-dashboard-page ${isCollapsed ? 'sidebar-collapsed' : ''}`} data-theme="dark">
      <div className="contributor-noise" />
      
      <ContributorSidebar 
        user={user} 
        stats={stats}
        isCollapsed={isCollapsed}
        onToggle={handleToggle}
      />

      <main className="main">
        {children}
      </main>
    </div>
  )
}