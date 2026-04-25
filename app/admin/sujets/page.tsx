import { getSubjectsAdmin } from '@/actions/admin/subjects'
import { getPendingSubmissions } from '@/actions/admin/submissions'
import Link from 'next/link'
import { FileText, CheckCircle2, AlertCircle, XCircle, ArrowRight, FolderOpen, Clock } from 'lucide-react'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { AdminPaginationLinks } from '@/components/admin/AdminPaginationLinks'
import { AdminSearchBar } from '@/components/admin/AdminSearchBar'
import { redirect } from 'next/navigation'

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

const PAGE_SIZE = 15

export default async function AdminSubjectsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string, page?: string, q?: string }>
}) {
  const sp = await searchParams
  const statusTab = sp.status || 'ALL'
  const page = sp.page ? parseInt(sp.page, 10) : 1
  const searchTerm = sp.q?.trim() || ''

  // Fetch subjects from Subject table
  const { subjects, pagination } = await getSubjectsAdmin(statusTab, undefined, page, PAGE_SIZE, searchTerm)
  
  // Fetch pending submissions from SubjectSubmission table when on PENDING tab
  let pendingSubmissions: any[] = []
  if (statusTab === 'PENDING' || statusTab === 'ALL') {
    try {
      pendingSubmissions = await getPendingSubmissions()
    } catch (e) {
      // Silently fail if user is not admin (already handled in getSubjectsAdmin)
    }
  }

  if (page > pagination.totalPages && pagination.totalPages > 0) {
    const qParam = searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''
    redirect(`/admin/sujets?status=${statusTab}&page=${pagination.totalPages}${qParam}`)
  }

  const qParam = searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''

  // Compter par statut pour les badges
  const pendingCount = (statusTab === 'PENDING' ? pagination.total : 0) + pendingSubmissions.length

  return (
    <div className="admin-page-content">
      <AdminBreadcrumb items={[{ label: 'Sujets' }]} />
      <div className="admin-header">
        <div>
          <div className="admin-header-badge" style={{ background: 'var(--ruby-dim)', borderColor: 'var(--ruby-line)', color: '#E06070' }}>
            <FolderOpen size={14} />
            <span>Contenu</span>
          </div>
          <h1 className="admin-title">Catalogue et Sujets</h1>
          <p className="admin-subtitle">Gérez les examens, modérez les propositions et ajustez les prix</p>
        </div>
        {pendingCount > 0 && (
          <div className="admin-header-actions">
            <span className="status-badge status-ruby">
              {pendingCount} en attente
            </span>
          </div>
        )}
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: '1rem' }}>
        <AdminSearchBar placeholder="Rechercher par titre, matière, année, auteur…" paramName="q" />
      </div>

      {/* Tabs améliorés */}
      <div className="admin-tabs">
        <Link
          href={`/admin/sujets?status=ALL${qParam}`}
          className={`admin-tab ${statusTab === 'ALL' ? 'admin-tab-active' : ''}`}
        >
          Tous
        </Link>
        <Link
          href={`/admin/sujets?status=PENDING${qParam}`}
          className={`admin-tab ${statusTab === 'PENDING' ? 'admin-tab-active' : ''}`}
        >
          <AlertCircle size={16} />
          En attente
        </Link>
        <Link
          href={`/admin/sujets?status=PUBLISHED${qParam}`}
          className={`admin-tab ${statusTab === 'PUBLISHED' ? 'admin-tab-active' : ''}`}
        >
          <CheckCircle2 size={16} />
          Publiés
        </Link>
        <Link
          href={`/admin/sujets?status=REJECTED${qParam}`}
          className={`admin-tab ${statusTab === 'REJECTED' ? 'admin-tab-active' : ''}`}
        >
          <XCircle size={16} />
          Rejetés
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
              {/* Pending Submissions from SubjectSubmission table */}
              {pendingSubmissions.length > 0 && (statusTab === 'PENDING' || statusTab === 'ALL') && (
                <>
                  {pendingSubmissions.map((submission) => (
                    <tr key={submission.id} style={{ background: 'var(--amber-dim)' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div className="admin-list-icon" style={{ background: 'var(--amber)', color: '#000', width: 42, height: 42, borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem' }}>{submission.title || 'Sans titre'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--amber)', fontFamily: 'var(--mono)' }}>
                              Soumis le {formatDate(submission.createdAt)} • En attente de validation
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
                          {submission.matiere} • {submission.examType} ({submission.anneeScolaire})
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--amber)', fontFamily: 'var(--mono)', marginTop: '0.25rem' }}>
                          {submission.prix} crédits • Soumission contributeur
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="sb-av" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                            {(submission.authorPrenom?.charAt(0) || '')}{(submission.authorNom?.charAt(0) || '')}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--amber)' }}>{submission.authorPrenom} {submission.authorNom}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-4)', fontFamily: 'var(--mono)' }}>{submission.authorEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="status-badge status-amber"><Clock size={12}/> À valider</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link href={`/admin/sujets/${submission.id}/review`} className="admin-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: 'var(--amber)', color: '#000' }}>
                          Réviser
                          <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </>
              )}
              
              {/* Existing subjects from Subject table */}
              {subjects.length === 0 && pendingSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-empty-state">
                      <FileText className="admin-empty-state-icon" size={48} />
                      <div className="admin-empty-state-text">
                        {searchTerm ? (
                          <>Aucun sujet ne correspond à « {searchTerm} »</>
                        ) : (
                          <>
                            {statusTab === 'ALL' && "Aucun sujet dans le catalogue"}
                            {statusTab === 'PENDING' && "Aucun sujet en attente de modération"}
                            {statusTab === 'PUBLISHED' && "Aucun sujet publié"}
                            {statusTab === 'REJECTED' && "Aucun sujet rejeté"}
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div className="admin-list-icon" style={{ background: 'var(--surface-2)', color: 'var(--text-2)', width: 42, height: 42, borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: '0.95rem' }}>{subject.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
                            Ajouté le {formatDate(subject.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
                        {subject.motiere} • {subject.grade} ({subject.year})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontFamily: 'var(--mono)', marginTop: '0.25rem' }}>
                        {subject.credits} crédits • {subject.pagesCount || 1} pages
                      </div>
                    </td>
                    <td>
                      {subject.authorId ? (
                        <Link href={`/admin/utilisateurs/${subject.authorId}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                          {subject.authorProfilePicture ? (
                            <img
                              src={subject.authorProfilePicture}
                              alt={`${subject.authorPrenom} ${subject.authorNom}`}
                              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--gold-line)' }}
                            />
                          ) : (
                            <div className="sb-av" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                              {(subject.authorPrenom?.charAt(0) || '')}{(subject.authorNom?.charAt(0) || '')}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--gold)' }}>{subject.authorPrenom} {subject.authorNom}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-4)', fontFamily: 'var(--mono)' }}>{subject.authorRole}</div>
                          </div>
                        </Link>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-3)', fontStyle: 'italic' }}>Interne</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={subject.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/admin/sujets/${subject.id}`} className="admin-btn admin-btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                        Gérer
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <AdminPaginationLinks
          currentPage={page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={PAGE_SIZE}
          buildUrl={(p) => `/admin/sujets?status=${statusTab}&page=${p}${qParam}`}
        />
      </div>
    </div>
  )
}
