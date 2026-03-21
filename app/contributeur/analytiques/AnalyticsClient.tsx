'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, TrendingUp, Download, Star, ShoppingCart, DollarSign, BarChart3 } from 'lucide-react'
import '../contributeur.css'

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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '12m'>('12m')

  // Appliquer le thème dark
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  // Max value for bar chart scaling
  const maxEarnings = Math.max(...earningsHistory.map(h => h.earnings), 1)

  return (
    <div className={`contributor-dashboard-page ${isCollapsed ? 'sidebar-collapsed' : ''}`} data-theme="dark">
      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} id="sidebar">
        <Link href="/" className="sb-logo">
          Mah<span className="sb-gem" />AI
        </Link>

        <div className="sb-user">
          <div className="sb-avatar">
            {(user.prenom?.charAt(0) || 'C').toUpperCase()}
          </div>
          <div>
            <div className="sb-name">{user.prenom} {user.nom}</div>
            <div className="sb-badge">Contributeur certifié ✦</div>
          </div>
        </div>

        <div className="sb-earnings">
          <div className="sb-e-label">Revenus totaux</div>
          <div className="sb-e-val">
            {stats.totalEarnings.toLocaleString('fr-FR')}
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--gold-lo)' }}> Ar</span>
          </div>
          <div className="sb-e-sub">+0 Ar ce mois</div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section"><span className="sb-section-text">Tableau de bord</span></div>
          <Link className="sb-link" href="/contributeur">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span className="sb-link-text">Vue d&apos;ensemble</span>
          </Link>
          <Link className="sb-link" href="/contributeur/sujets">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span className="sb-link-text">Mes sujets</span>
          </Link>
          <Link className="sb-link" href="/contributeur/nouveau">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 4v16m8-8H4"/>
            </svg>
            <span className="sb-link-text">Nouveau sujet</span>
          </Link>

          <div className="sb-section" style={{ marginTop: '0.75rem' }}><span className="sb-section-text">Finances</span></div>
          <Link className="sb-link" href="/contributeur/retraits">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            <span className="sb-link-text">Retraits MVola</span>
          </Link>
          <Link className="sb-link active" href="/contributeur/analytiques">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <span className="sb-link-text">Analytiques</span>
          </Link>

          <div className="sb-section" style={{ marginTop: '0.75rem' }}><span className="sb-section-text">Compte</span></div>
          <Link className="sb-link" href="/profil">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span className="sb-link-text">Profil public</span>
          </Link>
        </nav>

        <div className="sb-bottom">
          <button className="btn-new" onClick={() => window.location.href = '/contributeur/nouveau'}>
            + Publier un sujet
          </button>
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Déployer le menu' : 'Réduire le menu'}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Main */}
      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-title">
            Analytiques <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>& performances</em>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          {/* Stats Overview */}
          <div className="stats-grid">
            <div className="panel">
              <div className="p-head">
                <div className="p-dot"></div>
                <span className="p-label">Revenus totaux</span>
              </div>
              <div className="p-body">
                <div style={{ fontFamily: 'var(--display)', fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>
                  {stats.totalEarnings.toLocaleString('fr-FR')} <span style={{ fontSize: '1rem', color: 'var(--gold-lo)' }}>Ar</span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-3)' }}>
                  {stats.totalSales} ventes • Moyenne: {(stats.totalSales > 0 ? stats.totalEarnings / stats.totalSales : 0).toLocaleString('fr-FR')} Ar/vente
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="p-head">
                <div className="p-dot"></div>
                <span className="p-label">Ventes totales</span>
              </div>
              <div className="p-body">
                <div style={{ fontFamily: 'var(--display)', fontSize: '2.5rem', color: 'var(--text)' }}>
                  {stats.totalSales}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-3)' }}>
                  <ShoppingCart size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  Achats confirmés
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="p-head">
                <div className="p-dot"></div>
                <span className="p-label">Note moyenne</span>
              </div>
              <div className="p-body">
                <div style={{ fontFamily: 'var(--display)', fontSize: '2.5rem', color: 'var(--text)' }}>
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '--'} <span style={{ fontSize: '1rem', color: 'var(--gold)' }}>★</span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-3)' }}>
                  <Star size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  {stats.averageRating >= 4.5 ? 'Excellent' : stats.averageRating >= 3.5 ? 'Bien' : 'À améliorer'}
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Chart */}
          <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-title">Évolution des <em>revenus</em></div>
                <div className="chart-tabs">
                  <button 
                    className={`ct ${selectedPeriod === '7d' ? 'active' : ''}`}
                    onClick={() => setSelectedPeriod('7d')}
                  >7j</button>
                  <button 
                    className={`ct ${selectedPeriod === '30d' ? 'active' : ''}`}
                    onClick={() => setSelectedPeriod('30d')}
                  >30j</button>
                  <button 
                    className={`ct ${selectedPeriod === '12m' ? 'active' : ''}`}
                    onClick={() => setSelectedPeriod('12m')}
                  >12m</button>
                </div>
              </div>
              <div className="chart-bars">
                {earningsHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', width: '100%', padding: '2rem', color: 'var(--text-3)' }}>
                    Aucune donnée disponible
                  </div>
                ) : (
                  earningsHistory.map((month, index) => {
                    const height = (month.earnings / maxEarnings) * 100
                    return (
                      <div key={index} className="bar-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                        <div 
                          className="bar" 
                          style={{ 
                            width: '100%', 
                            height: `${height}%`, 
                            borderRadius: 'var(--r) var(--r) 0 0', 
                            background: 'linear-gradient(180deg, var(--gold), var(--gold-lo))',
                            transition: 'height 0.8s ease',
                            cursor: 'none'
                          }}
                          title={`${month.earnings} Ar`}
                        />
                        <div className="bar-label" style={{ fontFamily: 'var(--mono)', fontSize: '0.58rem', color: 'var(--text-4)', letterSpacing: '0.04em' }}>
                          {month.month.slice(5)}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Top Subjects */}
            <div className="top-papers" style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)', padding: '1.5rem' }}>
              <div className="tp-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div className="tp-title" style={{ fontFamily: 'var(--display)', fontSize: '1.1rem', color: 'var(--text)' }}>Top sujets</div>
                <TrendingUp size={16} style={{ color: 'var(--gold)' }} />
              </div>
              <div className="tp-list">
                {topSubjects.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>
                    Aucun sujet publié
                  </div>
                ) : (
                  topSubjects.map((subject, index) => (
                    <div 
                      key={subject.id} 
                      className="tp-item" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.85rem', 
                        padding: '0.65rem', 
                        background: 'var(--surface)', 
                        border: '1px solid var(--b2)', 
                        borderRadius: 'var(--r)', 
                        transition: 'border-color 0.2s', 
                        cursor: 'none',
                        marginBottom: '0.5rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold-line)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--b2)'}
                    >
                      <div className="tp-rank" style={{ fontFamily: 'var(--display)', fontSize: '1.3rem', color: index === 0 ? 'var(--gold)' : 'var(--gold-lo)', fontWeight: 300, width: '24px', textAlign: 'center' }}>
                        {index + 1}
                      </div>
                      <div className="tp-info" style={{ flex: 1, minWidth: 0 }}>
                        <div className="tp-name" style={{ fontSize: '0.8rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.18rem' }}>
                          {subject.titre}
                        </div>
                        <div className="tp-meta" style={{ fontFamily: 'var(--mono)', fontSize: '0.58rem', color: 'var(--text-3)' }}>
                          {subject.sales} ventes
                        </div>
                      </div>
                      <div className="tp-rev" style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--gold)', flexShrink: 0 }}>
                        {(subject.revenue || 0).toLocaleString('fr-FR')} Ar
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Subject Stats Table */}
          <div className="papers-section" style={{ marginBottom: '2rem' }}>
            <div className="table-wrap" style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              <div className="table-head" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px', gap: 0, padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--b1)', background: 'var(--surface)' }}>
                <div className="th">Sujet</div>
                <div className="th">Ventes</div>
                <div className="th">Revenus</div>
                <div className="th">Note</div>
                <div className="th">Downloads</div>
                <div className="th" style={{ textAlign: 'right' }}>Actions</div>
              </div>
              <div>
                {subjectStats.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>
                    <BarChart3 size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <div>Aucun sujet trouvé</div>
                  </div>
                ) : (
                  subjectStats.map((subject) => (
                    <div 
                      key={subject.id} 
                      className="table-row" 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px', 
                        gap: 0, 
                        padding: '0.9rem 1.25rem', 
                        borderBottom: '1px solid var(--b3)', 
                        alignItems: 'center', 
                        transition: 'background 0.2s', 
                        cursor: 'none' 
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--card-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div className="td td-title">
                        <div className="td-main" style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: 400 }}>
                          {subject.titre}
                        </div>
                        <div className="td-sub" style={{ fontFamily: 'var(--mono)', fontSize: '0.58rem', color: 'var(--text-3)' }}>
                          {subject.matiere} • {subject.annee}
                        </div>
                      </div>
                      <div className="td" style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
                        {subject.sales || 0}
                      </div>
                      <div className="td" style={{ fontSize: '0.82rem', color: 'var(--gold)' }}>
                        {(subject.revenue || 0).toLocaleString('fr-FR')} Ar
                      </div>
                      <div className="td" style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
                        {subject.rating > 0 ? `${subject.rating.toFixed(1)} ★` : '--'}
                      </div>
                      <div className="td" style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
                        <Download size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                        {subject.downloadCount || 0}
                      </div>
                      <div className="td td-actions" style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <Link href={`/sujet/${subject.id}`} className="btn-tbl" style={{ fontFamily: 'var(--mono)', fontSize: '0.58rem', padding: '0.22rem 0.55rem', borderRadius: '2px', background: 'transparent', border: '1px solid var(--b1)', color: 'var(--text-3)', cursor: 'none', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.08em' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold-line)'; e.currentTarget.style.color = 'var(--gold)' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--b1)'; e.currentTarget.style.color = 'var(--text-3)' }}>Voir</Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
