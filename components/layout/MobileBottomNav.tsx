'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, BookOpen, PlusCircle, User, Zap } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
  requiresAuth?: boolean
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const { userId } = useAuth()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Navigation items
  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      icon: <Home size={20} />,
      label: 'Accueil',
      requiresAuth: true,
    },
    {
      href: '/catalogue',
      icon: <BookOpen size={20} />,
      label: 'Catalogue',
    },
    {
      href: '/recharge',
      icon: <Zap size={20} />,
      label: 'Crédits',
      requiresAuth: true,
    },
    {
      href: '/contributeur',
      icon: <PlusCircle size={20} />,
      label: 'Contribuer',
      requiresAuth: true,
    },
    {
      href: '/profil',
      icon: <User size={20} />,
      label: 'Profil',
      requiresAuth: true,
    },
  ]

  // Handle scroll to show/hide navigation
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Filter items based on auth status
  const visibleItems = userId
    ? navItems
    : navItems.filter(item => !item.requiresAuth)

  // Don't show on auth pages or landing
  const isAuthPage = pathname?.startsWith('/auth')
  const isLanding = pathname === '/'
  const isAdmin = pathname?.startsWith('/admin')

  if (isAuthPage || isLanding || isAdmin) {
    return null
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav
        className={`mobile-bottom-nav ${isVisible ? 'visible' : 'hidden'}`}
        role="navigation"
        aria-label="Navigation principale mobile"
      >
        <div className="mobile-nav-container">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
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

      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="mobile-nav-spacer" />
    </>
  )
}
