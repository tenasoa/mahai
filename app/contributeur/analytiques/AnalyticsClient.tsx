'use client'

import { useState, useMemo, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  TrendingUp, Download, Star, ShoppingCart, DollarSign, BarChart3,
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useToast } from '@/lib/hooks/useToast'
import type { AnalyticsPeriod } from './actions'

const PAGE_SIZE = 10

interface AnalyticsClientProps {
  user: { prenom: string; nom: string; role: string }
  period: AnalyticsPeriod
  format: 'day' | 'month' | string
  stats: {
    totalEarnings: number
    totalSales: number
    averageRating: number
    totalDownloads: number
  }
  earningsHistory: any[]
  topSubjects: any[]
  subjectStats: any[]
}

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  '7d': '7j',
  '30d': '30j',
  '12m': '12m'
}

type SortKey = 'titre' | 'sales' | 'revenue' | 'rating'
type SortDir = 'asc' | 'desc'

function formatChartLabel(raw: string, format: string) {
  if (!raw) return ''
  if (format === 'day') {
    const parts = raw.split('-')
    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : raw
  }
  const parts = raw.split('-')
  return parts.length >= 2 ? parts[1] : raw
}

export default function AnalyticsClient({
  user, period, format, stats, earningsHistory, topSubjects, subjectStats
}: AnalyticsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const [isPending, startTransition] = useTransition()
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [sortKey, sortDir, period])

  const handlePeriodChange = (newPeriod: AnalyticsPeriod) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', newPeriod)
    startTransition(() => {
      router.push(`/contributeur/analytiques?${params.toString()}`)
    })
  }

  const handleExport = () => {
    if (subjectStats.length === 0) {
      toast.error('Export impossible', 'Aucune donnée à exporter')
      return
    }
    const header = ['Titre', 'Matière', 'Année', 'Type', 'Ventes', 'Revenus (Ar)', 'Note']
    const rows = subjectStats.map((s: any) => [
      (s.titre || '').replace(/"/g, '""'),
      s.matiere || '',
      s.annee || '',
      s.type || '',
      s.sales || 0,
      s.revenue || 0,
      s.rating ? s.rating.toFixed(1) : ''
    ])
    const csv = [
      header.join(';'),
      ...rows.map(r => r.map(c => `"${c}"`).join(';'))
    ].join('\n')
    const bom = '\uFEFF'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytiques-mahai-${period}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export réussi', `${rows.length} ligne${rows.length > 1 ? 's' : ''} exportée${rows.length > 1 ? 's' : ''}.`)
  }

  const maxEarnings = Math.max(...earningsHistory.map((h: any) => Number(h.earnings) || 0), 1)
  const gridLabels = [maxEarnings, Math.round(maxEarnings * 0.75), Math.round(maxEarnings * 0.5), Math.round(maxEarnings * 0.25), 0]

  // Tri + pagination subjectStats
  const sortedStats = useMemo(() => {
    const list = [...subjectStats]
    if (sortKey) {
      list.sort((a: any, b: any) => {
        let aVal = a[sortKey]
        let bVal = b[sortKey]
        if (['sales', 'revenue', 'rating'].includes(sortKey)) {
          aVal = Number(aVal) || 0
          bVal = Number(bVal) || 0
        } else {
          aVal = String(aVal || '').toLowerCase()
          bVal = String(bVal || '').toLowerCase()
        }
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }
    return list
  }, [subjectStats, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sortedStats.length / PAGE_SIZE))
  const pagedStats = sortedStats.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const SortIndicator = ({ keyName }: { keyName: SortKey }) => {
    if (sortKey !== keyName) return <ChevronsUpDown size={12} className="sort-indicator" />
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="sort-indicator" />
      : <ChevronDown size={12} className="sort-indicator" />
  }

  const periods: AnalyticsPeriod[] = ['7d', '30d', '12m']

  return (
    <div className="admin-page-content">
      {/* Header */}
      <div className="admin-header">
        <div>
          <div className="admin-header-badge">
            <BarChart3 size={12} />
            Statistiques &amp; Insights
          </div>
          <h1 className="admin-title">Analytiques de performance</h1>
          <p className="admin-subtitle">
            Analysez l'impact de vos publications et optimisez vos revenus.
          </p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-outline" onClick={handleExport}>
            <Download size={16} />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="kpi-grid contrib-animate-in" style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s ease' }}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Revenus totaux</span>
            <div className="kpi-icon" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className="kpi-value gold">
            {Number(stats.totalEarnings).toLocaleString('fr-FR')} <small>Ar</small>
          </div>
          <div className="kpi-trend">
            Moy.: {Number(stats.totalSales) > 0
              ? Math.round(Number(stats.totalEarnings) / Number(stats.totalSales)).toLocaleString('fr-FR')
              : 0} Ar / vente
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Ventes confirmées</span>
            <div className="kpi-icon" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className="kpi-value">{Number(stats.totalSales)} <small>ventes</small></div>
          <div className="kpi-trend">Volume d'achat sur la période</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Satisfaction élève</span>
            <div className="kpi-icon" style={{ background: 'var(--sage-dim)', color: 'var(--sage)' }}>
              <Star size={16} />
            </div>
          </div>
          <div className="kpi-value">
            {Number(stats.averageRating) > 0 ? Number(stats.averageRating).toFixed(1) : '—'}
            <small> / 5</small>
          </div>
          <div className="kpi-trend" style={{ color: Number(stats.averageRating) >= 4 ? 'var(--sage)' : 'var(--text-4)' }}>
            {Number(stats.averageRating) >= 4.5 ? 'Excellent' : Number(stats.averageRating) >= 3.5 ? 'Bien' : 'N/A'}
          </div>
        </div>

        <div className="kpi-card" style={{ borderColor: 'var(--gold-line)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Sujets publiés</span>
            <div className="kpi-icon" style={{ background: 'var(--gold)', color: '#000' }}>
              <BarChart3 size={16} />
            </div>
          </div>
          <div className="kpi-value">{subjectStats.length}</div>
          <div className="kpi-trend">Catalogue total</div>
        </div>
      </div>

      {/* Chart & Top */}
      <div className="contrib-split-analytics">
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="contrib-card-header">
              <h3 className="contrib-card-title">Évolution des revenus</h3>
              <div className="contrib-period-switcher" role="tablist" aria-label="Période">
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

            <div className="contrib-chart" role="img" aria-label="Graphique des revenus">
              {/* Grid lines horizontales */}
              {earningsHistory.length > 0 && (
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

              {earningsHistory.length === 0 ? (
                <div className="contrib-chart-empty">
                  Aucune donnée de revenus {period === '7d' ? 'sur 7 jours' : period === '30d' ? 'sur 30 jours' : 'sur 12 mois'}
                </div>
              ) : (
                earningsHistory.map((month: any, index: number) => {
                  const earnings = Number(month.earnings) || 0
                  const sales = Number(month.sales) || 0
                  const height = (earnings / maxEarnings) * 100
                  return (
                    <div key={index} className="contrib-chart-col">
                      <div className="contrib-chart-bar-wrap">
                        <div
                          className="contrib-chart-bar"
                          style={{ height: `${Math.max(height, 2)}%` }}
                          aria-label={`${earnings} Ar, ${sales} ventes`}
                        />
                      </div>
                      <div className="contrib-chart-tooltip">
                        {earnings.toLocaleString('fr-FR')} Ar<br />
                        <span style={{ color: 'var(--text-4)' }}>{sales} vente{sales > 1 ? 's' : ''}</span>
                      </div>
                      <span className="contrib-chart-label">
                        {formatChartLabel(month.month, format)}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <h3 className="contrib-card-title" style={{ marginBottom: '1.5rem' }}>Top performants</h3>
            <div className="contrib-top-list">
              {topSubjects.length === 0 ? (
                <p className="contrib-chart-empty">Aucun sujet publié</p>
              ) : (
                topSubjects.map((subject: any, index: number) => (
                  <div key={subject.id} className="contrib-top-row">
                    <div className={`contrib-top-rank ${index === 0 ? 'is-first' : ''}`}>
                      {index + 1}
                    </div>
                    <div className="contrib-top-body">
                      <div className="contrib-top-title">{subject.titre}</div>
                      <div className="contrib-top-meta">{Number(subject.sales) || 0} vente{Number(subject.sales) > 1 ? 's' : ''}</div>
                    </div>
                    <div className="contrib-top-val">
                      {(Number(subject.revenue) || 0).toLocaleString('fr-FR')} Ar
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Detail Table */}
      <div className="admin-card" style={{ marginTop: '2.5rem' }}>
        <div className="admin-card-body" style={{ paddingBottom: '0.5rem' }}>
          <h3 className="contrib-card-title">Détail par sujet</h3>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th
                  className={`is-sortable ${sortKey === 'titre' ? 'is-sorted' : ''}`}
                  onClick={() => handleSort('titre')}
                >
                  Sujet &amp; Matière
                  <SortIndicator keyName="titre" />
                </th>
                <th
                  className={`is-sortable ${sortKey === 'sales' ? 'is-sorted' : ''}`}
                  onClick={() => handleSort('sales')}
                >
                  Ventes
                  <SortIndicator keyName="sales" />
                </th>
                <th
                  className={`is-sortable ${sortKey === 'revenue' ? 'is-sorted' : ''}`}
                  onClick={() => handleSort('revenue')}
                >
                  Revenus
                  <SortIndicator keyName="revenue" />
                </th>
                <th
                  className={`is-sortable ${sortKey === 'rating' ? 'is-sorted' : ''}`}
                  onClick={() => handleSort('rating')}
                >
                  Satisfaction
                  <SortIndicator keyName="rating" />
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedStats.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-empty-state">
                      <BarChart3 size={48} className="admin-empty-state-icon" />
                      <div className="admin-empty-state-text">Pas encore de statistiques disponibles</div>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedStats.map((subject: any) => (
                  <tr key={subject.id}>
                    <td>
                      <div className="contrib-subject-cell">
                        <span className="contrib-subject-title">{subject.titre}</span>
                        <span className="contrib-subject-meta">{subject.matiere} · {subject.annee}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--mono)' }}>{Number(subject.sales) || 0}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--display)', fontSize: '1rem', color: 'var(--gold)' }}>
                        {(Number(subject.revenue) || 0).toLocaleString('fr-FR')} <small>Ar</small>
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {Number(subject.rating) > 0 ? (
                          <>
                            <Star size={12} fill="var(--gold)" color="var(--gold)" />
                            <span style={{ fontWeight: 600 }}>{Number(subject.rating).toFixed(1)}</span>
                          </>
                        ) : <span style={{ color: 'var(--text-4)' }}>—</span>}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        href={`/contributeur/sujets/${subject.id}/stats`}
                        className="admin-btn admin-btn-outline"
                        style={{ height: '28px', fontSize: '0.7rem', padding: '0 0.75rem' }}
                      >
                        Détails
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (U1) */}
        {sortedStats.length > PAGE_SIZE && (
          <div className="contrib-pagination">
            <span className="contrib-pagination-info">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sortedStats.length)} sur {sortedStats.length}
            </span>
            <div className="contrib-pagination-controls">
              <button
                type="button"
                className="contrib-pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span style={{ color: 'var(--text-4)', padding: '0 4px' }}>…</span>
                    )}
                    <button
                      type="button"
                      className={`contrib-pagination-btn ${currentPage === p ? 'is-active' : ''}`}
                      onClick={() => setCurrentPage(p)}
                      aria-label={`Page ${p}`}
                      aria-current={currentPage === p ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                type="button"
                className="contrib-pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
