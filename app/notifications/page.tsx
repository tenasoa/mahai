'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { Bell, Check, X, Zap, CreditCard, BookOpen, Settings, AlertTriangle } from 'lucide-react'

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

export default function NotificationsPage() {
  const router = useRouter()
  const { userId, appUser, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!loading && !userId) {
      router.push('/auth/login')
    }
  }, [userId, loading, router])

  useEffect(() => {
    loadRealNotifications()
  }, [])

  const loadRealNotifications = async () => {
    try {
      const { getUserTransactionsAction } = await import('@/actions/profile')
      const result = await getUserTransactionsAction()
      
      if (result.success && result.data) {
        const realNotifications: Notification[] = result.data.map((tx: any) => ({
          id: tx.id,
          type: tx.type === 'RECHARGE' ? 'credit' : tx.type === 'ACHAT' ? 'sujet' : 'alert',
          title: tx.type === 'RECHARGE' 
            ? (tx.status === 'PENDING' ? 'Recharge en attente' : 'Recharge créditée')
            : tx.type === 'ACHAT'
            ? 'Achat de sujet'
            : 'Transaction',
          body: tx.description || `${tx.type === 'RECHARGE' ? '+' : ''}${tx.creditsCount || Math.abs(tx.amount)} crédits ${tx.status === 'PENDING' ? '(en attente)' : ''}`,
          createdAt: tx.createdAt,
          read: tx.status === 'COMPLETED',
          link: '/recharge'
        }))
        setNotifications(realNotifications)
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    }
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'credit': return { icon: '✦', class: 'ni-credit' }
      case 'sujet': return { icon: '📚', class: 'ni-sujet' }
      case 'alert': return { icon: '⚠', class: 'ni-alert' }
      default: return { icon: '🔔', class: 'ni-system' }
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
    if (hours < 24 * 7) return `Il y a ${Math.floor(hours / 24)}j`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const filterNotifications = (type: string) => {
    if (type === 'all') return notifications
    return notifications.filter(n => n.type === type)
  }

  const groupByTime = (notifs: Notification[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60000)

    const groups: { label: string; notifs: Notification[] }[] = [
      { label: 'Aujourd\'hui', notifs: [] },
      { label: 'Cette semaine', notifs: [] },
      { label: 'Plus ancien', notifs: [] }
    ]

    notifs.forEach(notif => {
      const notifDate = new Date(notif.createdAt)
      if (notifDate >= today) {
        groups[0].notifs.push(notif)
      } else if (notifDate >= weekAgo) {
        groups[1].notifs.push(notif)
      } else {
        groups[2].notifs.push(notif)
      }
    })

    return groups.filter(g => g.notifs.length > 0)
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const filteredNotifs = filterNotifications(activeTab)
  const groupedNotifs = groupByTime(filteredNotifs)

  if (loading || !userId) return null

  return (
    <div className="credits-page">
      <LuxuryCursor />
      <LuxuryNavbar />

      <div className="page">
        {/* Header */}
        <div className="page-header">
          <div className="page-title-wrap">
            <div className="page-eyebrow">Centre de notifications</div>
            <h1 className="page-title">
              Vos <em>alertes</em>
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount}</span>
              )}
            </h1>
          </div>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button className="btn-mark-all" onClick={markAllAsRead}>
                <Check size={14} style={{ marginRight: '0.35rem' }} />
                Tout marquer lu
              </button>
            )}
          </div>
        </div>

        {/* Settings toggle */}
        <div className="settings-row">
          <span className="sr-text">🔔 Notifications push activées</span>
          <button 
            className="toggle"
            onClick={(e) => e.currentTarget.classList.toggle('off')}
          />
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Toutes
            {unreadCount > 0 && <span className="tab-count">{unreadCount}</span>}
          </button>
          <button 
            className={`tab ${activeTab === 'credit' ? 'active' : ''}`}
            onClick={() => setActiveTab('credit')}
          >
            Crédits
          </button>
          <button 
            className={`tab ${activeTab === 'sujet' ? 'active' : ''}`}
            onClick={() => setActiveTab('sujet')}
          >
            Sujets
          </button>
          <button 
            className={`tab ${activeTab === 'alert' ? 'active' : ''}`}
            onClick={() => setActiveTab('alert')}
          >
            Alertes
          </button>
        </div>

        {/* Notifications list */}
        {groupedNotifs.length === 0 ? (
          <div className="empty-state">
            <Bell className="es-icon" size={48} />
            <div className="es-title">Aucune notification</div>
            <div className="es-sub">Vos notifications apparaîtront ici</div>
          </div>
        ) : (
          groupedNotifs.map((group, groupIndex) => (
            <div key={groupIndex} className="notif-group">
              <div className="notif-group-label">{group.label}</div>
              
              {group.notifs.map((notif) => {
                const { icon, class: iconClass } = getNotificationIcon(notif.type)
                return (
                  <div
                    key={notif.id}
                    className={`notif-item ${!notif.read ? 'unread' : 'read'}`}
                    id={`n${notif.id}`}
                  >
                    <div className={`notif-icon ${iconClass}`}>
                      {icon}
                    </div>
                    <div className="notif-content">
                      <div className="notif-title">{notif.title}</div>
                      <div className="notif-body">
                        {notif.body}
                        {notif.score && (
                          <div className="score-chip">
                            ✦ {notif.score} / {notif.maxScore}
                          </div>
                        )}
                      </div>
                      <div className="notif-meta">
                        <span className="notif-time">{getTimeAgo(notif.createdAt)}</span>
                        <span className="notif-tag">{notif.type}</span>
                      </div>
                      {notif.link && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <span 
                            className="notif-cta"
                            onClick={() => router.push(notif.link!)}
                          >
                            {notif.linkText || 'Voir le détail'} →
                          </span>
                        </div>
                      )}
                    </div>
                    <button 
                      className="notif-dismiss"
                      onClick={() => dismissNotification(notif.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      <style jsx global>{`
        :root {
          --void: #080705;
          --depth: #0E0C0A;
          --surface: #141210;
          --card: #1A1714;
          --card-hover: #201D19;
          --lift: #252118;
          --gold: #C9A84C;
          --gold-hi: #E8C96A;
          --gold-lo: #8A6E2A;
          --gold-dim: rgba(201, 168, 76, 0.08);
          --gold-glow: rgba(201, 168, 76, 0.18);
          --gold-line: rgba(201, 168, 76, 0.22);
          --text: #F0EBE3;
          --text-2: rgba(240, 235, 227, 0.62);
          --text-3: rgba(240, 235, 227, 0.32);
          --text-4: rgba(240, 235, 227, 0.14);
          --ruby: #9B2335;
          --ruby-dim: rgba(155, 35, 53, 0.12);
          --ruby-line: rgba(155, 35, 53, 0.3);
          --sage: #4A6B5A;
          --sage-dim: rgba(74, 107, 90, 0.12);
          --sage-line: rgba(74, 107, 90, 0.3);
          --amber: #C9843C;
          --amber-dim: rgba(201, 132, 60, 0.12);
          --amber-line: rgba(201, 132, 60, 0.3);
          --b1: rgba(201, 168, 76, 0.14);
          --b2: rgba(201, 168, 76, 0.08);
          --b3: rgba(240, 235, 227, 0.06);
          --display: 'Cormorant Garamond', serif;
          --body: 'Outfit', sans-serif;
          --mono: 'DM Mono', monospace;
          --r: 4px;
          --r-lg: 8px;
        }

        .credits-page {
          min-height: 100vh;
          background-color: var(--void);
          color: var(--text);
          padding-bottom: 6rem;
        }

        .credits-page::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }

        .page {
          max-width: 840px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 5rem;
          position: relative;
          z-index: 1;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 0.85rem;
        }

        .page-title-wrap {}

        .page-eyebrow {
          font-family: var(--mono);
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--gold);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.4rem;
        }

        .page-eyebrow::before {
          content: '';
          width: 18px;
          height: 1px;
          background: var(--gold);
        }

        .page-title {
          font-family: var(--display);
          font-size: 2.2rem;
          font-weight: 400;
          color: var(--text);
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .page-title em {
          font-style: italic;
          color: var(--gold);
        }

        .unread-badge {
          font-family: var(--mono);
          font-size: 0.62rem;
          background: var(--ruby);
          color: #fff;
          border-radius: 10px;
          padding: 0.12rem 0.55rem;
          vertical-align: middle;
          margin-left: 0.5rem;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .btn-mark-all {
          font-family: var(--mono);
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--gold);
          background: none;
          border: 1px solid var(--gold-line);
          border-radius: 2px;
          padding: 0.28rem 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }

        .btn-mark-all:hover {
          background: var(--gold-dim);
        }

        .settings-row {
          background: var(--card);
          border: 1px solid var(--b1);
          border-radius: var(--r-lg);
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .sr-text {
          font-size: 0.82rem;
          color: var(--text-2);
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .toggle {
          width: 38px;
          height: 22px;
          background: var(--gold);
          border-radius: 11px;
          position: relative;
          cursor: pointer;
          transition: background 0.2s;
          flex-shrink: 0;
          border: none;
        }

        .toggle::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #fff;
          top: 3px;
          right: 3px;
          transition: right 0.2s, transform 0.2s;
        }

        .toggle.off {
          background: var(--b1);
        }

        .toggle.off::after {
          right: auto;
          left: 3px;
        }

        .tabs {
          display: flex;
          gap: 0;
          border-bottom: 1px solid var(--b1);
          margin-bottom: 1.5rem;
          overflow-x: auto;
        }

        .tabs::-webkit-scrollbar {
          display: none;
        }

        .tab {
          font-family: var(--mono);
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0.65rem 1.1rem;
          color: var(--text-3);
          cursor: pointer;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          white-space: nowrap;
        }

        .tab:hover {
          color: var(--text-2);
        }

        .tab.active {
          color: var(--gold);
          border-bottom-color: var(--gold);
        }

        .tab-count {
          background: var(--gold-dim);
          border: 1px solid var(--gold-line);
          color: var(--gold);
          border-radius: 8px;
          padding: 0.06rem 0.45rem;
          font-size: 0.55rem;
        }

        .notif-group {
          margin-bottom: 2rem;
        }

        .notif-group-label {
          font-family: var(--mono);
          font-size: 0.58rem;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--text-4);
          padding: 0.35rem 0;
          border-bottom: 1px solid var(--b3);
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .notif-group-label::before {
          content: '';
          width: 14px;
          height: 1px;
          background: var(--text-4);
        }

        .notif-item {
          display: flex;
          align-items: flex-start;
          gap: 0.9rem;
          padding: 0.9rem 1rem;
          border: 1px solid transparent;
          border-radius: var(--r-lg);
          transition: all 0.2s;
          margin-bottom: 0.45rem;
          position: relative;
          cursor: pointer;
        }

        .notif-item.unread {
          background: var(--card);
          border-color: var(--b1);
        }

        .notif-item.unread::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          border-radius: var(--r) 0 0 var(--r);
          background: var(--gold);
        }

        .notif-item:hover {
          background: var(--card-hover);
          border-color: rgba(201, 168, 76, 0.18);
        }

        .notif-item.read {
          opacity: 0.65;
        }

        .notif-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
          border: 1px solid;
        }

        .ni-correction {
          background: var(--sage-dim);
          border-color: var(--sage-line);
        }

        .ni-credit {
          background: var(--gold-dim);
          border-color: var(--gold-line);
        }

        .ni-sujet {
          background: var(--amber-dim);
          border-color: var(--amber-line);
        }

        .ni-system {
          background: var(--b2);
          border-color: var(--b1);
        }

        .ni-mvola {
          background: rgba(232, 69, 23, 0.1);
          border-color: rgba(232, 69, 23, 0.25);
        }

        .ni-alert {
          background: var(--ruby-dim);
          border-color: var(--ruby-line);
        }

        .notif-content {
          flex: 1;
          min-width: 0;
        }

        .notif-title {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 0.25rem;
          line-height: 1.4;
        }

        .notif-item.read .notif-title {
          color: var(--text-2);
          font-weight: 400;
        }

        .notif-body {
          font-size: 0.78rem;
          color: var(--text-3);
          line-height: 1.6;
          margin-bottom: 0.45rem;
        }

        .notif-body strong {
          color: var(--text-2);
          font-weight: 500;
        }

        .notif-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-family: var(--mono);
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--gold);
          cursor: pointer;
          transition: gap 0.2s;
        }

        .notif-cta:hover {
          gap: 0.55rem;
        }

        .notif-meta {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-top: 0.35rem;
        }

        .notif-time {
          font-family: var(--mono);
          font-size: 0.58rem;
          color: var(--text-4);
        }

        .notif-tag {
          font-family: var(--mono);
          font-size: 0.55rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 0.1rem 0.45rem;
          border-radius: 2px;
          border: 1px solid var(--b2);
          color: var(--text-4);
        }

        .notif-dismiss {
          background: none;
          border: none;
          color: var(--text-4);
          cursor: pointer;
          font-size: 0.75rem;
          padding: 0.25rem;
          transition: color 0.2s;
          flex-shrink: 0;
          align-self: flex-start;
          margin-top: 0.1rem;
        }

        .notif-dismiss:hover {
          color: var(--text-2);
        }

        .score-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--sage-dim);
          border: 1px solid var(--sage-line);
          border-radius: var(--r);
          padding: 0.2rem 0.6rem;
          font-family: var(--mono);
          font-size: 0.65rem;
          color: #8ECAAC;
          margin-top: 0.35rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          opacity: 0.6;
        }

        .es-icon {
          font-size: 2.5rem;
          margin-bottom: 0.85rem;
          color: var(--text-3);
        }

        .es-title {
          font-family: var(--display);
          font-size: 1.5rem;
          color: var(--text);
          margin-bottom: 0.35rem;
        }

        .es-sub {
          font-size: 0.82rem;
          color: var(--text-3);
        }

        @media (max-width: 560px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .tabs {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  )
}
