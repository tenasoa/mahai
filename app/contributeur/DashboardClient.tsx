'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Bell, TrendingUp, TrendingDown, Minus,
  FileText, ShoppingCart, DollarSign,
  BarChart3, Edit3, Eye, Star,
  Wallet, PlusCircle, Lightbulb, User
} from 'lucide-react'
import { getUserActiveTransactionsAction } from '@/actions/profile'
import type { DashboardPeriod } from './actions'

interface ContributorDashboardProps {
  user: {
    prenom: string
    nom: string
    role: string
    profilePicture?: string | null
  }
  period: DashboardPeriod
  kpi: {
    published: number
    pending: number
    sales: number
    revenue: number
    averageRating: number
    ratedCount: number
    revenueTrend: number
    salesTrend: number
  }
  topSubjects: any[]
  allSubjects: any[]
}

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  '7d': '7j',
  '30d': '30j',
  '90d': '90j',
  '12m': '12m',
  'all': 'TOUT'
}

const PERIOD_DESCRIPTION: Record<DashboardPeriod, string> = {
  '7d': 'ces 7 derniers jours',
  '30d': 'ces 30 derniers jours',
  '90d': 'ces 90 derniers jours',
  '12m': 'ces 12 derniers mois',
  'all': 'depuis le début'
}

function TrendBadge({ value }: { value: number }) {
  if (value === 0) {
    return (
      <div className="kpi-trend" style={{ color: 'var(--text-4)' }}>
        <Minus size={12} />
        Stable
      </div>
    )
  }
  const isPositive = value > 0
  return (
    <div className="kpi-trend" style={{ color: isPositive ? 'var(--sage)' : 'var(--ruby)' }}>
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {isPositive ? '+' : ''}{value}% vs période précédente
    </div>
  )
}

export default function ContributorDashboardClient({
  user, period, kpi, topSubjects, allSubjects
}: ContributorDashboardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const result = await getUserActiveTransactionsAction()
      if (result.success && result.data) {
        setUnreadCount(result.data.length)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handlePeriodChange = (newPeriod: DashboardPeriod) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', newPeriod)
    startTransition(() => {
      router.push(`/contributeur?${params.toString()}`)
    })
  }

  const draftCount = allSubjects.filter(s => s.status === 'DRAFT').length
  const periods: DashboardPeriod[] = ['7d', '30d', '90d', '12m', 'all']

  return (
    <div className="admin-page-content">
      {/* Header */}
      <div className="admin-header">
        <div>
          <div className="admin-header-badge">
            <BarChart3 size={12} />
            Dashboard Contributeur
          </div>
          <h1 className="admin-title">Ravi de vous revoir, {user.prenom} !</h1>
          <p className="admin-subtitle">
            Voici un aperçu de la performance de votre catalogue pédagogique {PERIOD_DESCRIPTION[period]}.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link href="/contributeur/sujets/nouveau" className="admin-btn admin-btn-primary">
            <Edit3 size={16} />
            Nouveau sujet
          </Link>

          <Link 
            href="/notifications" 
            className="contrib-notif-btn" 
            data-count={unreadCount}
            aria-label={`Notifications (${unreadCount} non lue${unreadCount > 1 ? 's' : ''})`}
            title="Voir mes notifications"
          >
            <Bell size={20} />
          </Link>
        </div>
      </div>

      {/* Period switcher (U9) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <div className="contrib-period-switcher" role="tablist" aria-label="Période d'analyse">
          {periods.map(p => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={period === p}
              className={`contrib-period-btn ${period === p ? 'active' : ''}`}
              onClick={() => handlePeriodChange(p)}
              disabled={isPending}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid (B5 + U7) */}
      <div className="kpi-grid" style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s ease' }}>
        <div className="kpi-card contrib-animate-in">
          <div className="kpi-header">
            <span className="kpi-title">Revenus totaux</span>
            <div className="kpi-icon" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className="kpi-value gold">{kpi.revenue.toLocaleString('fr-FR')} <small>Ar</small></div>
          <TrendBadge value={kpi.revenueTrend} />
        </div>

        <div className="kpi-card contrib-animate-in">
          <div className="kpi-header">
            <span className="kpi-title">Ventes</span>
            <div className="kpi-icon" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className="kpi-value">{kpi.sales} <small>sujets</small></div>
          <TrendBadge value={kpi.salesTrend} />
        </div>

        <div className="kpi-card contrib-animate-in">
          <div className="kpi-header">
            <span className="kpi-title">Sujets publiés</span>
            <div className="kpi-icon" style={{ background: 'var(--sage-dim)', color: 'var(--sage)' }}>
              <FileText size={16} />
            </div>
          </div>
          <div className="kpi-value">{kpi.published}</div>
          <div className="kpi-trend" style={{ color: 'var(--sage)' }}>En ligne &amp; Actifs</div>
        </div>

        <div className="kpi-card contrib-animate-in">
          <div className="kpi-header">
            <span className="kpi-title">Note moyenne</span>
            <div className="kpi-icon" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>
              <Star size={16} />
            </div>
          </div>
          <div className="kpi-value">
            {kpi.averageRating > 0 ? kpi.averageRating.toFixed(1) : '—'}
            <small> / 5</small>
          </div>
          <div className="kpi-trend">
            {kpi.ratedCount > 0
              ? `${kpi.ratedCount} sujet${kpi.ratedCount > 1 ? 's' : ''} noté${kpi.ratedCount > 1 ? 's' : ''}`
              : 'Pas encore de notes'}
          </div>
        </div>
      </div>

      {/* Quick actions (U6) */}
      <div className="contrib-quick-actions">
        <Link href="/contributeur/sujets/nouveau" className="contrib-quick-action">
          <div className="contrib-quick-action-icon">
            <PlusCircle size={20} />
          </div>
          <div className="contrib-quick-action-body">
            <p className="contrib-quick-action-title">Créer un sujet</p>
            <p className="contrib-quick-action-desc">Publier une nouvelle création</p>
          </div>
        </Link>

        <Link href="/contributeur/sujets" className="contrib-quick-action">
          <div className="contrib-quick-action-icon" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
            <FileText size={20} />
          </div>
          <div className="contrib-quick-action-body">
            <p className="contrib-quick-action-title">Mes sujets</p>
            <p className="contrib-quick-action-desc">Gérer mon catalogue</p>
          </div>
        </Link>

        <Link href="/contributeur/analytiques" className="contrib-quick-action">
          <div className="contrib-quick-action-icon" style={{ background: 'var(--sage-dim)', color: 'var(--sage)' }}>
            <BarChart3 size={20} />
          </div>
          <div className="contrib-quick-action-body">
            <p className="contrib-quick-action-title">Analytiques</p>
            <p className="contrib-quick-action-desc">Performance détaillée</p>
          </div>
        </Link>

        <Link href="/contributeur/retraits" className="contrib-quick-action">
          <div className="contrib-quick-action-icon" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>
            <Wallet size={20} />
          </div>
          <div className="contrib-quick-action-body">
            <p className="contrib-quick-action-title">Retraits</p>
            <p className="contrib-quick-action-desc">Retirer mes gains</p>
          </div>
        </Link>
      </div>

      {/* Content Split (D4) */}
      <div className="contrib-split">
        {/* Top Subjects */}
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="contrib-card-header">
              <h3 className="contrib-card-title">Sujets les plus populaires</h3>
              <Link href="/contributeur/sujets" className="admin-btn admin-btn-outline" style={{ height: '32px', fontSize: '0.75rem' }}>
                Voir tout catalogue
              </Link>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Titre du sujet</th>
                  <th>Ventes</th>
                  <th style={{ textAlign: 'right' }}>Revenus</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {topSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="admin-empty-state">
                        <ShoppingCart size={48} className="admin-empty-state-icon" />
                        <div className="admin-empty-state-text">
                          Aucune vente {PERIOD_DESCRIPTION[period]}.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  topSubjects.map((subject: any) => (
                    <tr key={subject.id}>
                      <td>
                        <div className="contrib-subject-cell">
                          <span className="contrib-subject-title">{subject.titre}</span>
                          <span className="contrib-subject-meta">
                            {subject.matiere || 'Matière N/A'} · {subject.serie || 'Toutes séries'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.9rem' }}>
                          {subject.ventes || 0}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontFamily: 'var(--display)', fontSize: '1rem', color: 'var(--gold)' }}>
                          {(subject.revenus || 0).toLocaleString('fr-FR')} Ar
                        </span>
                      </td>
                      <td>
                        <Link href={`/sujet/${subject.id}`} style={{ color: 'var(--text-4)' }} aria-label="Voir le sujet">
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="admin-card">
          <div className="admin-card-body">
            <h3 className="contrib-card-title" style={{ marginBottom: '1.5rem' }}>Statut de votre catalogue</h3>

            <div className="contrib-status-list">
              <Link
                href="/contributeur/sujets?status=PUBLISHED"
                className="contrib-status-row"
                style={{ textDecoration: 'none' }}
              >
                <div className="contrib-status-row-left">
                  <div className="status-dot status-green" style={{ width: '10px', height: '10px' }}></div>
                  <span className="contrib-status-row-label">Vérifiés &amp; En ligne</span>
                </div>
                <span className="contrib-status-row-val">{kpi.published}</span>
              </Link>

              <Link
                href="/contributeur/sujets?status=PENDING"
                className="contrib-status-row"
                style={{ textDecoration: 'none' }}
              >
                <div className="contrib-status-row-left">
                  <div className="status-dot status-amber" style={{ width: '10px', height: '10px' }}></div>
                  <span className="contrib-status-row-label">En attente de revue</span>
                </div>
                <span className="contrib-status-row-val">{kpi.pending}</span>
              </Link>

              <Link
                href="/contributeur/sujets?status=DRAFT"
                className="contrib-status-row"
                style={{ textDecoration: 'none' }}
              >
                <div className="contrib-status-row-left">
                  <div className="status-dot status-gray" style={{ width: '10px', height: '10px' }}></div>
                  <span className="contrib-status-row-label">Brouillons persistés</span>
                </div>
                <span className="contrib-status-row-val">{draftCount}</span>
              </Link>
            </div>

            <div className="contrib-insight">
              <p className="contrib-insight-text">
                <Lightbulb size={14} style={{ display: 'inline', marginRight: '6px', color: 'var(--gold)', verticalAlign: 'middle' }} />
                <strong>Astuce :</strong> Les sujets avec une correction détaillée se vendent 3x plus vite.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
