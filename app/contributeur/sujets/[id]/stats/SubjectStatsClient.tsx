'use client'

import Link from 'next/link'
import {
  ArrowLeft, Download, Star, ShoppingCart, DollarSign, TrendingUp,
  Eye, FileText, Edit3, BarChart3, Users
} from 'lucide-react'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'

interface SubjectStatsClientProps {
  user: { prenom: string; nom: string; role: string }
  subject: any
  stats: { totalSales: number; totalRevenue: number; averageRating: number; totalDownloads: number }
  salesHistory: any[]
  recentPurchases: any[]
}

function formatMonthLabel(raw: string) {
  if (!raw) return ''
  const parts = raw.split('-')
  return parts.length >= 2 ? parts[1] : raw
}

export default function SubjectStatsClient({
  user, subject, stats, salesHistory, recentPurchases
}: SubjectStatsClientProps) {
  if (!subject) {
    return (
      <div className="admin-page-content">
        <AdminBreadcrumb
          homeHref="/contributeur"
          homeLabel="Dashboard Contributeur"
          items={[
            { label: 'Mes sujets', href: '/contributeur/sujets' },
            { label: 'Statistiques' }
          ]}
        />
        <div className="admin-empty-state" style={{ padding: '4rem 2rem' }}>
          <FileText size={48} className="admin-empty-state-icon" />
          <div className="admin-empty-state-text">Sujet non trouvé ou accès refusé.</div>
          <Link href="/contributeur/sujets" className="admin-btn admin-btn-primary" style={{ marginTop: '1rem' }}>
            <ArrowLeft size={14} />
            Retour aux sujets
          </Link>
        </div>
      </div>
    )
  }

  const maxRevenue = Math.max(...salesHistory.map((h: any) => Number(h.revenue) || 0), 1)
  const gridLabels = [maxRevenue, Math.round(maxRevenue * 0.75), Math.round(maxRevenue * 0.5), Math.round(maxRevenue * 0.25), 0]

  return (
    <div className="admin-page-content">
      {/* Breadcrumb */}
      <AdminBreadcrumb
        homeHref="/contributeur"
        homeLabel="Dashboard Contributeur"
        items={[
          { label: 'Mes sujets', href: '/contributeur/sujets' },
          { label: subject.titre || 'Sujet' }
        ]}
      />

      {/* Header */}
      <div className="admin-header">
        <div>
          <div className="admin-header-badge">
            <BarChart3 size={12} />
            Statistiques détaillées
          </div>
          <h1 className="admin-title">{subject.titre}</h1>
          <p className="admin-subtitle">
            Analysez les performances de ce sujet en temps réel.
          </p>
        </div>
        <div className="admin-header-actions">
          <Link href="/contributeur/sujets" className="admin-btn admin-btn-outline">
            <ArrowLeft size={14} />
            Retour
          </Link>
        </div>
      </div>

      {/* Subject header card (D1) */}
      <div className="contrib-subject-header-card">
        <div className="contrib-subject-header-left">
          <div className="contrib-subject-header-icon">
            <FileText size={24} />
          </div>
          <div className="contrib-subject-header-body">
            <h2 className="contrib-subject-header-title">{subject.titre}</h2>
            <div className="contrib-subject-header-meta">
              {subject.matiere} • {subject.annee} • {subject.type || 'Sujet'}
            </div>
          </div>
        </div>
        <div className="contrib-subject-header-actions">
          <Link href={`/sujet/${subject.id}`} className="admin-btn admin-btn-outline">
            <Eye size={14} />
            Voir
          </Link>
          <Link href={`/contributeur/nouveau?id=${subject.id}`} className="admin-btn admin-btn-outline">
            <Edit3 size={14} />
            Modifier
          </Link>
        </div>
      </div>

      {/* KPI Grid (D1) */}
      <div className="kpi-grid contrib-animate-in">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Revenus totaux</span>
            <div className="kpi-icon" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className="kpi-value gold">
            {Number(stats.totalRevenue).toLocaleString('fr-FR')} <small>Ar</small>
          </div>
          <div className="kpi-trend">
            {Number(stats.totalSales)} vente{Number(stats.totalSales) > 1 ? 's' : ''} confirmée{Number(stats.totalSales) > 1 ? 's' : ''}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Ventes totales</span>
            <div className="kpi-icon" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className="kpi-value">{Number(stats.totalSales)}</div>
          <div className="kpi-trend">Achats confirmés</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Note moyenne</span>
            <div className="kpi-icon" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>
              <Star size={16} />
            </div>
          </div>
          <div className="kpi-value">
            {Number(stats.averageRating) > 0 ? Number(stats.averageRating).toFixed(1) : '—'}
            <small> / 5</small>
          </div>
          <div className="kpi-trend" style={{ color: Number(stats.averageRating) >= 4 ? 'var(--sage)' : 'var(--text-4)' }}>
            {Number(stats.averageRating) >= 4.5 ? 'Excellent' : Number(stats.averageRating) >= 3.5 ? 'Bien' : 'À améliorer'}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Téléchargements</span>
            <div className="kpi-icon" style={{ background: 'var(--sage-dim)', color: 'var(--sage)' }}>
              <Download size={16} />
            </div>
          </div>
          <div className="kpi-value">{Number(stats.totalDownloads)}</div>
          <div className="kpi-trend">Consultations</div>
        </div>
      </div>

      {/* Chart + Purchases (split) */}
      <div className="contrib-split-analytics">
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="contrib-card-header">
              <h3 className="contrib-card-title">Évolution des ventes</h3>
              <TrendingUp size={18} style={{ color: 'var(--gold)' }} />
            </div>

            <div className="contrib-chart" role="img" aria-label="Graphique des revenus mensuels">
              {salesHistory.length > 0 && (
                <div className="contrib-chart-grid" aria-hidden="true">
                  {gridLabels.map((val, i) => (
                    <div key={i} className="contrib-chart-gridline">
                      <span className="contrib-chart-gridline-label">
                        {val >= 1000 ? `${Math.round(val / 1000)}k` : val}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {salesHistory.length === 0 ? (
                <div className="contrib-chart-empty">
                  Aucune donnée de ventes sur 6 mois
                </div>
              ) : (
                salesHistory.map((month: any, index: number) => {
                  const revenue = Number(month.revenue) || 0
                  const sales = Number(month.sales) || 0
                  const height = (revenue / maxRevenue) * 100
                  return (
                    <div key={index} className="contrib-chart-col">
                      <div className="contrib-chart-bar-wrap">
                        <div
                          className="contrib-chart-bar"
                          style={{ height: `${Math.max(height, 2)}%` }}
                          aria-label={`${revenue} Ar, ${sales} ventes`}
                        />
                      </div>
                      <div className="contrib-chart-tooltip">
                        {revenue.toLocaleString('fr-FR')} Ar<br />
                        <span style={{ color: 'var(--text-4)' }}>{sales} vente{sales > 1 ? 's' : ''}</span>
                      </div>
                      <span className="contrib-chart-label">
                        {formatMonthLabel(month.month)}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent purchases */}
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="contrib-card-header">
              <h3 className="contrib-card-title">
                <Users size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6, color: 'var(--gold)' }} />
                Achats récents
              </h3>
              <span className="admin-tab-count">{recentPurchases.length}</span>
            </div>
            <div className="contrib-purchases-list">
              {recentPurchases.length === 0 ? (
                <div className="contrib-chart-empty">Aucun achat récent</div>
              ) : (
                recentPurchases.map((purchase: any) => (
                  <div key={purchase.id} className="contrib-purchase-row">
                    <div className="contrib-purchase-avatar">
                      {(purchase.prenom?.charAt(0) || 'U').toUpperCase()}
                    </div>
                    <div className="contrib-purchase-name">
                      {purchase.prenom} {purchase.nom?.charAt(0) || ''}.
                    </div>
                    <div className="contrib-purchase-amount">
                      {purchase.creditsAmount} cr
                    </div>
                    <div className="contrib-purchase-date">
                      {new Date(purchase.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
