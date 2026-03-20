'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, FileText, CreditCard, Users, User, Sun, Moon } from 'lucide-react'
import { useAdminTransactionsRealtime } from '@/lib/hooks/useAdminTransactionsRealtime'

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

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`} id="adminSidebar">
      <div className="sb-logo">
        <Link href="/" className="sb-logo-main">
          Mah<span className="sb-gem" />AI
        </Link>
        <span className="sb-admin-badge">⚡ Administration</span>

        {/* Bouton hamburger : sous le logo quand réduit (Menu), en haut à droite quand étendu (X) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="sb-collapse-btn"
          title={isCollapsed ? "Étendre" : "Réduire"}
          style={{
            position: 'absolute',
            right: isCollapsed ? 'auto' : '15px',
            left: isCollapsed ? '50%' : 'auto',
            transform: isCollapsed ? 'translateX(-50%)' : 'none',
            top: isCollapsed ? '62px' : '15px',
            background: 'var(--card)',
            border: '1px solid var(--ruby-line)',
            color: 'var(--ruby)',
            cursor: 'pointer',
            borderRadius: 'var(--r)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            transition: 'all 0.2s',
            zIndex: 10,
          }}
        >
          {isCollapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      <nav className="sb-nav">
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
                  className={`sb-link ${isActive ? 'active' : ''}`}
                  title={link.label}
                  onClick={() => {
                    // Réinitialiser le compteur quand on clique sur Mobile Banking
                    if (link.href === '/admin/credits') {
                      resetCount()
                    }
                  }}
                >
                  <SidebarIcon type={link.icon} />
                  <span className="sb-link-text">{link.label}</span>
                  {showBadge ? (
                    <span className="sb-notification-badge">{pendingCount}</span>
                  ) : link.badgeType ? (
                    <span className={`sb-badge sb-badge-${link.badgeType}`}>•</span>
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
          title={isDarkMode ? 'Mode Clair' : 'Mode Sombre'}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            marginBottom: '0.75rem',
            background: 'var(--surface)',
            border: '1px solid var(--b1)',
            borderRadius: 'var(--r)',
            color: 'var(--text-3)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'var(--mono)',
            fontSize: '0.6rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--gold-dim)'
            e.currentTarget.style.borderColor = 'var(--gold-line)'
            e.currentTarget.style.color = 'var(--gold)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--surface)'
            e.currentTarget.style.borderColor = 'var(--b1)'
            e.currentTarget.style.color = 'var(--text-3)'
          }}
        >
          {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          {isDarkMode ? 'Mode Clair' : 'Mode Sombre'}
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
