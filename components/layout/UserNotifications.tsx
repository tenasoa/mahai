'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Bell, Check, X, ChevronRight } from 'lucide-react'

interface Notification {
  id: string
  type: 'correction' | 'credit' | 'sujet' | 'system' | 'mvola' | 'alert'
  title: string
  body: string
  createdAt: string
  read: boolean
  score?: number
  maxScore?: number
  link?: string
  linkText?: string
}

export function UserNotifications() {
  const router = useRouter()
  const { userId, appUser } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Écouter les notifications en temps réel
  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    
    const channel = supabase
      .channel('user-notifications-dropdown')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'CreditTransaction',
          filter: `userId=eq.${userId}`
        },
        (payload) => {
          const newNotif: Notification = {
            id: payload.new.id,
            type: payload.new.type === 'RECHARGE' ? 'credit' : 'alert',
            title: payload.new.type === 'RECHARGE' ? 'Recharge créditée' : 'Transaction mise à jour',
            body: `${Math.abs(payload.new.creditsCount || payload.new.amount)} crédits ${payload.new.status === 'COMPLETED' ? 'validés' : 'en attente'}`,
            createdAt: payload.new.createdAt,
            read: false,
            link: '/recharge'
          }
          setNotifications(prev => [newNotif, ...prev])
          setNotificationCount(prev => prev + 1)
        }
      )
      .subscribe()

    // Charger les notifications réelles depuis la base
    loadRealNotifications()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const loadRealNotifications = async () => {
    try {
      const { getUserTransactionsAction } = await import('@/actions/profile')
      const result = await getUserTransactionsAction()
      
      if (result.success && result.data) {
        const realNotifications: Notification[] = result.data.slice(0, 10).map((tx: any) => ({
          id: tx.id,
          type: tx.type === 'RECHARGE' ? 'credit' : tx.type === 'ACHAT' ? 'sujet' : 'alert',
          title: tx.type === 'RECHARGE' 
            ? 'Recharge Mobile Money' 
            : tx.type === 'ACHAT'
            ? 'Achat de sujet'
            : 'Transaction',
          body: tx.description || `${tx.type === 'RECHARGE' ? '+' : ''}${tx.creditsCount || Math.abs(tx.amount)} crédits`,
          createdAt: tx.createdAt,
          read: tx.status === 'COMPLETED',
          link: '/recharge'
        }))
        setNotifications(realNotifications)
        setNotificationCount(realNotifications.filter(n => !n.read).length)
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    }
  }

  const resetNotificationCount = () => setNotificationCount(0)

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setNotificationCount(0)
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (notificationCount > 0) setNotificationCount(prev => prev - 1)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'correction': return '🤖'
      case 'credit': return '✦'
      case 'sujet': return '📚'
      case 'system': return '⚙'
      case 'mvola': return '📱'
      case 'alert': return '⚠'
      default: return '🔔'
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    return `Il y a ${Math.floor(hours / 24)}j`
  }

  if (!userId) return null

  return (
    <>
      {/* Bouton Bell dans la navbar */}
      <button 
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          position: 'relative',
          width: '36px',
          height: '36px',
          background: 'var(--card)',
          border: '1px solid var(--b1)',
          borderRadius: 'var(--r)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-3)',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--gold-line)'
          e.currentTarget.style.color = 'var(--gold)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--b1)'
          e.currentTarget.style.color = 'var(--text-3)'
        }}
        title="Notifications"
      >
        <Bell size={18} />
        {notificationCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '18px',
            height: '18px',
            padding: '0 5px',
            background: 'linear-gradient(135deg, var(--ruby), #E04060)',
            color: '#fff',
            fontFamily: 'var(--mono)',
            fontSize: '0.55rem',
            fontWeight: 700,
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'badgePulse 2s ease-in-out infinite'
          }}>
            {notificationCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 998 }} 
            onClick={() => setDropdownOpen(false)}
          />
          <div style={{
            position: 'absolute',
            right: '-10px',
            top: 'calc(100% + 0.5rem)',
            width: '320px',
            maxHeight: '500px',
            overflowY: 'auto',
            background: 'var(--card)',
            border: '1px solid var(--b1)',
            borderRadius: 'var(--r-lg)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            zIndex: 999,
            animation: 'fadeIn 0.2s ease'
          }}>
            {/* Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--b1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} style={{ color: 'var(--gold)' }} />
                <span style={{ fontFamily: 'var(--display)', fontSize: '1rem', color: 'var(--text)' }}>Notifications</span>
                {notificationCount > 0 && (
                  <span style={{
                    background: 'var(--ruby)',
                    color: '#fff',
                    fontFamily: 'var(--mono)',
                    fontSize: '0.62rem',
                    padding: '0.12rem 0.55rem',
                    borderRadius: '10px'
                  }}>
                    {notificationCount}
                  </span>
                )}
              </div>
              {notificationCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '0.6rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--gold)',
                    background: 'none',
                    border: '1px solid var(--gold-line)',
                    borderRadius: '2px',
                    padding: '0.28rem 0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gold-dim)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  Tout marquer lu
                </button>
              )}
            </div>

            {/* Notifications list */}
            <div>
              {notifications.length === 0 ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', opacity: 0.6 }}>
                  <Bell size={48} style={{ color: 'var(--text-3)', marginBottom: '1rem' }} />
                  <div style={{ fontFamily: 'var(--display)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
                    Aucune notification
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                    Vos notifications apparaîtront ici
                  </div>
                </div>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.9rem',
                      padding: '0.9rem 1.25rem',
                      borderBottom: '1px solid var(--b3)',
                      background: !notif.read ? 'var(--surface)' : 'transparent',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = !notif.read ? 'var(--surface)' : 'transparent'}
                    onClick={() => {
                      if (notif.link) router.push(notif.link)
                      dismissNotification(notif.id)
                    }}
                  >
                    {!notif.read && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '3px',
                        background: 'var(--gold)'
                      }} />
                    )}
                    
                    {/* Icon */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      flexShrink: 0,
                      border: '1px solid',
                      background: notif.type === 'credit' ? 'var(--gold-dim)' : notif.type === 'sujet' ? 'var(--amber-dim)' : 'var(--b2)',
                      borderColor: notif.type === 'credit' ? 'var(--gold-line)' : notif.type === 'sujet' ? 'var(--amber-line)' : 'var(--b1)'
                    }}>
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: !notif.read ? 600 : 500,
                        color: !notif.read ? 'var(--text)' : 'var(--text-2)',
                        marginBottom: '0.25rem',
                        lineHeight: 1.4
                      }}>
                        {notif.title}
                      </div>
                      <div style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-3)',
                        lineHeight: 1.6,
                        marginBottom: '0.5rem'
                      }}>
                        {notif.body}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{
                          fontFamily: 'var(--mono)',
                          fontSize: '0.58rem',
                          color: 'var(--text-4)'
                        }}>
                          {getTimeAgo(notif.createdAt)}
                        </span>
                        {notif.score && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'var(--sage-dim)',
                            border: '1px solid var(--sage-line)',
                            borderRadius: 'var(--r)',
                            padding: '0.2rem 0.6rem',
                            fontFamily: 'var(--mono)',
                            fontSize: '0.65rem',
                            color: '#8ECAAC'
                          }}>
                            ✦ {notif.score} / {notif.maxScore}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dismiss */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        dismissNotification(notif.id)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-4)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        padding: '0.25rem',
                        transition: 'color 0.2s',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-2)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-4)'}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer - Voir tout */}
            <Link
              href="/notifications"
              onClick={() => setDropdownOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.25rem',
                background: 'var(--surface)',
                borderTop: '1px solid var(--b1)',
                fontFamily: 'var(--mono)',
                fontSize: '0.62rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--gold)',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--gold-dim)'
                e.currentTarget.style.gap = '0.75rem'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface)'
                e.currentTarget.style.gap = '0.5rem'
              }}
            >
              Tout voir
              <ChevronRight size={14} />
            </Link>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(155, 35, 53, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 4px rgba(155, 35, 53, 0); }
        }
      `}</style>
    </>
  )
}
