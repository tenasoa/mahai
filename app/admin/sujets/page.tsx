import { getSubjectsAdmin } from '@/actions/admin/subjects'
import Link from 'next/link'
import { FileText, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

export const metadata = {
  title: 'Gestion des Sujets — Admin Mah.AI'
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(date)
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'PUBLISHED') return <span className="status-badge status-emerald"><CheckCircle2 size={12}/> Publié</span>
  if (status === 'PENDING') return <span className="status-badge status-amber"><AlertCircle size={12}/> Modération</span>
  if (status === 'REJECTED') return <span className="status-badge status-ruby"><XCircle size={12}/> Rejeté</span>
  return <span className="status-badge status-gray">{status}</span>
}

export default async function AdminSubjectsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const sp = await searchParams
  const statusTab = sp.status || 'ALL'

  const subjects = await getSubjectsAdmin(statusTab)

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Catalogue et Sujets</h1>
          <p className="admin-subtitle">Gérez les examens, modérez les propositions et ajustez les prix</p>
        </div>
      </div>

      <div className="admin-tabs" style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--b1)', marginBottom: '2rem' }}>
        <Link href="/admin/sujets?status=ALL" className={`admin-tab ${statusTab === 'ALL' ? 'admin-tab-active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '1rem', color: statusTab === 'ALL' ? 'var(--gold)' : 'var(--text-3)', borderBottom: statusTab === 'ALL' ? '2px solid var(--gold)' : '2px solid transparent', textDecoration: 'none', fontWeight: 500 }}>
          Tous
        </Link>
        <Link href="/admin/sujets?status=PENDING" className={`admin-tab ${statusTab === 'PENDING' ? 'admin-tab-active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '1rem', color: statusTab === 'PENDING' ? 'var(--gold)' : 'var(--text-3)', borderBottom: statusTab === 'PENDING' ? '2px solid var(--gold)' : '2px solid transparent', textDecoration: 'none', fontWeight: 500 }}>
          <AlertCircle size={16} /> En attente
        </Link>
        <Link href="/admin/sujets?status=PUBLISHED" className={`admin-tab ${statusTab === 'PUBLISHED' ? 'admin-tab-active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '1rem', color: statusTab === 'PUBLISHED' ? 'var(--gold)' : 'var(--text-3)', borderBottom: statusTab === 'PUBLISHED' ? '2px solid var(--gold)' : '2px solid transparent', textDecoration: 'none', fontWeight: 500 }}>
          <CheckCircle2 size={16} /> Publiés
        </Link>
        <Link href="/admin/sujets?status=REJECTED" className={`admin-tab ${statusTab === 'REJECTED' ? 'admin-tab-active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '1rem', color: statusTab === 'REJECTED' ? 'var(--text-3)' : 'var(--text-3)', borderBottom: statusTab === 'REJECTED' ? '2px solid var(--text-3)' : '2px solid transparent', textDecoration: 'none', fontWeight: 500 }}>
          <XCircle size={16} /> Rejetés
        </Link>
      </div>

      <div className="admin-card">
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sujet</th>
                <th>Classification</th>
                <th>Auteur</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
                    Aucun sujet trouvé dans cette catégorie.
                  </td>
                </tr>
              ) : (
                subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="admin-list-icon" style={{ background: 'var(--surface-2)', color: 'var(--text-2)', width: 36, height: 36, borderRadius: 'var(--r)' }}>
                          <FileText size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text)' }}>{subject.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Ajouté le {formatDate(subject.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>{subject.motiere} • {subject.grade} ({subject.year})</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>{subject.credits} crédits • {subject.pagesCount || 1} pages</div>
                    </td>
                    <td>
                      {subject.authorId ? (
                        <>
                          <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{subject.authorPrenom} {subject.authorNom}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>{subject.authorRole}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: '0.85rem', opacity: 0.5 }}>Interne</div>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={subject.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/admin/sujets/${subject.id}`} className="admin-btn admin-btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        Gérer
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
