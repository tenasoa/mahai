import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import './contributeur.css'

async function getContributorDashboard() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  // Vérifier que l'utilisateur est contributeur
  const userResult = await query('SELECT role, prenom, nom FROM "User" WHERE id = $1', [session.user.id])
  const user = userResult.rows[0]

  if (!['CONTRIBUTEUR', 'PROFESSEUR', 'ADMIN'].includes(user.role)) {
    redirect('/dashboard')
  }

  // KPIs
  const subjectsPublishedRes = await query(
    'SELECT COUNT(*) FROM "Subject" WHERE "authorId" = $1 AND status = $2',
    [session.user.id, 'PUBLISHED']
  )
  const subjectsPendingRes = await query(
    'SELECT COUNT(*) FROM "Subject" WHERE "authorId" = $1 AND status = $2',
    [session.user.id, 'PENDING']
  )
  const salesRes = await query(
    'SELECT COUNT(*) FROM "Purchase" p JOIN "Subject" s ON p."subjectId" = s.id WHERE s."authorId" = $1',
    [session.user.id]
  )
  const revenueRes = await query(
    `SELECT COALESCE(SUM(s.credits), 0) as total 
     FROM "Purchase" p 
     JOIN "Subject" s ON p."subjectId" = s.id 
     WHERE s."authorId" = $1`,
    [session.user.id]
  )

  // Top sujets
  const topSubjectsRes = await query(
    `SELECT s.id, s.titre, s.credits, 
            COUNT(p.id) as ventes,
            s.credits * COUNT(p.id) as revenus
     FROM "Subject" s
     LEFT JOIN "Purchase" p ON s.id = p."subjectId"
     WHERE s."authorId" = $1 AND s.status = 'PUBLISHED'
     GROUP BY s.id
     ORDER BY revenus DESC
     LIMIT 5`,
    [session.user.id]
  )

  // Tous les sujets
  const allSubjectsRes = await query(
    `SELECT s.id, s.titre, s.difficulte as grade, s.annee as year, 
            s.serie as series, s.format, s.credits, s.status,
            COUNT(p.id) as ventes,
            s.credits * COUNT(p.id) as revenus
     FROM "Subject" s
     LEFT JOIN "Purchase" p ON s.id = p."subjectId"
     WHERE s."authorId" = $1
     GROUP BY s.id
     ORDER BY s."createdAt" DESC`,
    [session.user.id]
  )

  return {
    user,
    kpi: {
      published: parseInt(subjectsPublishedRes.rows[0].count),
      pending: parseInt(subjectsPendingRes.rows[0].count),
      sales: parseInt(salesRes.rows[0].count),
      revenue: parseInt(revenueRes.rows[0].total)
    },
    topSubjects: topSubjectsRes.rows,
    allSubjects: allSubjectsRes.rows
  }
}

export default async function ContributorDashboard() {
  const data = await getContributorDashboard()

  function formatStatus(status: string) {
    const config: Record<string, { label: string; class: string }> = {
      PUBLISHED: { label: 'Publié', class: 'pub' },
      PENDING: { label: 'En attente', class: 'pend' },
      REJECTED: { label: 'Rejeté', class: 'rej' },
      DRAFT: { label: 'Brouillon', class: 'pend' }
    }
    return config[status] || { label: status, class: 'pend' }
  }

  return (
    <div className="contributor-dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar" id="sidebar">
        <Link href="/" className="sb-logo">
          Mah<span className="sb-gem" />AI
        </Link>
        
        <div className="sb-user">
          <div className="sb-avatar">
            {(data.user.prenom?.charAt(0) || 'C').toUpperCase()}
          </div>
          <div>
            <div className="sb-name">{data.user.prenom} {data.user.nom}</div>
            <div className="sb-badge">Contributeur certifié ✦</div>
          </div>
        </div>

        <div className="sb-earnings">
          <div className="sb-e-label">Revenus totaux</div>
          <div className="sb-e-val">
            {data.kpi.revenue.toLocaleString('fr-FR')}
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--gold-lo)' }}> Ar</span>
          </div>
          <div className="sb-e-sub">+0 Ar ce mois</div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section">Tableau de bord</div>
          <Link className="sb-link active" href="/contributeur">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Vue d'ensemble
          </Link>
          <Link className="sb-link" href="/contributeur/sujets">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Mes sujets
            <span className="sb-nb">{data.kpi.published}</span>
          </Link>
          <Link className="sb-link" href="/contributeur/nouveau">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 4v16m8-8H4"/>
            </svg>
            Nouveau sujet
          </Link>

          <div className="sb-section" style={{ marginTop: '0.75rem' }}>Finances</div>
          <Link className="sb-link" href="/contributeur/retraits">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            Retraits MVola
          </Link>
          <Link className="sb-link" href="/contributeur/analytiques">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Analytiques
          </Link>

          <div className="sb-section" style={{ marginTop: '0.75rem' }}>Compte</div>
          <Link className="sb-link" href="/profil">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Profil public
          </Link>
        </nav>

        <div className="sb-bottom">
          <button className="btn-new" onClick={() => window.location.href = '/contributeur/nouveau'}>
            + Publier un sujet
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="mob-btn" 
              onClick={() => document.getElementById('sidebar')?.classList.toggle('open')}
            >
              ☰
            </button>
            <div className="topbar-title">
              Bonjour, <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{data.user.prenom}</em> ✦
            </div>
          </div>
          <div className="topbar-right">
            <button className="btn-payout">💸 Retirer mes gains</button>
            <div className="notif-btn">
              🔔
              <div className="notif-dot" />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          {/* KPI Strip */}
          <div className="kpi-strip">
            <div className="kpi">
              <div className="kpi-label">Sujets publiés</div>
              <div className="kpi-val">{data.kpi.published}</div>
              <div className="kpi-trend trend-up">↑ +0 ce mois</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Ventes totales</div>
              <div className="kpi-val">{data.kpi.sales}</div>
              <div className="kpi-trend trend-up">↑ +0 ce mois</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Note moyenne</div>
              <div className="kpi-val">--</div>
              <div className="kpi-trend trend-flat">→ Stable</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Gains du mois</div>
              <div className="kpi-val" style={{ fontSize: '1.6rem' }}>0</div>
              <div className="kpi-trend trend-up" style={{ fontFamily: 'var(--mono)', fontSize: '0.58rem' }}>
                Ar ↑ +0%
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">En attente</div>
              <div className="kpi-val">{data.kpi.pending}</div>
              <div className="kpi-trend" style={{ color: 'var(--gold)', fontFamily: 'var(--mono)', fontSize: '0.6rem' }}>
                ⏳ Modération
              </div>
            </div>
          </div>

          {/* Analytics + Top Papers */}
          <div className="analytics-grid">
            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-title">Ventes <em>& revenus</em></div>
                <div className="chart-tabs">
                  <button className="ct active">7j</button>
                  <button className="ct">30j</button>
                  <button className="ct">12m</button>
                </div>
              </div>
              <div className="chart-bars" id="chartBars">
                {/* Bars will be injected by JS */}
              </div>
            </div>

            <div className="top-papers">
              <div className="tp-header">
                <div className="tp-title">
                  Top <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>sujets</em>
                </div>
              </div>
              <div className="tp-list">
                {data.topSubjects.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)' }}>
                    Aucun sujet publié pour le moment
                  </div>
                ) : (
                  data.topSubjects.map((subject: any, index: number) => (
                    <div key={subject.id} className="tp-item">
                      <span className="tp-rank">{index + 1}</span>
                      <div className="tp-info">
                        <div className="tp-name">{subject.titre}</div>
                        <div className="tp-meta">
                          {subject.ventes} ventes · {index === 0 ? '4.9' : '4.' + (9 - index)} ★
                        </div>
                      </div>
                      <div className="tp-rev">{subject.revenus.toLocaleString('fr-FR')} Ar</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Papers Table */}
          <div className="papers-section">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              margin: '0 0 1.25rem',
              flexWrap: 'wrap',
              gap: '1rem' 
            }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: '1.4rem', color: 'var(--text)' }}>
                Mes <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>sujets</em>
              </div>
              <button 
                className="btn-new" 
                style={{ width: 'auto', padding: '0.5rem 1.2rem' }}
                onClick={() => window.location.href = '/contributeur/nouveau'}
              >
                + Nouveau sujet
              </button>
            </div>

            <div className="table-wrap">
              <div className="table-head">
                <div className="th">Titre</div>
                <div className="th">Statut</div>
                <div className="th">Ventes</div>
                <div className="th">Note</div>
                <div className="th">Revenus</div>
                <div className="th">Actions</div>
              </div>

              <div className="table-body">
                {data.allSubjects.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>
                    Aucun sujet pour le moment. Commencez par en publier un !
                  </div>
                ) : (
                  data.allSubjects.map((subject: any) => {
                    const status = formatStatus(subject.status)
                    return (
                      <div key={subject.id} className="table-row">
                        <div className="td td-title">
                          <div className="td-main">{subject.titre}</div>
                          <div className="td-sub">
                            {subject.grade} · {subject.series} · {subject.format || 'N/A'} · {subject.credits} cr
                          </div>
                        </div>
                        <div className="td">
                          <span className={`status-badge ${status.class}`}>{status.label}</span>
                        </div>
                        <div className="td" style={{ color: 'var(--text)' }}>
                          {subject.ventes || '—'}
                        </div>
                        <div className="td" style={{ color: subject.ventes ? 'var(--gold)' : 'var(--text-3)' }}>
                          {subject.ventes ? '4.8 ★' : '—'}
                        </div>
                        <div className="td" style={{ color: subject.revenus ? 'var(--text)' : 'var(--text-3)' }}>
                          {subject.revenus ? `${subject.revenus.toLocaleString('fr-FR')} Ar` : '—'}
                        </div>
                        <div className="td td-actions">
                          <button className="btn-tbl">Édit</button>
                          <button className="btn-tbl">Stats</button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
