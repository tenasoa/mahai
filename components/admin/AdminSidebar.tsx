'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, FileText, CreditCard, Users, User } from 'lucide-react'

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
  const pathname = usePathname()

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
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`sb-link ${isActive ? 'active' : ''}`}
                  title={link.label}
                >
                  <SidebarIcon type={link.icon} />
                  <span className="sb-link-text">{link.label}</span>
                  {link.badgeType && (
                    <span className={`sb-badge sb-badge-${link.badgeType}`}>•</span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sb-footer">
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
