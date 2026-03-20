import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import Link from 'next/link'
import './admin.css'

export const metadata = {
  title: 'Admin — Mah.AI',
}

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
      { href: '/admin/moderations', label: 'Modération', icon: 'moderation', badge: null, badgeType: null },
    ],
  },
  {
    section: 'Finances',
    links: [
      { href: '/admin/credits', label: 'Crédits MVola', icon: 'credits', badge: 'credits', badgeType: 'amber' },
    ],
  },
  {
    section: 'Utilisateurs',
    links: [
      { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: 'users', badge: null, badgeType: null },
    ],
  },
]

function SidebarIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    subjects: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    moderation: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    credits: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8m14 2v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  }
  return (
    <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[type] || icons.dashboard} />
    </svg>
  )
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Vérifier le rôle ADMIN avec query native pour contourner RLS
  const result = await query('SELECT role, prenom, nom FROM "User" WHERE id = $1 LIMIT 1', [session.user.id])
  const user = result.rows[0]

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const initials = `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`.toUpperCase() || 'A'

  return (
    <div className="admin-body">
      <div className="admin-noise" />
      <div className="admin-layout">
        {/* SIDEBAR */}
        <aside className="admin-sidebar" id="adminSidebar">
          <div className="sb-logo">
            <Link href="/" className="sb-logo-main">
              Mah<span className="sb-gem" />AI
            </Link>
            <span className="sb-admin-badge">⚡ Administration</span>
          </div>

          <nav className="sb-nav">
            {navItems.map(section => (
              <div key={section.section}>
                <div className="sb-section">{section.section}</div>
                {section.links.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="sb-link"
                  >
                    <SidebarIcon type={link.icon} />
                    {link.label}
                    {link.badgeType && (
                      <span className={`sb-badge sb-badge-${link.badgeType}`}>•</span>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <div className="sb-footer">
            <div className="sb-user">
              <div className="sb-av">{initials}</div>
              <div>
                <div className="sb-user-name">{user.prenom} {user.nom}</div>
                <div className="sb-user-role">Super Admin</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="admin-main">
          {children}
        </div>
      </div>
    </div>
  )
}
