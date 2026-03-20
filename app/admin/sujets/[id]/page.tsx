import { getSubjectDetailAdmin, updateSubjectStatus } from '@/actions/admin/subjects'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

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

function StatusBadge({ status }: { status: string }) {
  if (status === 'PUBLISHED') return <span className="status-badge status-emerald"><CheckCircle2 size={12}/> Publié</span>
  if (status === 'PENDING') return <span className="status-badge status-amber"><AlertCircle size={12}/> Modération</span>
  if (status === 'REJECTED') return <span className="status-badge status-ruby"><XCircle size={12}/> Rejeté</span>
  return <span className="status-badge status-gray">{status}</span>
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
    <div>
      <div className="admin-header" style={{ marginBottom: '2rem' }}>
        <div>
          <Link href="/admin/sujets" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 500 }}>
            <ArrowLeft size={14} /> Retour aux sujets
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="admin-list-icon" style={{ width: 48, height: 48, background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r)' }}>
              <FileText size={20} />
            </div>
            <div>
              <h1 className="admin-title" style={{ marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {subject.title} 
                <StatusBadge status={subject.status} />
              </h1>
              <p className="admin-subtitle">
                {subject.motiere} • {subject.grade} • Année {subject.year}
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href={subject.pdfUrl} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-outline">
            Voir le Sujet (PDF)
          </a>
          {subject.correctionUrl && (
            <a href={subject.correctionUrl} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-primary">
              Voir la Correction
            </a>
          )}
        </div>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        
        {/* Colonne Gauche : Détails & Achats */}
        <div>
          <div className="admin-card" style={{ marginBottom: '2rem' }}>
            <h2 className="admin-card-title" style={{ marginBottom: '1.5rem' }}>Détails du document</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginBottom: '0.3rem' }}>Matière</div>
                <div style={{ fontWeight: 500 }}>{subject.motiere || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginBottom: '0.3rem' }}>Niveau</div>
                <div style={{ fontWeight: 500 }}>{subject.grade || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginBottom: '0.3rem' }}>Année</div>
                <div style={{ fontWeight: 500 }}>{subject.year || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginBottom: '0.3rem' }}>Prix</div>
                <div style={{ fontWeight: 600, color: 'var(--gold)' }}>{subject.credits || 0} crédits</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginBottom: '0.3rem' }}>Auteur</div>
                <div style={{ fontWeight: 500 }}>
                  {subject.authorId ? (
                    <Link href={`/admin/utilisateurs/${subject.authorId}`} style={{ color: 'var(--gold)', textDecoration: 'none' }}>
                      {subject.authorPrenom} {subject.authorNom} ({subject.authorRole})
                    </Link>
                  ) : (
                    "Uploadé par l'Admin"
                  )}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginBottom: '0.3rem' }}>Série</div>
                <div style={{ fontWeight: 500 }}>{subject.series || 'Toutes séries'}</div>
              </div>
            </div>

            {subject.tags && subject.tags.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginBottom: '0.5rem' }}>Tags</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {subject.tags.map((tag: string) => (
                    <span key={tag} className="sb-badge sb-badge-blue">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="admin-card">
            <h2 className="admin-card-title" style={{ marginBottom: '1.5rem' }}>Derniers achats ({subject.purchases?.length || 0})</h2>
            {subject.purchases?.length === 0 ? (
              <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Ce sujet n'a pas encore été acheté.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Date d'achat</th>
                  </tr>
                </thead>
                <tbody>
                  {subject.purchases.map((purchase: any) => (
                    <tr key={purchase.id}>
                      <td>
                        <Link href={`/admin/utilisateurs/${purchase.userId}`} style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>
                          {purchase.prenom} {purchase.nom}
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{purchase.email}</div>
                      </td>
                      <td>{formatDate(purchase.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Colonne Droite : Panneau de Modération & Logs */}
        <div>
          <div className="admin-card" style={{ marginBottom: '2rem' }}>
            <h2 className="admin-card-title" style={{ marginBottom: '1.5rem' }}>Modération du sujet</h2>
            
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
                  rows={3} 
                  placeholder="Ex: Le pdf est illisible, veuillez le renvoyer..."
                ></textarea>
              </div>

              <button type="submit" className="admin-btn admin-btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                Mettre à jour le statut
              </button>
            </form>
          </div>

          {/* Historique Modération */}
          <div className="admin-card">
            <h2 className="admin-card-title" style={{ marginBottom: '1.5rem' }}>Historique système</h2>
            {subject.logs?.length === 0 ? (
              <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Aucun enregistrement trouvé.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {subject.logs?.map((log: any) => (
                  <div key={log.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--b1)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: log.action === 'PUBLISHED' ? 'var(--emerald)' : log.action === 'REJECTED' ? 'var(--ruby)' : 'var(--gold)', marginTop: '0.3rem', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.2rem' }}>
                        {log.action} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>par {log.actorPrenom} {log.actorNom}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>{formatDate(log.createdAt)}</div>
                      {log.notes && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--amber)', marginTop: '0.5rem', background: 'var(--amber-dim)', padding: '0.5rem', borderRadius: 'var(--r)' }}>
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
