'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Bell, TrendingUp, Users, 
  FileText, ArrowUpRight, ShoppingCart, DollarSign, 
  BarChart3, Edit3, Eye
} from 'lucide-react'
import { getUserActiveTransactionsAction } from '@/actions/profile'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { ContributorSidebar } from '@/components/contributeur/ContributorSidebar'
import { EmptyState } from '@/components/ui/EmptyState'
import './contributeur.css'

interface ContributorDashboardProps {
  user: {
    prenom: string
    nom: string
    role: string
    profilePicture?: string | null
  }
  kpi: {
    published: number
    pending: number
    sales: number
    revenue: number
  }
  topSubjects: any[]
  allSubjects: any[]
}

export default function ContributorDashboardClient({ user, kpi, topSubjects, allSubjects }: ContributorDashboardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const notifRef = useRef<HTMLDivElement>(null)

  // Persistance du sidebar
  useEffect(() => {
    const saved = localStorage.getItem('mahai_sidebar_collapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  // Appliquer le thème dark par défaut pour les pages contributeur
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
    loadQuickNotifications()

    // Fermer le dropdown si on clique ailleurs
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadQuickNotifications = async () => {
    try {
      const result = await getUserActiveTransactionsAction()
      if (result.success && result.data) {
        setNotifications(result.data.slice(0, 5)) // Top 5
      }
    } catch (e) {
      console.error(e)
    }
  }

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('mahai_sidebar_collapsed', String(newState))
  }

  return (
    <div className={`contributor-dashboard-page ${isCollapsed ? 'sidebar-collapsed' : ''}`} data-theme="dark">
      {/* Sidebar Component */}
      <ContributorSidebar 
        user={user} 
        isCollapsed={isCollapsed} 
        onToggle={toggleSidebar}
        stats={{
          earnings: kpi.revenue,
          monthEarnings: 0, // À calculer si dispo
          totalSubjects: allSubjects.length
        }}
      />

      {/* Main */}
      <main className="main">
        {/* Header */}
        <div className="dash-header">
          <div>
            <div className="dash-welcome">
              Heureux de vous revoir, {user.prenom}
            </div>
            <div className="dash-subtitle">
              Voici ce qui se passe sur vos sujets aujourd'hui.
            </div>
          </div>
          
          <div className="dash-actions">
            <Link href="/contributeur/nouveau" className="btn-create">
              <Edit3 size={16} />
              <span>Nouveau sujet</span>
            </Link>

            <div className="notif-wrapper" ref={notifRef}>
              <button 
                className={`btn-notif ${notifications.length > 0 ? 'has-new' : ''}`}
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                aria-label="Notifications"
              >
                <Bell size={20} />
              </button>

              {showNotifDropdown && (
                <div className="notif-dropdown">
                  <div className="notif-head">
                    <span>Notifications</span>
                    <Link href="/notifications" className="notif-link">Tout voir</Link>
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">Aucune nouvelle notification</div>
                    ) : (
                      notifications.map((n: any, i: number) => (
                        <div key={i} className="notif-item">
                          <div className="notif-icon">
                            <DollarSign size={14} />
                          </div>
                          <div className="notif-content">
                            <div className="notif-title">Achat de crédit</div>
                            <div className="notif-time">Récemment</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrapper kpi-gold">
              <DollarSign size={20} />
            </div>
            <div className="kpi-info">
              <div className="kpi-label">Revenus générés</div>
              <div className="kpi-value">{kpi.revenue.toLocaleString('fr-FR')} <small>Ar</small></div>
            </div>
            <div className="kpi-chart">
              <TrendingUp size={16} className="trend-up" />
              <span>+12%</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper kpi-blue">
              <ShoppingCart size={20} />
            </div>
            <div className="kpi-info">
              <div className="kpi-label">Ventes totales</div>
              <div className="kpi-value">{kpi.sales}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper kpi-green">
              <FileText size={20} />
            </div>
            <div className="kpi-info">
              <div className="kpi-label">Sujets publiés</div>
              <div className="kpi-value">{kpi.published}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper kpi-orange">
              <BarChart3 size={20} />
            </div>
            <div className="kpi-info">
              <div className="kpi-label">Taux de conversion</div>
              <div className="kpi-value">2.4%</div>
            </div>
          </div>
        </div>

        {/* Content Split */}
        <div className="dash-split">
          {/* Top Subjects */}
          <div className="dash-section">
            <div className="section-header">
              <h3>Sujets performants</h3>
              <Link href="/contributeur/sujets" className="link-more">
                Voir tout <ArrowUpRight size={14} />
              </Link>
            </div>
            
            <div className="subjects-list">
              {topSubjects.length === 0 ? (
                 <EmptyState 
                    title="Aucun sujet performant" 
                    description="Vos statistiques apparaîtront ici une fois que vos sujets seront vendus." 
                    icon={TrendingUp}
                    className="py-8"
                 />
              ) : (
                topSubjects.map((subject: any) => (
                  <div key={subject.id} className="subject-item">
                    <div className="subject-icon">
                      <FileText size={18} />
                    </div>
                    <div className="subject-details">
                      <div className="subject-title">{subject.titre}</div>
                      <div className="subject-meta">
                        {subject.ventes || 0} ventes · {subject.revenus || 0} Ar
                      </div>
                    </div>
                    <Link href={`/sujet/${subject.id}`} className="btn-view" aria-label="Voir le sujet">
                      <Eye size={16} />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity / Status */}
          <div className="dash-section">
            <div className="section-header">
              <h3>Statut des publications</h3>
            </div>
            
            <div className="status-overview">
               <div className="status-row">
                 <div className="status-dot pub"></div>
                 <div className="status-name">Publiés</div>
                 <div className="status-count">{kpi.published}</div>
               </div>
               <div className="status-row">
                 <div className="status-dot pend"></div>
                 <div className="status-name">En attente de revue</div>
                 <div className="status-count">{kpi.pending}</div>
               </div>
               <div className="status-row">
                 <div className="status-dot draft"></div>
                 <div className="status-name">Brouillons</div>
                 <div className="status-count">{allSubjects.filter(s => s.status === 'DRAFT').length}</div>
               </div>
            </div>

            <div className="mini-cta">
              <p>Besoin d'aide pour publier ?</p>
              <Link href="/contributeur/guide">Consulter le guide</Link>
            </div>
          </div>
        </div>

      </main>

      <LuxuryCursor />
    </div>
  )
}
