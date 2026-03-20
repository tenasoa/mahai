'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, User, LogOut, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'

interface UseUserNotificationsProps {
  userId?: string
  enabled: boolean
}

function useUserNotifications({ userId, enabled }: UseUserNotificationsProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!enabled || !userId) return

    const supabase = createClient()
    
    // S'abonner aux notifications (transactions de l'utilisateur)
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'CreditTransaction',
          filter: `userId=eq.${userId}`
        },
        () => {
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled, userId])

  const resetCount = () => setUnreadCount(0)

  return { unreadCount, resetCount }
}

export function UserTopbar() {
  const pathname = usePathname()
  const { user, appUser, userId } = useAuth()
  const { unreadCount, resetCount } = useUserNotifications({ userId, enabled: true })

  const handleNotificationClick = () => {
    resetCount()
    // Rediriger vers l'historique des transactions
    window.location.href = '/recharge'
  }

  return (
    <header className="user-topbar">
      <div className="topbar-left">
        <Link href="/" className="topbar-logo">
          Mah<span className="topbar-gem" />AI
        </Link>
        <nav className="topbar-nav">
          <Link href="/catalogue" className={`topbar-link ${pathname === '/catalogue' ? 'active' : ''}`}>
            Catalogue
          </Link>
          <Link href="/examens" className={`topbar-link ${pathname?.startsWith('/examens') ? 'active' : ''}`}>
            Examens
          </Link>
          <Link href="/recharge" className={`topbar-link ${pathname === '/recharge' ? 'active' : ''}`}>
            Crédits
          </Link>
        </nav>
      </div>

      <div className="topbar-right">
        {/* Notifications */}
        <button 
          className="topbar-notification-btn" 
          onClick={handleNotificationClick}
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="topbar-notification-badge">{unreadCount}</span>
          )}
        </button>

        {/* User Menu */}
        <div className="topbar-user-menu">
          <Link href="/profil" className="topbar-user-link">
            {appUser?.profilePicture ? (
              <img 
                src={appUser.profilePicture} 
                alt={appUser.prenom}
                className="topbar-avatar"
              />
            ) : (
              <div className="topbar-avatar">
                {(appUser?.prenom?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
              </div>
            )}
            <span className="topbar-user-name">
              {appUser?.prenom || 'Utilisateur'}
            </span>
          </Link>
          
          <Link href="/auth/logout" className="topbar-logout" title="Déconnexion">
            <LogOut size={18} />
          </Link>
        </div>
      </div>
    </header>
  )
}
