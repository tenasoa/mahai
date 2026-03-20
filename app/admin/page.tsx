import { query } from '@/lib/db'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText, Users, CreditCard, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

async function getDashboardData() {
  // 1. KPIs
  const usersCountRes = await query('SELECT COUNT(*) FROM "User"')
  const subjectsCountRes = await query('SELECT COUNT(*) FROM "Subject" WHERE status = $1', ['PUBLISHED'])
  const reviewsCountRes = await query('SELECT COUNT(*) FROM "Subject" WHERE status = $1', ['PENDING'])
  const mvolaCountRes = await query('SELECT COUNT(*) FROM "CreditTransaction" WHERE status = $1', ['PENDING'])
  const salesCountRes = await query('SELECT COUNT(*) FROM "Purchase"')
  const revenueRes = await query('SELECT COALESCE(SUM(amount), 0) as total FROM "CreditTransaction" WHERE status = $1', ['COMPLETED'])

  // 2. Derniers utilisateurs inscrits
  const recentUsersRes = await query('SELECT id, prenom, nom, email, role, "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT 5')
  
  // 3. Derniers paiements MVola en attente
  const recentMvolaRes = await query(`
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
      mvola: parseInt(mvolaCountRes.rows[0].count),
      sales: parseInt(salesCountRes.rows[0].count),
      revenue: parseInt(revenueRes.rows[0].total)
    },
    recentUsers: recentUsersRes.rows,
    recentMvola: recentMvolaRes.rows,
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
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Vue d'ensemble</h1>
          <p className="admin-subtitle">Statistiques et actions requises sur Mah.AI</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/admin/sujets" className="admin-btn admin-btn-outline">
            Voir les sujets
          </Link>
          <Link href="/admin/credits" className="admin-btn admin-btn-primary">
            Dépôts MVola ({data.kpi.mvola})
          </Link>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Utilisateurs</span>
            <span className="kpi-icon kpi-icon-blue"><Users size={16} /></span>
          </div>
          <div className="kpi-value">{data.kpi.users}</div>
          <div className="kpi-trend kpi-trend-up">Total inscrits</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Sujets Publiés</span>
            <span className="kpi-icon kpi-icon-ruby"><FileText size={16} /></span>
          </div>
          <div className="kpi-value">{data.kpi.subjects}</div>
          <div className="kpi-trend kpi-trend-up">Accessibles au public</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Ventes (Sujets)</span>
            <span className="kpi-icon kpi-icon-emerald"><CheckCircle2 size={16} /></span>
          </div>
          <div className="kpi-value">{data.kpi.sales}</div>
          <div className="kpi-trend kpi-trend-up">Sujets débloqués</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Revenus MVola</span>
            <span className="kpi-icon kpi-icon-amber"><TrendingUp size={16} /></span>
          </div>
          <div className="kpi-value">{formatMoney(data.kpi.revenue)}</div>
          <div className="kpi-trend kpi-trend-up">Total recharges validées</div>
        </div>
      </div>

      {/* DEUX COLONNES : Modération & MVola */}
      <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '2rem' }}>
        
        {/* Modération Sujets */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">En attente de modération</h2>
            {data.kpi.reviews > 0 && <span className="sb-badge sb-badge-ruby">{data.kpi.reviews}</span>}
          </div>
          
          <div className="admin-list">
            {data.recentSubjects.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.9rem' }}>
                Aucun sujet en attente
              </div>
            ) : (
              data.recentSubjects.map((subject: any) => (
                <div key={subject.id} className="admin-list-item">
                  <div className="admin-list-icon" style={{ background: 'var(--ruby-dim)', color: 'var(--ruby)' }}>
                    <AlertCircle size={18} />
                  </div>
                  <div className="admin-list-content">
                    <div className="admin-list-title">{subject.title}</div>
                    <div className="admin-list-desc">Proposé par {subject.prenom} {subject.nom} • {formatDate(subject.createdAt)}</div>
                  </div>
                  <div className="admin-list-actions">
                    <Link href={`/admin/sujets/${subject.id}`} className="admin-btn admin-btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Examiner</Link>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {data.kpi.reviews > 4 && (
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--b1)' }}>
              <Link href="/admin/sujets?status=PENDING" style={{ color: 'var(--ruby)', fontSize: '0.85rem', textDecoration: 'none' }}>
                Voir les {data.kpi.reviews} sujets en attente →
              </Link>
            </div>
          )}
        </div>

        {/* Dépôts MVola */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Dépôts MVola à valider</h2>
            {data.kpi.mvola > 0 && <span className="sb-badge sb-badge-amber">{data.kpi.mvola}</span>}
          </div>
          
          <div className="admin-list">
            {data.recentMvola.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.9rem' }}>
                Aucun dépôt en attente
              </div>
            ) : (
              data.recentMvola.map((tx: any) => (
                <div key={tx.id} className="admin-list-item">
                  <div className="admin-list-icon" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>
                    <CreditCard size={18} />
                  </div>
                  <div className="admin-list-content">
                    <div className="admin-list-title">{formatMoney(tx.amount)} = {tx.creditsCount} crédits</div>
                    <div className="admin-list-desc">{tx.prenom} {tx.nom} • {formatDate(tx.createdAt)}</div>
                  </div>
                  <div className="admin-list-actions">
                    <Link href={`/admin/credits`} className="admin-btn admin-btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Gérer</Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {data.kpi.mvola > 4 && (
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--b1)' }}>
              <Link href="/admin/credits" style={{ color: 'var(--amber)', fontSize: '0.85rem', textDecoration: 'none' }}>
                Voir tous les {data.kpi.mvola} dépôts →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Récents utilisateurs */}
      <div className="admin-card" style={{ marginTop: '2rem' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">Dernières inscriptions</h2>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="sb-av" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
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
                  <td>{formatDate(user.createdAt)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/admin/utilisateurs/${user.id}`} className="admin-btn admin-btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                      Voir profil
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--b1)' }}>
          <Link href="/admin/utilisateurs" style={{ color: 'var(--text-2)', fontSize: '0.85rem', textDecoration: 'none' }}>
            Voir tous les utilisateurs →
          </Link>
        </div>
      </div>

    </div>
  )
}
