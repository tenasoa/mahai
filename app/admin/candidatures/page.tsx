import { query } from '@/lib/db'
import { reviewContributorApplicationAction } from './actions'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'

function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export default async function AdminContributorApplicationsPage() {
  let applications: any[] = []
  let tableMissing = false

  const tableExistsResult = await query(
    `SELECT 1
     FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'ContributorApplication'
     LIMIT 1`,
  )
  const tableExists = tableExistsResult.rows.length > 0

  if (!tableExists) {
    tableMissing = true
  } else {
    const applicationsResult = await query(
      `
      SELECT
        ca.*,
        u.prenom,
        u.nom,
        u.email
      FROM "ContributorApplication" ca
      JOIN "User" u ON u.id = ca."userId"
      ORDER BY
        CASE WHEN ca.status = 'PENDING' THEN 0 ELSE 1 END,
        ca."createdAt" DESC
      `,
    )
    applications = applicationsResult.rows
  }

  const pending = applications.filter((item: any) => item.status === 'PENDING')
  const reviewed = applications.filter((item: any) => item.status !== 'PENDING')

  return (
    <div className="admin-page-content">
      <AdminBreadcrumb items={[{ label: 'Utilisateurs', href: '/admin/utilisateurs' }, { label: 'Candidatures' }]} />
      <div className="admin-header">
        <div>
          <div className="admin-header-badge">Validation contributeurs</div>
          <h1 className="admin-title">Candidatures contributeur</h1>
          <p className="admin-subtitle">Étudiez les dossiers et validez ou refusez l'accès au rôle contributeur.</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">Dossiers en attente</div>
          <div className="kpi-value">{pending.length}</div>
          <div className="kpi-trend kpi-trend-up">À traiter en priorité</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Dossiers approuvés</div>
          <div className="kpi-value">
            {applications.filter((item: any) => item.status === 'APPROVED').length}
          </div>
          <div className="kpi-trend kpi-trend-up">Rôle contributeur attribué</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Dossiers refusés</div>
          <div className="kpi-value">
            {applications.filter((item: any) => item.status === 'REJECTED').length}
          </div>
          <div className="kpi-trend kpi-trend-down">Avec note de retour recommandée</div>
        </div>
      </div>

      {tableMissing && (
        <div className="admin-card">
          <div className="admin-card-body">
            <p style={{ color: 'var(--ruby)', lineHeight: 1.6 }}>
              La table <code>ContributorApplication</code> n’existe pas encore.
              Appliquez la migration <code>migrations_manual/018_contributor_applications.sql</code> pour activer cette page.
            </p>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Dossiers en attente</h2>
          <span className="status-badge status-amber">{pending.length} pending</span>
        </div>

        <div className="admin-card-body">
          {pending.length === 0 ? (
            <p style={{ color: 'var(--text-3)' }}>Aucune candidature en attente pour le moment.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1.1rem' }}>
              {pending.map((application: any) => (
                <article
                  key={application.id}
                  style={{
                    border: '1px solid var(--b2)',
                    borderRadius: 'var(--r)',
                    padding: '1rem',
                    background: 'var(--surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.85rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', color: 'var(--text)' }}>
                        {application.fullName || `${application.prenom || ''} ${application.nom || ''}`}
                      </h3>
                      <p style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>{application.email}</p>
                    </div>
                    <div className="status-badge status-amber">En attente</div>
                  </div>

                  <div style={{ display: 'grid', gap: '0.45rem', marginBottom: '0.9rem' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
                      <strong style={{ color: 'var(--text)' }}>Matières:</strong> {application.subjects}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
                      <strong style={{ color: 'var(--text)' }}>Niveau:</strong> {application.educationLevel}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
                      <strong style={{ color: 'var(--text)' }}>Disponibilité:</strong> {application.availability}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
                      <strong style={{ color: 'var(--text)' }}>Expérience:</strong> {application.teachingExperience}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                      <strong style={{ color: 'var(--text)' }}>Motivation:</strong> {application.motivation}
                    </p>
                    {application.portfolioUrl && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
                        <strong style={{ color: 'var(--text)' }}>Portfolio:</strong>{' '}
                        <a
                          href={application.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--gold)', textDecoration: 'underline' }}
                        >
                          {application.portfolioUrl}
                        </a>
                      </p>
                    )}
                  </div>

                  <p style={{ fontFamily: 'var(--mono)', fontSize: '0.62rem', color: 'var(--text-4)', marginBottom: '0.8rem' }}>
                    Soumis le {formatDate(application.createdAt)}
                  </p>

                  <form action={reviewContributorApplicationAction}>
                    <input type="hidden" name="applicationId" value={application.id} />
                    <textarea
                      name="adminNotes"
                      className="admin-input"
                      rows={3}
                      placeholder="Note admin (optionnelle mais recommandée)..."
                      style={{ marginBottom: '0.75rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <button
                        type="submit"
                        name="decision"
                        value="APPROVED"
                        className="admin-btn admin-btn-primary"
                        style={{ padding: '0.55rem 1rem' }}
                      >
                        Valider candidature
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="REJECTED"
                        className="admin-btn admin-btn-outline"
                        style={{ padding: '0.55rem 1rem' }}
                      >
                        Refuser candidature
                      </button>
                    </div>
                  </form>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Historique des décisions</h2>
          <span className="status-badge status-gray">{reviewed.length} traités</span>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Candidat</th>
                <th>Statut</th>
                <th>Soumis le</th>
                <th>Décision le</th>
                <th>Note admin</th>
              </tr>
            </thead>
            <tbody>
              {reviewed.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-3)' }}>
                    Aucun dossier traité pour le moment.
                  </td>
                </tr>
              ) : (
                reviewed.map((application: any) => (
                  <tr key={application.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>{application.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>{application.email}</div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          application.status === 'APPROVED' ? 'status-green' : 'status-ruby'
                        }`}
                      >
                        {application.status}
                      </span>
                    </td>
                    <td>{formatDate(application.createdAt)}</td>
                    <td>{application.reviewedAt ? formatDate(application.reviewedAt) : '—'}</td>
                    <td style={{ maxWidth: 320 }}>
                      <span style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>
                        {application.adminNotes || '—'}
                      </span>
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
