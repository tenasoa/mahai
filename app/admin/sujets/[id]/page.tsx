import { getSubjectDetailAdmin, updateSubjectStatus } from '@/actions/admin/subjects'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, XCircle, BookOpen, Tag, Calendar, DollarSign, User, Download, Eye, Clock, Edit3 } from 'lucide-react'

export const metadata = {
  title: 'Modération Sujet — Admin Mah.AI'
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date)
}

function formatDateShort(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(date)
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; class: string; icon: any }> = {
    PUBLISHED: { label: 'Publié', class: 'status-emerald', icon: CheckCircle2 },
    PENDING: { label: 'Modération', class: 'status-amber', icon: AlertCircle },
    REJECTED: { label: 'Rejeté', class: 'status-ruby', icon: XCircle },
    DRAFT: { label: 'Brouillon', class: 'status-gray', icon: FileText },
  }
  const config = configs[status] || { label: status, class: 'status-gray', icon: FileText }
  const Icon = config.icon
  return (
    <span className={`status-badge ${config.class}`}>
      <Icon size={12} />
      {config.label}
    </span>
  )
}

export default async function AdminSubjectDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const p = await params
  const subject = await getSubjectDetailAdmin(p.id)

  if (!subject) redirect('/admin/sujets')

  async function handleStatusUpdate(formData: FormData) {
    'use server'
    const newStatus = formData.get('status') as string
    const notes = formData.get('notes') as string
    if (newStatus && newStatus !== subject.status) {
      await updateSubjectStatus(p.id, newStatus, notes)
    }
  }

  return (
    <div className="admin-page-content">
      {/* Header */}
      <div className="admin-header">
        <div>
          <Link href="/admin/sujets" className="admin-back-link">
            <ArrowLeft size={14} />
            Retour aux sujets
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '1rem' }}>
            <div className="sb-av sb-av-lg" style={{ width: 56, height: 56, fontSize: '1.3rem', background: 'var(--surface-2)', color: 'var(--gold)', border: '2px solid var(--gold-line)' }}>
              <FileText size={24} />
            </div>
            <div>
              <h1 className="admin-title" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {subject.title}
                <StatusBadge status={subject.status} />
              </h1>
              <p className="admin-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span>{subject.motiere}</span>
                <span style={{ color: 'var(--text-4)' }}>•</span>
                <span>{subject.grade}</span>
                <span style={{ color: 'var(--text-4)' }}>•</span>
                <span>Année {subject.year}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="admin-header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          <a
            href={subject.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn-outline"
          >
            <Eye size={16} />
            Voir le sujet
          </a>
          {subject.correctionUrl && (
            <a
              href={subject.correctionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn admin-btn-primary"
            >
              <Download size={16} />
              Correction
            </a>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="admin-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Left Column: Details & Purchases */}
        <div>
          {/* Document Details Card */}
          <div className="admin-card">
            <h2 className="admin-card-title">
              <BookOpen size={18} />
              Détails du document
            </h2>
            <div className="admin-info-grid">
              <div className="admin-info-item">
                <span className="admin-info-label">Matière</span>
                <span className="admin-info-value">{subject.motiere || 'N/A'}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Niveau</span>
                <span className="admin-info-value">
                  <span className="status-badge status-blue">{subject.grade || 'N/A'}</span>
                </span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Année</span>
                <span className="admin-info-value">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} style={{ color: 'var(--text-3)' }} />
                    {subject.year || 'N/A'}
                  </span>
                </span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Prix</span>
                <span className="admin-info-value">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <DollarSign size={14} style={{ color: 'var(--gold)' }} />
                    <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{subject.credits || 0} crédits</span>
                  </span>
                </span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Auteur</span>
                <span className="admin-info-value">
                  {subject.authorId ? (
                    <Link
                      href={`/admin/utilisateurs/${subject.authorId}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--gold)', textDecoration: 'none' }}
                    >
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
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {subject.authorPrenom} {subject.authorNom}
                        <span className="status-badge status-gray" style={{ fontSize: '0.45rem' }}>{subject.authorRole}</span>
                      </span>
                    </Link>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-3)' }}>
                      <User size={14} />
                      Uploadé par l'Admin
                    </span>
                  )}
                </span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Série</span>
                <span className="admin-info-value">{subject.series || 'Toutes séries'}</span>
              </div>
            </div>

            {subject.tags && subject.tags.length > 0 && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--b1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Tag size={14} style={{ color: 'var(--text-3)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tags</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {subject.tags.map((tag: string) => (
                    <span key={tag} className="sb-badge sb-badge-blue">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Purchases Card */}
          <div className="admin-card">
            <h2 className="admin-card-title">
              <DollarSign size={18} />
              Achats ({subject.purchases?.length || 0})
            </h2>
            {subject.purchases?.length === 0 ? (
              <div className="admin-empty-state">
                <DollarSign className="admin-empty-state-icon" size={48} />
                <div className="admin-empty-state-text">Ce sujet n'a pas encore été acheté</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Email</th>
                      <th>Date d'achat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subject.purchases.map((purchase: any) => (
                      <tr key={purchase.id}>
                        <td>
                          <Link
                            href={`/admin/utilisateurs/${purchase.userId}`}
                            style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <div className="sb-av" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                              {(purchase.prenom?.charAt(0) || '')}{(purchase.nom?.charAt(0) || '')}
                            </div>
                            {purchase.prenom} {purchase.nom}
                          </Link>
                        </td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text-3)' }}>{purchase.email}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{formatDateShort(purchase.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Moderation & Logs */}
        <div>
          {/* Moderation Panel */}
          <div className="admin-card">
            <h2 className="admin-card-title">
              <Edit3 size={18} />
              Modération du sujet
            </h2>
            <form action={handleStatusUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="admin-label">Nouveau statut</label>
                <select name="status" defaultValue={subject.status} className="admin-input">
                  <option value="DRAFT">Brouillon (Non visible)</option>
                  <option value="PENDING">En attente (Modération)</option>
                  <option value="PUBLISHED">Publié (Visible au catalogue)</option>
                  <option value="REJECTED">Rejeté (Masqué avec motif)</option>
                </select>
              </div>

              <div>
                <label className="admin-label">Motif / Notes (optionnel)</label>
                <textarea
                  name="notes"
                  className="admin-input"
                  rows={4}
                  placeholder="Ex: Le PDF est illisible, veuillez le renvoyer..."
                ></textarea>
              </div>

              <button type="submit" className="admin-btn admin-btn-primary" style={{ justifyContent: 'center' }}>
                <CheckCircle2 size={16} />
                Mettre à jour le statut
              </button>
            </form>
          </div>

          {/* Activity Log */}
          <div className="admin-card">
            <h2 className="admin-card-title">
              <Clock size={18} />
              Historique
            </h2>
            {subject.logs?.length === 0 ? (
              <div className="admin-empty-state">
                <Clock className="admin-empty-state-icon" size={48} />
                <div className="admin-empty-state-text">Aucun historique</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {subject.logs?.map((log: any) => (
                  <div key={log.id} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: log.action === 'PUBLISHED' ? 'var(--sage)' : log.action === 'REJECTED' ? 'var(--ruby)' : 'var(--gold)', marginTop: '0.3rem', flexShrink: 0, boxShadow: `0 0 10px ${log.action === 'PUBLISHED' ? 'rgba(74, 107, 90, 0.5)' : log.action === 'REJECTED' ? 'rgba(155, 35, 53, 0.5)' : 'rgba(201, 168, 76, 0.5)'}` }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.2rem' }}>
                        {log.action}
                        <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: '0.35rem' }}>
                          par {log.actorPrenom} {log.actorNom}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', fontFamily: 'var(--mono)', marginBottom: '0.5rem' }}>
                        {formatDate(log.createdAt)}
                      </div>
                      {log.notes && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--amber)', background: 'var(--amber-dim)', padding: '0.5rem 0.75rem', borderRadius: 'var(--r)', border: '1px solid var(--amber-line)' }}>
                          "{log.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
