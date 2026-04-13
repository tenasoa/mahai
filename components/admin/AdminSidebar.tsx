'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, FileText, CreditCard, Users, User, Sun, Moon, Wallet } from 'lucide-react'
import { useAdminTransactionsRealtime } from '@/lib/hooks/useAdminTransactionsRealtime'
import '@/app/dashboard-theme.css' 
// Assuming admin.css is still loaded globally or we rely on dashboard-theme.css variables now. 
// Ideally AdminSidebar should just use classes, but admin.css has legacy classes.
// I will keep the structure but ensure variables are used.

const navItems = [
  {
    section: 'Vue générale',
    links: [
      { href: '/admin', label: 'Dashboard', icon: 'dashboard', badge: null, badgeType: null },
    ],
  },
  {
    section: 'Contenu',
    links: [
      { href: '/admin/sujets', label: 'Sujets', icon: 'subjects', badge: 'sujets', badgeType: 'ruby' },
    ],
  },
  {
    section: 'Finances',
    links: [
      { href: '/admin/credits', label: 'Mobile Banking', icon: 'credits', badge: 'credits', badgeType: 'amber' },
      { href: '/admin/retraits', label: 'Retraits Gains', icon: 'withdrawals', badge: null, badgeType: null },
    ],
  },
  {
    section: 'Utilisateurs',
    links: [
      { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: 'users', badge: null, badgeType: null },
    ],
  },
]

function SidebarIcon({ type, size = 18 }: { type: string, size?: number }) {
  switch (type) {
    case 'dashboard':
      return <LayoutDashboard size={size} />
    case 'subjects':
      return <FileText size={size} />
    case 'credits':
      return <CreditCard size={size} />
    case 'withdrawals':
      return <Wallet size={size} />
    case 'users':
      return <Users size={size} />
    default:
      return <LayoutDashboard size={size} />
  }
}

interface AdminSidebarProps {
  user: {
    prenom: string
    nom: string
    role: string
    profilePicture?: string | null
  }
  initials: string
}

export function AdminSidebar({ user, initials }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const pathname = usePathname()
  
  // Hook Realtime pour les transactions en attente
  const { pendingCount, resetCount } = useAdminTransactionsRealtime({
    enabled: true
  })

  // Persistance du sidebar
  useEffect(() => {
    const saved = localStorage.getItem('mahai_admin_sidebar_collapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  // Charger le thème depuis localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme')
    if (savedTheme) {
      const isDark = savedTheme === 'dark'
      setIsDarkMode(isDark)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark'
    setIsDarkMode(!isDarkMode)
    localStorage.setItem('admin-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('mahai_admin_sidebar_collapsed', String(newState))
  }

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`} id="adminSidebar">
      <div className="sb-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80px', position: 'relative' }}>
        <Link href="/" className="sb-logo-main">
          Mah<span className="sb-gem" />AI
        </Link>
        <span className="sb-admin-badge" style={{ marginTop: '4px' }}>⚡ Administration</span>

        <button
          onClick={toggleSidebar}
          className="sb-collapse-btn"
          style={{ position: 'absolute', top: '1rem', right: '1rem' }}
          title={isCollapsed ? "Étendre" : "Réduire"}
          aria-label={isCollapsed ? "Étendre le menu" : "Réduire le menu"}
        >
          {isCollapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      <nav className="sb-nav">
        {/* Navigation Rapide */}
        <div style={{ marginTop: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--b2)', paddingBottom: '1rem' }}>
          <div className="sb-section" style={{ marginTop: 0 }}>Navigation rapide</div>
          <Link href="/dashboard" className={`sb-link ${pathname === '/dashboard' ? 'active' : ''}`}>
            <User size={18} />
            <span className="sb-link-text">Espace Étudiant</span>
          </Link>
          <Link href="/contributeur" className={`sb-link ${pathname.startsWith('/contributeur') ? 'active' : ''}`}>
            <FileText size={18} />
            <span className="sb-link-text">Espace Contributeur</span>
          </Link>
        </div>

        {navItems.map(section => (
          <div key={section.section}>
            <div className="sb-section">{section.section}</div>
            {section.links.map(link => {
              const isActive = pathname === link.href || (link.href !== '/admin' && pathname?.startsWith(link.href))
              const showBadge = link.badge === 'credits' && pendingCount > 0
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`sb-link ${isActive ? 'active' : ''} ${showBadge ? 'has-badge' : ''}`}
                  title={link.label}
                  onClick={() => {
                    if (link.href === '/admin/credits') {
                      resetCount()
                    }
                  }}
                >
                  <SidebarIcon type={link.icon} />
                  <span className="sb-link-text">{link.label}</span>
                  {showBadge ? (
                    <span className="sb-notification-badge">{pendingCount}</span>
                  ) : null}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sb-footer">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="sb-theme-toggle"
          title={isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
          aria-label="Changer le thème"
        >
          {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          <span className="sb-theme-text">{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
        </button>

        <Link href="/dashboard" className="sb-user" style={{ textDecoration: 'none' }}>
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={`${user.prenom} ${user.nom}`}
              className="sb-av"
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--ruby-line)' }}
            />
          ) : (
            <div className="sb-av">{initials}</div>
          )}
          <div className="sb-user-info">
            <div className="sb-user-name">{user.prenom} {user.nom}</div>
            <div className="sb-user-role">Super Admin</div>
          </div>
        </Link>
      </div>
    </aside>
  )
}
