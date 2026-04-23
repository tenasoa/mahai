'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, LayoutDashboard, BookOpen, PlusCircle, User, Zap, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const { userId, appUser } = useAuth()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const isContributor = appUser?.role === 'CONTRIBUTEUR' || appUser?.role === 'PROFESSEUR' || appUser?.role === 'ADMIN'

  const authNavItems: NavItem[] = [
    { href: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Tableau de bord' },
    { href: '/catalogue', icon: <BookOpen size={20} />, label: 'Catalogue' },
    { href: '/recharge', icon: <Zap size={20} />, label: 'Crédits' },
    ...(isContributor ? [{ href: '/contributeur', icon: <PlusCircle size={20} />, label: 'Contribuer' }] : []),
    { href: '/profil', icon: <User size={20} />, label: 'Profil' },
  ]

  const guestNavItems: NavItem[] = [
    { href: '/', icon: <Home size={20} />, label: 'Accueil' },
    { href: '/catalogue', icon: <BookOpen size={20} />, label: 'Catalogue' },
    { href: '/auth/login', icon: <LogIn size={20} />, label: 'Connexion' },
    { href: '/auth/register', icon: <UserPlus size={20} />, label: 'Inscription' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const isAuthPage = pathname?.startsWith('/auth')
  const isAdmin = pathname?.startsWith('/admin')
  const isEditorPage = pathname?.includes('/contributeur/sujets/nouveau') ||
                       pathname?.match(/^\/contributeur\/sujets\/[^/]+\/edit/)

  if (isAuthPage || isAdmin || isEditorPage) {
    return null
  }

  const visibleItems = userId ? authNavItems : guestNavItems

  return (
    <>
      <nav
        className={`mobile-bottom-nav ${isVisible ? 'visible' : 'hidden'}`}
        role="navigation"
        aria-label="Navigation principale mobile"
      >
        <div className="mobile-nav-container">
          {visibleItems.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="mobile-nav-icon">{item.icon}</span>
                <span className="mobile-nav-label">{item.label}</span>
                {isActive && <span className="mobile-nav-indicator" />}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="mobile-nav-spacer" />
    </>
  )
}
