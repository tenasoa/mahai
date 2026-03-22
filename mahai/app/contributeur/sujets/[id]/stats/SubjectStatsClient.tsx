'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowLeft, Download, Star, ShoppingCart, DollarSign, TrendingUp, Eye } from 'lucide-react'
import '../../../contributeur.css'

interface SubjectStatsClientProps {
  user: {
    prenom: string
    nom: string
    role: string
  }
  subject: any
  stats: {
    totalSales: number
    totalRevenue: number
    averageRating: number
    totalDownloads: number
  }
  salesHistory: any[]
  recentPurchases: any[]
}

export default function SubjectStatsClient({ user, subject, stats, salesHistory, recentPurchases }: SubjectStatsClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Persistance du sidebar
  useEffect(() => {
    const saved = localStorage.getItem('mahai_sidebar_collapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  // Appliquer le thème dark
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  // Max value for bar chart scaling
  const maxRevenue = Math.max(...salesHistory.map(h => h.revenue), 1)

  if (!subject) {
    return (
      <div className={`contributor-dashboard-page ${isCollapsed ? 'sidebar-collapsed' : ''}`} data-theme="dark">
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: '2rem', color: 'var(--text)', marginBottom: '1rem' }}>Sujet non trouvé</h1>
          <Link href="/contributeur/sujets" style={{ color: 'var(--gold)', textDecoration: 'none' }}>← Retour aux sujets</Link>
        </div>
      </div>
    )
  }

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
            {stats.totalRevenue.toLocaleString('fr-FR')}
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--gold-lo)' }}> Ar</span>
          </div>
          <div className="sb-e-sub">Pour ce sujet</div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section"><span className="sb-section-text">Navigation</span></div>
          <Link className="sb-link" href="/contributeur/sujets">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5m7-7-7 7 7 7"/>
            </svg>
            <span className="sb-link-text">Retour aux sujets</span>
          </Link>
          <Link className="sb-link" href={`/sujet/${subject.id}`}>
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <span className="sb-link-text">Voir le sujet</span>
          </Link>
        </nav>
      </aside>

      {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={() => {
          const newState = !isCollapsed
          setIsCollapsed(newState)
          localStorage.setItem('mahai_sidebar_collapsed', String(newState))
        }}
        title={isCollapsed ? 'Déployer le menu' : 'Réduire le menu'}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Main */}
      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/contributeur/sujets" style={{ color: 'var(--text-3)' }}>
              <ArrowLeft size={20} />
            </Link>
            <div>
              Statistiques de <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{subject.titre}</em>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          {/* Subject Header */}
          <div className="subject-stats-header">
            <div className="subject-info">
              <div className="subject-icon" style={{ width: '48px', height: '48px', background: 'var(--gold-dim)', border: '1px solid var(--gold-line)', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: '0' }}>
                📄
              </div>
              <div className="subject-details">
                <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', color: 'var(--text)', marginBottom: '0.35rem' }}>{subject.titre}</h2>
                <div className="subject-meta" style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-3)' }}>
                  {subject.matiere} • {subject.annee} • {subject.type}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href={`/sujet/${subject.id}`} className="btn-tbl" style={{ fontFamily: 'var(--mono)', fontSize: '0.58rem', padding: '0.4rem 0.8rem', borderRadius: 'var(--r)', background: 'transparent', border: '1px solid var(--b1)', color: 'var(--text-3)', cursor: 'none', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.08em' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold-line)'; e.currentTarget.style.color = 'var(--gold)' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--b1)'; e.currentTarget.style.color = 'var(--text-3)' }}>Voir</Link>
              <Link href={`/contributeur/nouveau?id=${subject.id}`} className="btn-tbl" style={{ fontFamily: 'var(--mono)', fontSize: '0.58rem', padding: '0.4rem 0.8rem', borderRadius: 'var(--r)', background: 'transparent', border: '1px solid var(--b1)', color: 'var(--text-3)', cursor: 'none', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.08em' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold-line)'; e.currentTarget.style.color = 'var(--gold)' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--b1)'; e.currentTarget.style.color = 'var(--text-3)' }}>Modifier</Link>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="stats-overview">
            <div className="stat-card">
              <div className="label">Revenus totaux</div>
              <div className="value" style={{ color: 'var(--gold)' }}>{stats.totalRevenue.toLocaleString('fr-FR')} <span style={{ fontSize: '1rem', color: 'var(--gold-lo)' }}>Ar</span></div>
              <div className="sub" style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-3)' }}>
                <DollarSign size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                {stats.totalSales} ventes
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Ventes totales</div>
              <div className="value">{stats.totalSales}</div>
              <div className="sub" style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-3)' }}>
                <ShoppingCart size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                Achats confirmés
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Note moyenne</div>
              <div className="value">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '--'} <span style={{ fontSize: '1rem', color: 'var(--gold)' }}>★</span></div>
              <div className="sub" style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-3)' }}>
                <Star size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                {stats.averageRating >= 4.5 ? 'Excellent' : stats.averageRating >= 3.5 ? 'Bien' : 'À améliorer'}
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Downloads</div>
              <div className="value">{stats.totalDownloads}</div>
              <div className="sub" style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-3)' }}>
                <Download size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                Consultations
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="chart-card" style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)', padding: '1.75rem', marginBottom: '2rem' }}>
            <div className="chart-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div className="chart-title" style={{ fontFamily: 'var(--display)', fontSize: '1.3rem', color: 'var(--text)' }}>Évolution des <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>ventes</em></div>
              <TrendingUp size={20} style={{ color: 'var(--gold)' }} />
            </div>
            <div className="chart-bars" style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '140px', marginTop: '0.75rem' }}>
              {salesHistory.length === 0 ? (
                <div style={{ textAlign: 'center', width: '100%', padding: '2rem', color: 'var(--text-3)' }}>
                  Aucune donnée disponible
                </div>
              ) : (
                salesHistory.map((month, index) => {
                  const height = (month.revenue / maxRevenue) * 100
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
                        title={`${month.revenue} Ar`}
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

          {/* Recent Purchases */}
          <div className="panel" style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
            <div className="p-head" style={{ background: 'var(--lift)', borderBottom: '1px solid var(--b1)', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div className="p-dot" style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)' }}></div>
              <span className="p-label" style={{ fontFamily: 'var(--mono)', fontSize: '0.57rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Eye size={14} />
                Achats récents
              </span>
            </div>
            <div className="p-body" style={{ padding: '0.85rem 1rem' }}>
              {recentPurchases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>
                  Aucun achat récent
                </div>
              ) : (
                recentPurchases.map((purchase) => (
                  <div 
                    key={purchase.id} 
                    className="earner-row" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.65rem', 
                      padding: '0.45rem 0', 
                      borderBottom: '1px solid var(--b3)' 
                    }}
                  >
                    <div className="er-av" style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--gold-dim)', border: '1px solid var(--gold-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: '0.72rem', color: 'var(--gold)', flexShrink: '0' }}>
                      {(purchase.prenom?.charAt(0) || 'U').toUpperCase()}
                    </div>
                    <div className="er-name" style={{ fontSize: '0.78rem', color: 'var(--text)', flex: 1 }}>
                      {purchase.prenom} {purchase.nom?.charAt(0)}.
                    </div>
                    <div className="er-amount" style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--gold)' }}>
                      {purchase.creditsAmount} cr
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.58rem', color: 'var(--text-4)', minWidth: '80px', textAlign: 'right' }}>
                      {new Date(purchase.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
