'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Download, Star, ShoppingCart, DollarSign, BarChart3, LayoutDashboard, FileText, PlusCircle, CreditCard, User } from 'lucide-react'

interface AnalyticsClientProps {
  user: {
    prenom: string
    nom: string
    role: string
  }
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

export default function AnalyticsClient({ user, stats, earningsHistory, topSubjects, subjectStats }: AnalyticsClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '12m'>('12m')

  const maxEarnings = Math.max(...earningsHistory.map(h => h.earnings), 1)

  return (
    <div className="admin-page-content">
      {/* Header Section */}
      <div className="admin-header">
        <div>
          <div className="admin-header-badge">
            <BarChart3 size={12} />
            Statistiques & Insights
          </div>
          <h1 className="admin-title">Analytiques de performance</h1>
          <p className="admin-subtitle">
            Analysez l'impact de vos publications et optimisez vos revenus.
          </p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-outline">
            <Download size={16} />
            Exporter les données
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Revenus totaux</span>
            <div className="kpi-icon" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className="kpi-value gold">{stats.totalEarnings.toLocaleString('fr-FR')} <small>Ar</small></div>
          <div className="kpi-trend">
            Moyenne: {(stats.totalSales > 0 ? stats.totalEarnings / stats.totalSales : 0).toLocaleString('fr-FR')} Ar / vente
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Ventes confirmées</span>
            <div className="kpi-icon" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className="kpi-value">{stats.totalSales} <small>ventes</small></div>
          <div className="kpi-trend">Volume d'achat total</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Satisfaction élève</span>
            <div className="kpi-icon" style={{ background: 'var(--sage-dim)', color: 'var(--sage)' }}>
              <Star size={16} />
            </div>
          </div>
          <div className="kpi-value">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '--'} <small>/ 5</small></div>
          <div className="kpi-trend" style={{ color: stats.averageRating >= 4 ? 'var(--sage)' : 'var(--text-4)' }}>
            {stats.averageRating >= 4.5 ? 'Excellent' : stats.averageRating >= 3.5 ? 'Bien' : 'N/A'}
          </div>
        </div>

        <div className="kpi-card" style={{ border: '1px solid var(--gold-line)', background: 'var(--gold-dim)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Téléchargements</span>
            <div className="kpi-icon" style={{ background: 'var(--gold)', color: 'white' }}>
              <Download size={16} />
            </div>
          </div>
          <div className="kpi-value">{stats.totalDownloads}</div>
          <div className="kpi-trend">Usage de vos sujets</div>
        </div>
      </div>

      {/* Chart and Top Items Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem', marginTop: '2.5rem' }}>
        <div className="admin-card">
          <div className="admin-card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Évolution des revenus</h3>
              <div className="admin-tabs" style={{ marginBottom: 0 }}>
                <button 
                  className={`admin-tab ${selectedPeriod === '7d' ? 'admin-tab-active' : ''}`}
                  onClick={() => setSelectedPeriod('7d')}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >7j</button>
                <button 
                  className={`admin-tab ${selectedPeriod === '30d' ? 'admin-tab-active' : ''}`}
                  onClick={() => setSelectedPeriod('30d')}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >30j</button>
                <button 
                  className={`admin-tab ${selectedPeriod === '12m' ? 'admin-tab-active' : ''}`}
                  onClick={() => setSelectedPeriod('12m')}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >12m</button>
              </div>
            </div>
  
            <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '1rem', position: 'relative' }}>
            {earningsHistory.length === 0 ? (
              <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-4)' }}>Aucune donnée de revenus disponible</div>
            ) : (
              earningsHistory.map((month, index) => {
                const height = (month.earnings / maxEarnings) * 100
                return (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div 
                      style={{ 
                        width: '100%', 
                        height: `${Math.max(height, 5)}%`, 
                        background: 'linear-gradient(180deg, var(--gold) 0%, var(--gold-lo) 100%)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: 0.85,
                      }}
                      title={`${month.earnings} Ar`}
                    />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
                      {month.month.split('-')[1] || month.month}
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Top performants</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topSubjects.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-4)', padding: '2rem' }}>Aucun sujet publié</p>
              ) : (
                topSubjects.map((subject, index) => (
                  <div 
                    key={subject.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1.25rem', 
                      padding: '1rem', 
                      background: 'var(--surface)', 
                      borderRadius: 'var(--r)',
                      border: '1px solid var(--b2)'
                    }}
                  >
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', background: index === 0 ? 'var(--gold)' : 'var(--b2)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      color: index === 0 ? 'white' : 'var(--text-3)', fontSize: '0.8rem', fontWeight: 700
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subject.titre}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>{subject.sales} ventes</div>
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>
                      {(subject.revenue || 0).toLocaleString('fr-FR')} Ar
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Subjects Table */}
      <div className="admin-card" style={{ marginTop: '2.5rem' }}>
        <div className="admin-card-body" style={{ paddingBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Détail par sujet</h3>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sujet & Matière</th>
                <th>Ventes</th>
                <th>Revenus</th>
                <th>Satisfaction</th>
                <th>Impact</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjectStats.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty-state">
                      <BarChart3 size={48} className="admin-empty-state-icon" />
                      <div className="admin-empty-state-text">Pas encore de statistiques disponibles</div>
                    </div>
                  </td>
                </tr>
              ) : (
                subjectStats.map((subject) => (
                  <tr key={subject.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-2)' }}>{subject.titre}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-4)' }}>{subject.matiere} • {subject.annee}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--mono)' }}>{subject.sales || 0}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--display)', fontSize: '1rem', color: 'var(--gold)' }}>
                        {(subject.revenue || 0).toLocaleString('fr-FR')} <small>Ar</small>
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {subject.rating > 0 ? (
                          <>
                            <Star size={12} fill="var(--gold)" color="var(--gold)" />
                            <span style={{ fontWeight: 600 }}>{subject.rating.toFixed(1)}</span>
                          </>
                        ) : '--'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-3)', fontSize: '0.8rem' }}>
                        <Download size={14} />
                        {subject.downloadCount || 0}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/sujet/${subject.id}`} className="admin-btn admin-btn-outline" style={{ height: '28px', fontSize: '0.7rem', padding: '0 0.75rem' }}>
                        Détails
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}