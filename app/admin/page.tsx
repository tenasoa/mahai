import { query } from '@/lib/db'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText, Users, CreditCard, TrendingUp, AlertCircle, CheckCircle2, Clock, ArrowRight, Sparkles } from 'lucide-react'

async function getDashboardData() {
  // 1. KPIs
  const usersCountRes = await query('SELECT COUNT(*) FROM "User"')
  const subjectsCountRes = await query('SELECT COUNT(*) FROM "Subject" WHERE status = $1', ['PUBLISHED'])
  const reviewsCountRes = await query('SELECT COUNT(*) FROM "Subject" WHERE status = $1', ['PENDING'])
  const mobileMoneyCountRes = await query('SELECT COUNT(*) FROM "CreditTransaction" WHERE status = $1', ['PENDING'])
  const salesCountRes = await query('SELECT COUNT(*) FROM "Purchase"')
  const revenueRes = await query('SELECT COALESCE(SUM(amount), 0) as total FROM "CreditTransaction" WHERE status = $1', ['COMPLETED'])

  // 2. Derniers utilisateurs inscrits
  const recentUsersRes = await query('SELECT id, prenom, nom, email, role, "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT 5')

  // 3. Derniers paiements Mobile Money en attente
  const recentMobileMoneyRes = await query(`
    SELECT c.*, u.prenom, u.nom, u.email
    FROM "CreditTransaction" c
    JOIN "User" u ON c."userId" = u.id
    WHERE c.status = 'PENDING'
    ORDER BY c."createdAt" DESC LIMIT 4
  `)

  // 4. Derniers sujets en attente
  const recentSubjectsRes = await query(`
    SELECT s.id, s.titre as title, s."createdAt", u.prenom, u.nom
    FROM "Subject" s
    LEFT JOIN "User" u ON s."authorId" = u.id
    WHERE s.status = 'PENDING'
    ORDER BY s."createdAt" DESC LIMIT 4
  `)

  return {
    kpi: {
      users: parseInt(usersCountRes.rows[0].count),
      subjects: parseInt(subjectsCountRes.rows[0].count),
      reviews: parseInt(reviewsCountRes.rows[0].count),
      mobilemoney: parseInt(mobileMoneyCountRes.rows[0].count),
      sales: parseInt(salesCountRes.rows[0].count),
      revenue: parseInt(revenueRes.rows[0].total)
    },
    recentUsers: recentUsersRes.rows,
    recentMobileMoney: recentMobileMoneyRes.rows,
    recentSubjects: recentSubjectsRes.rows
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(date)
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(amount).replace('MGA', 'Ar')
}

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  const data = await getDashboardData()

  return (
    <div className="admin-page-content">
      {/* Header amélioré */}
      <div className="admin-header">
        <div>
          <div className="admin-header-badge">
            <Sparkles size={14} />
            <span>Tableau de bord</span>
          </div>
          <h1 className="admin-title">Vue d'ensemble</h1>
          <p className="admin-subtitle">Statistiques et actions requises sur Mah.AI</p>
        </div>
        <div className="admin-header-actions">
          <Link href="/admin/sujets" className="admin-btn admin-btn-outline">
            <FileText size={16} />
            Voir les sujets
          </Link>
          <Link href="/admin/credits" className="admin-btn admin-btn-primary">
            <CreditCard size={16} />
            Dépôts Mobile Banking
            {data.kpi.mobilemoney > 0 && (
              <span className="admin-btn-badge">{data.kpi.mobilemoney}</span>
            )}
          </Link>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Utilisateurs inscrits</span>
            <span className="kpi-icon kpi-icon-blue"><Users size={18} /></span>
          </div>
          <div className="kpi-value">{data.kpi.users.toLocaleString()}</div>
          <div className="kpi-trend kpi-trend-up">
            <CheckCircle2 size={12} />
            Total inscrits
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Sujets publiés</span>
            <span className="kpi-icon kpi-icon-ruby"><FileText size={18} /></span>
          </div>
          <div className="kpi-value">{data.kpi.subjects}</div>
          <div className="kpi-trend kpi-trend-up">
            <CheckCircle2 size={12} />
            Accessibles au public
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Ventes réalisées</span>
            <span className="kpi-icon kpi-icon-emerald"><CheckCircle2 size={18} /></span>
          </div>
          <div className="kpi-value">{data.kpi.sales}</div>
          <div className="kpi-trend kpi-trend-up">
            <TrendingUp size={12} />
            Sujets débloqués
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Revenus Mobile Banking</span>
            <span className="kpi-icon kpi-icon-amber"><TrendingUp size={18} /></span>
          </div>
          <div className="kpi-value" style={{ color: 'var(--gold)' }}>{formatMoney(data.kpi.revenue)}</div>
          <div className="kpi-trend kpi-trend-up">
            <CheckCircle2 size={12} />
            Total rechargements validés
          </div>
        </div>
      </div>

      {/* DEUX COLONNES : Modération & Mobile Banking */}
      <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '2rem' }}>

        {/* Modération Sujets */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <AlertCircle size={18} />
              En attente de modération
            </h2>
            {data.kpi.reviews > 0 && (
              <span className="status-badge status-ruby">
                {data.kpi.reviews} en attente
              </span>
            )}
          </div>

          <div className="admin-list">
            {data.recentSubjects.length === 0 ? (
              <div className="admin-empty-state">
                <CheckCircle2 className="admin-empty-state-icon" size={48} />
                <div className="admin-empty-state-text">Aucun sujet en attente de modération</div>
              </div>
            ) : (
              data.recentSubjects.map((subject: any) => (
                <div key={subject.id} className="admin-list-item">
                  <div className="admin-list-icon" style={{ background: 'var(--ruby-dim)', color: 'var(--ruby)' }}>
                    <FileText size={18} />
                  </div>
                  <div className="admin-list-content">
                    <div className="admin-list-title">{subject.title}</div>
                    <div className="admin-list-desc">
                      Par {subject.prenom || 'Anonyme'} {subject.nom || ''} • {formatDate(subject.createdAt)}
                    </div>
                  </div>
                  <div className="admin-list-actions">
                    <Link href={`/admin/sujets/${subject.id}`} className="admin-btn admin-btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                      Examiner
                    </Link>
                  </div>
                </div>
              ))
            )}

            {data.kpi.reviews > 4 && (
              <Link href="/admin/sujets?status=PENDING" className="admin-card-footer-link">
                Voir les {data.kpi.reviews} sujets en attente
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* Dépôts Mobile Banking */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <CreditCard size={18} />
              Dépôts Mobile Banking
            </h2>
            {data.kpi.mobilemoney > 0 && (
              <span className="status-badge status-amber">
                {data.kpi.mobilemoney} en attente
              </span>
            )}
          </div>

          <div className="admin-list">
            {data.recentMobileMoney.length === 0 ? (
              <div className="admin-empty-state">
                <CheckCircle2 className="admin-empty-state-icon" size={48} />
                <div className="admin-empty-state-text">Aucun dépôt en attente</div>
              </div>
            ) : (
              data.recentMobileMoney.map((tx: any) => (
                <div key={tx.id} className="admin-list-item">
                  <div className="admin-list-icon" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>
                    <CreditCard size={18} />
                  </div>
                  <div className="admin-list-content">
                    <div className="admin-list-title" style={{ color: 'var(--gold)' }}>
                      {formatMoney(tx.amount)}
                    </div>
                    <div className="admin-list-desc">
                      {tx.creditsCount} crédits • {tx.prenom} {tx.nom}
                    </div>
                  </div>
                  <div className="admin-list-actions">
                    <Link href="/admin/credits" className="admin-btn admin-btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                      Valider
                    </Link>
                  </div>
                </div>
              ))
            )}

            {data.kpi.mobilemoney > 4 && (
              <Link href="/admin/credits" className="admin-card-footer-link">
                Voir tous les {data.kpi.mobilemoney} dépôts
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Récents utilisateurs */}
      <div className="admin-card" style={{ marginTop: '2rem' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <Users size={18} />
            Dernières inscriptions
          </h2>
          <Link href="/admin/utilisateurs" className="admin-btn admin-btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
            Voir tout
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Date d'inscription</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.recentUsers.map((user: any) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div className="sb-av" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
                        {(user.prenom?.charAt(0) || '')}{(user.nom?.charAt(0) || '')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text)' }}>{user.prenom} {user.nom}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${user.role === 'ADMIN' ? 'status-ruby' : user.role?.includes('TEACHER') || user.role?.includes('CONTRIBUTEUR') ? 'status-amber' : 'status-gray'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{formatDate(user.createdAt)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/admin/utilisateurs/${user.id}`} className="admin-btn admin-btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                      Voir profil
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
