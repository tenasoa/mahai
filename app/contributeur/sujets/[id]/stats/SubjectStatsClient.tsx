'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Download, Star, ShoppingCart, DollarSign, TrendingUp, Eye, FileText, Edit3 } from 'lucide-react'

interface SubjectStatsClientProps {
  user: { prenom: string; nom: string; role: string }
  subject: any
  stats: { totalSales: number; totalRevenue: number; averageRating: number; totalDownloads: number }
  salesHistory: any[]
  recentPurchases: any[]
}

export default function SubjectStatsClient({ user, subject, stats, salesHistory, recentPurchases }: SubjectStatsClientProps) {
  const maxRevenue = Math.max(...salesHistory.map(h => h.revenue), 1)

  if (!subject) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: '2rem', color: 'var(--text)', marginBottom: '1rem' }}>Sujet non trouvé</h1>
        <Link href="/contributeur/sujets" style={{ color: 'var(--gold)', textDecoration: 'none' }}>← Retour aux sujets</Link>
      </div>
    )
  }

  return (
    <>
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
            <div className="subject-icon">
              <FileText size={24} />
            </div>
            <div className="subject-details">
              <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', color: 'var(--text)', marginBottom: '0.35rem' }}>{subject.titre}</h2>
              <div className="subject-meta" style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-3)' }}>
                {subject.matiere} • {subject.annee} • {subject.type}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href={`/sujet/${subject.id}`} className="btn-tbl">Voir</Link>
            <Link href={`/contributeur/nouveau?id=${subject.id}`} className="btn-tbl">Modifier</Link>
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
              Achats confirmé
            </div>
          </div>
          <div className="stat-card">
            <div className="label">Note moyenne</div>
            <div className="value">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '--'} <Star size={20} style={{ display: 'inline', color: 'var(--gold)' }} /></div>
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
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">Évolution des <em>ventes</em></div>
            <TrendingUp size={20} style={{ color: 'var(--gold)' }} />
          </div>
          <div className="chart-bars">
            {salesHistory.length === 0 ? (
              <div style={{ textAlign: 'center', width: '100%', padding: '2rem', color: 'var(--text-3)' }}>
                Aucune donnée disponible
              </div>
            ) : (
              salesHistory.map((month, index) => {
                const height = (month.revenue / maxRevenue) * 100
                return (
                  <div key={index} className="bar-col">
                    <div className="bar" style={{ height: `${height}%` }} title={`${month.revenue} Ar`} />
                    <div className="bar-label">{month.month.slice(5)}</div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="panel">
          <div className="p-head">
            <div className="p-dot"></div>
            <span className="p-label">
              <Eye size={14} />
              Achats récents
            </span>
          </div>
          <div className="p-body">
            {recentPurchases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>
                Aucun achat récent
              </div>
            ) : (
              recentPurchases.map((purchase) => (
                <div key={purchase.id} className="earner-row">
                  <div className="er-av">
                    {(purchase.prenom?.charAt(0) || 'U').toUpperCase()}
                  </div>
                  <div className="er-name">
                    {purchase.prenom} {purchase.nom?.charAt(0)}.
                  </div>
                  <div className="er-amount">
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
    </>
  )
}