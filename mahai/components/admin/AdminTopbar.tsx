'use client'

import Link from 'next/link'
import { Bell, Search, Settings, LogOut } from 'lucide-react'

interface AdminTopbarProps {
  pageTitle: string
  pageSubtitle?: string
  userName?: string
  userInitials?: string
}

export function AdminTopbar({ pageTitle, pageSubtitle, userName = 'Admin', userInitials = 'A' }: AdminTopbarProps) {
  return (
    <header className="admin-topbar">
      <div className="tb-left">
        <h1 className="tb-title">{pageTitle}</h1>
        {pageSubtitle && <span className="tb-pill">{pageSubtitle}</span>}
      </div>

      <div className="tb-right">
        {/* Search */}
        <div className="tb-search">
          <Search size={14} />
          <input type="text" placeholder="Rechercher..." />
        </div>

        {/* Notifications */}
        <button className="tb-icon-btn" title="Notifications">
          <Bell size={14} />
          <span className="tb-dot" />
        </button>

        {/* Settings */}
        <button className="tb-icon-btn" title="Paramètres">
          <Settings size={14} />
        </button>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.5rem', marginLeft: '0.5rem', borderLeft: '1px solid var(--b1)' }}>
          <div className="sb-av" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
            {userInitials}
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text)' }}>{userName}</span>
        </div>

        {/* Logout */}
        <Link href="/auth/logout" className="tb-icon-btn" title="Déconnexion">
          <LogOut size={14} />
        </Link>
      </div>
    </header>
  )
}
