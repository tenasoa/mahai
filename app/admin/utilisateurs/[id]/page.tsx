import { getUserDetailAdmin, updateUserRoleAdmin } from '@/actions/admin/users'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, User, CreditCard, ShoppingBag, History, CheckCircle2, XCircle, Clock, Mail, Phone, Calendar, Award, Edit3 } from 'lucide-react'

export const metadata = {
  title: 'Détail Utilisateur — Admin Mah.AI'
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date)
}

function formatDateShort(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(date)
}

function formatCredits(credits: number) {
  return credits + ' cr' + (credits > 1 ? 's' : '')
}

function RoleBadge({ role }: { role: string }) {
  const roleConfig: Record<string, { label: string; class: string }> = {
    ADMIN: { label: 'Administrateur', class: 'status-ruby' },
    PROFESSEUR: { label: 'Professeur', class: 'status-amber' },
    VALIDATEUR: { label: 'Validateur', class: 'status-amber' },
    VERIFICATEUR: { label: 'Vérificateur', class: 'status-blue' },
    CONTRIBUTEUR: { label: 'Contributeur', class: 'status-blue' },
    ETUDIANT: { label: 'Étudiant', class: 'status-gray' },
  }
  const config = roleConfig[role] || { label: role, class: 'status-gray' }
  return <span className={`status-badge ${config.class}`}>{config.label}</span>
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; class: string }> = {
    COMPLETED: { label: 'Validée', class: 'status-emerald' },
    PENDING: { label: 'En attente', class: 'status-amber' },
    FAILED: { label: 'Refusée', class: 'status-ruby' },
    APPROVED: { label: 'Approuvé', class: 'status-emerald' },
    REJECTED: { label: 'Rejeté', class: 'status-ruby' },
  }
  const config = configs[status] || { label: status, class: 'status-gray' }
  return <span className={`status-badge ${config.class}`}>{config.label}</span>
}

export default async function AdminUserDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const p = await params
  const sp = await searchParams

  const userDetail = await getUserDetailAdmin(p.id)

  if (!userDetail) {
    redirect('/admin/utilisateurs')
  }

  const tab = sp.tab || 'profil'

  async function handleRoleUpdate(formData: FormData) {
    'use server'
    const newRole = formData.get('role') as string
    if (newRole && newRole !== userDetail.role) {
      await updateUserRoleAdmin(p.id, newRole)
    }
  }

  const tabs = [
    { id: 'profil', label: 'Profil', icon: User, count: null },
    { id: 'purchases', label: 'Achats', icon: ShoppingBag, count: userDetail.purchases?.length || 0 },
    { id: 'credits', label: 'Crédits', icon: CreditCard, count: userDetail.creditHistory?.length || 0 },
    { id: 'history', label: 'Soumissions', icon: History, count: userDetail.submissions?.length || 0 },
  ]

  return (
    <div className="admin-page-content">
      {/* Header */}
      <div className="admin-header">
        <div>
          <Link href="/admin/utilisateurs" className="admin-back-link">
            <ArrowLeft size={14} />
            Retour à la liste
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '1rem' }}>
            {userDetail.profilePicture ? (
              <img 
                src={userDetail.profilePicture} 
                alt={`${userDetail.prenom} ${userDetail.nom}`}
                className="sb-av sb-av-lg"
                style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold-line)' }}
              />
            ) : (
              <div className="sb-av sb-av-lg" style={{ width: 56, height: 56, fontSize: '1.3rem', background: 'linear-gradient(135deg, var(--gold-dim), var(--amber-dim))', color: 'var(--gold)', border: '2px solid var(--gold-line)' }}>
                {(userDetail.prenom?.charAt(0) || '')}{(userDetail.nom?.charAt(0) || '')}
              </div>
            )}
            <div>
              <h1 className="admin-title" style={{ marginBottom: '0.25rem' }}>{userDetail.prenom} {userDetail.nom}</h1>
              <p className="admin-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} />
                  {userDetail.email}
                </span>
                <span style={{ color: 'var(--text-4)' }}>•</span>
                <span style={{ color: 'var(--sage)', fontWeight: 600, fontFamily: 'var(--mono)' }}>
                  {formatCredits(userDetail.credits || 0)}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="admin-header-actions">
          <RoleBadge role={userDetail.role} />
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <Link
              key={t.id}
              href={`/admin/utilisateurs/${p.id}?tab=${t.id}`}
              className={`admin-tab ${tab === t.id ? 'admin-tab-active' : ''}`}
            >
              <Icon size={16} />
              {t.label}
              {t.count !== null && t.count > 0 && (
                <span className="admin-tab-count">{t.count}</span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Content */}
      {tab === 'profil' && (
        <div className="admin-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
          {/* Informations personnelles */}
          <div className="admin-card">
            <h2 className="admin-card-title">
              <User size={18} />
              Informations personnelles
            </h2>
            <div className="admin-info-grid">
              <div className="admin-info-item">
                <span className="admin-info-label">Prénom</span>
                <span className="admin-info-value">{userDetail.prenom || 'Non renseigné'}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Nom</span>
                <span className="admin-info-value">{userDetail.nom || 'Non renseigné'}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Email</span>
                <span className="admin-info-value" style={{ fontFamily: 'var(--mono)' }}>{userDetail.email}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Téléphone</span>
                <span className="admin-info-value">
                  {userDetail.phone ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Phone size={14} style={{ color: 'var(--text-3)' }} />
                      {userDetail.phone}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-4)', fontStyle: 'italic' }}>Non renseigné</span>
                  )}
                </span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Niveau d'études</span>
                <span className="admin-info-value">{userDetail.schoolLevel || 'Non renseigné'}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Date d'inscription</span>
                <span className="admin-info-value">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} style={{ color: 'var(--text-3)' }} />
                    {formatDate(userDetail.createdAt)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Gestion du rôle */}
          <div className="admin-card">
            <h2 className="admin-card-title">
              <Award size={18} />
              Permissions
            </h2>
            <form action={handleRoleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="admin-label">Niveau de permissions</label>
                <select name="role" defaultValue={userDetail.role} className="admin-input">
                  <option value="ETUDIANT">Étudiant (Par défaut)</option>
                  <option value="CONTRIBUTEUR">Contributeur (Propose des sujets)</option>
                  <option value="VERIFICATEUR">Vérificateur (Modération N1)</option>
                  <option value="VALIDATEUR">Validateur (Modération N2)</option>
                  <option value="PROFESSEUR">Professeur (Auteur vérifié)</option>
                  <option value="ADMIN">Administrateur (Accès total)</option>
                </select>
              </div>
              <button type="submit" className="admin-btn admin-btn-primary">
                <Edit3 size={16} />
                Mettre à jour le rôle
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '0.5rem' }}>Solde actuel</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--sage)', fontFamily: 'var(--mono)' }}>
                {formatCredits(userDetail.credits || 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'purchases' && (
        <div className="admin-card">
          <h2 className="admin-card-title">
            <ShoppingBag size={18} />
            Sujets achetés ({userDetail.purchases?.length || 0})
          </h2>
          {userDetail.purchases?.length === 0 ? (
            <div className="admin-empty-state">
              <ShoppingBag className="admin-empty-state-icon" size={48} />
              <div className="admin-empty-state-text">Cet utilisateur n'a acheté aucun sujet</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sujet</th>
                    <th>Année</th>
                    <th>Niveau</th>
                    <th>Crédits</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetail.purchases.map((purchase: any) => (
                    <tr key={purchase.id}>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{formatDateShort(purchase.createdAt)}</td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text)' }}>{purchase.title || 'Sujet inconnu'}</div>
                      </td>
                      <td>{purchase.year || 'N/A'}</td>
                      <td>
                        <span className="status-badge status-blue">{purchase.grade || 'N/A'}</span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{purchase.credits || 0}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'credits' && (
        <div className="admin-card">
          <h2 className="admin-card-title">
            <CreditCard size={18} />
            Historique des recharges ({userDetail.creditHistory?.length || 0})
          </h2>
          {userDetail.creditHistory?.length === 0 ? (
            <div className="admin-empty-state">
              <CreditCard className="admin-empty-state-icon" size={48} />
              <div className="admin-empty-state-text">Aucune transaction enregistrée</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Méthode</th>
                    <th>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span>Paiement</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontWeight: 400, textTransform: 'none' }}>(Montant en Ar)</span>
                      </div>
                    </th>
                    <th>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span>Crédits</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontWeight: 400, textTransform: 'none' }}>(Reçus)</span>
                      </div>
                    </th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetail.creditHistory.map((tx: any) => (
                    <tr key={tx.id}>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{formatDateShort(tx.createdAt)}</td>
                      <td>{tx.paymentMethod || 'Mobile Money'}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--gold)', fontSize: '0.95rem' }}>
                            {tx.amount ? new Intl.NumberFormat('fr-FR').format(tx.amount) + ' Ar' : '-'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontSize: '0.9rem', color: 'var(--sage)', fontWeight: 600 }}>
                            +{tx.creditsCount} cr
                          </span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={tx.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="admin-card">
          <h2 className="admin-card-title">
            <History size={18} />
            Soumissions de sujets ({userDetail.submissions?.length || 0})
          </h2>
          {userDetail.submissions?.length === 0 ? (
            <div className="admin-empty-state">
              <History className="admin-empty-state-icon" size={48} />
              <div className="admin-empty-state-text">Aucune soumission de sujet</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Titre</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetail.submissions.map((sub: any) => (
                    <tr key={sub.id}>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{formatDateShort(sub.createdAt)}</td>
                      <td style={{ fontWeight: 500 }}>{sub.title}</td>
                      <td>
                        <StatusBadge status={sub.status || 'PENDING'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}