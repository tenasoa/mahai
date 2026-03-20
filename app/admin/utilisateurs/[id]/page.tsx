import { getUserDetailAdmin, updateUserRoleAdmin } from '@/actions/admin/users'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, User, CreditCard, ShoppingBag, History } from 'lucide-react'

export const metadata = {
  title: 'Détail Utilisateur — Admin Mah.AI'
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date)
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

  return (
    <div>
      <div className="admin-header">
        <div>
          <Link href="/admin/utilisateurs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 500 }}>
            <ArrowLeft size={14} /> Retour à la liste
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="sb-av" style={{ width: 48, height: 48, fontSize: '1.2rem', background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold-line)' }}>
              {(userDetail.prenom?.charAt(0) || '')}{(userDetail.nom?.charAt(0) || '')}
            </div>
            <div>
              <h1 className="admin-title" style={{ marginBottom: '0.2rem' }}>{userDetail.prenom} {userDetail.nom}</h1>
              <p className="admin-subtitle">{userDetail.email} • {userDetail.credits || 0} crédits</p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-tabs" style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--b1)', marginBottom: '2rem' }}>
        <Link href={`/admin/utilisateurs/${p.id}?tab=profil`} className={`admin-tab ${tab === 'profil' ? 'admin-tab-active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '1rem', color: tab === 'profil' ? 'var(--gold)' : 'var(--text-3)', borderBottom: tab === 'profil' ? '2px solid var(--gold)' : '2px solid transparent', textDecoration: 'none', fontWeight: 500 }}>
          <User size={16} /> Profil
        </Link>
        <Link href={`/admin/utilisateurs/${p.id}?tab=purchases`} className={`admin-tab ${tab === 'purchases' ? 'admin-tab-active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '1rem', color: tab === 'purchases' ? 'var(--gold)' : 'var(--text-3)', borderBottom: tab === 'purchases' ? '2px solid var(--gold)' : '2px solid transparent', textDecoration: 'none', fontWeight: 500 }}>
          <ShoppingBag size={16} /> Sujets achetés ({userDetail.purchases?.length || 0})
        </Link>
        <Link href={`/admin/utilisateurs/${p.id}?tab=credits`} className={`admin-tab ${tab === 'credits' ? 'admin-tab-active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '1rem', color: tab === 'credits' ? 'var(--gold)' : 'var(--text-3)', borderBottom: tab === 'credits' ? '2px solid var(--gold)' : '2px solid transparent', textDecoration: 'none', fontWeight: 500 }}>
          <CreditCard size={16} /> Crédits ({userDetail.creditHistory?.length || 0})
        </Link>
        <Link href={`/admin/utilisateurs/${p.id}?tab=history`} className={`admin-tab ${tab === 'history' ? 'admin-tab-active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '1rem', color: tab === 'history' ? 'var(--gold)' : 'var(--text-3)', borderBottom: tab === 'history' ? '2px solid var(--gold)' : '2px solid transparent', textDecoration: 'none', fontWeight: 500 }}>
          <History size={16} /> Soumissions ({userDetail.submissions?.length || 0})
        </Link>
      </div>

      <div className="admin-card">
        {tab === 'profil' && (
          <div style={{ maxWidth: '600px' }}>
            <h2 className="admin-card-title" style={{ marginBottom: '1.5rem' }}>Informations personnelles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label className="admin-label">Prénom</label>
                <input type="text" className="admin-input" defaultValue={userDetail.prenom || ''} readOnly disabled />
              </div>
              <div>
                <label className="admin-label">Nom</label>
                <input type="text" className="admin-input" defaultValue={userDetail.nom || ''} readOnly disabled />
              </div>
              <div>
                <label className="admin-label">Email</label>
                <input type="email" className="admin-input" defaultValue={userDetail.email || ''} readOnly disabled />
              </div>
              <div>
                <label className="admin-label">Téléphone</label>
                <input type="text" className="admin-input" defaultValue={userDetail.telephone || 'Non renseigné'} readOnly disabled />
              </div>
              <div>
                <label className="admin-label">Niveau d'études</label>
                <input type="text" className="admin-input" defaultValue={userDetail.niveauEtude || 'Non renseigné'} readOnly disabled />
              </div>
              <div>
                <label className="admin-label">Date d'inscription</label>
                <input type="text" className="admin-input" defaultValue={formatDate(userDetail.createdAt)} readOnly disabled />
              </div>
            </div>

            <hr style={{ border: 0, borderTop: '1px solid var(--b1)', margin: '2rem 0' }} />

            <h2 className="admin-card-title" style={{ marginBottom: '1.5rem' }}>Rôle de l'utilisateur</h2>
            <form action={handleRoleUpdate} style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
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
                Mettre à jour le rôle
              </button>
            </form>
          </div>
        )}

        {tab === 'purchases' && (
          <div>
            <h2 className="admin-card-title" style={{ marginBottom: '1.5rem' }}>Historique d'achat des sujets</h2>
            {userDetail.purchases?.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>
                Cet utilisateur n'a acheté aucun sujet.
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
                    </tr>
                  </thead>
                  <tbody>
                    {userDetail.purchases.map((purchase: any) => (
                      <tr key={purchase.id}>
                        <td>{formatDate(purchase.createdAt)}</td>
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text)' }}>{purchase.title || 'Sujet inconnu'}</div>
                        </td>
                        <td>{purchase.year || 'N/A'}</td>
                        <td><span className="sb-badge sb-badge-blue">{purchase.grade || 'N/A'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'credits' && (
          <div>
            <h2 className="admin-card-title" style={{ marginBottom: '1.5rem' }}>Historique de recharges de crédits</h2>
            {userDetail.creditHistory?.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>
                Aucune transaction enregistrée.
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Montant (MGA)</th>
                      <th>Crédits</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userDetail.creditHistory.map((tx: any) => (
                      <tr key={tx.id}>
                        <td>{formatDate(tx.createdAt)}</td>
                        <td>{tx.paymentMethod}</td>
                        <td style={{ fontWeight: 500 }}>{tx.amount ? new Intl.NumberFormat('fr-FR').format(tx.amount) + ' Ar' : '-'}</td>
                        <td><span style={{ color: 'var(--gold)' }}>+{tx.creditsCount} cr</span></td>
                        <td>
                          <span className={`status-badge ${tx.status === 'COMPLETED' ? 'status-emerald' : tx.status === 'PENDING' ? 'status-amber' : 'status-ruby'}`}>
                            {tx.status}
                          </span>
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
          <div>
            <h2 className="admin-card-title" style={{ marginBottom: '1.5rem' }}>Sujets soumis</h2>
            {userDetail.submissions?.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>
                Aucune soumission de sujet.
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date de soumission</th>
                      <th>Titre initial</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userDetail.submissions.map((sub: any) => (
                      <tr key={sub.id}>
                        <td>{formatDate(sub.createdAt)}</td>
                        <td><div style={{ fontWeight: 500 }}>{sub.title}</div></td>
                        <td>
                          <span className={`status-badge ${sub.status === 'APPROVED' ? 'status-emerald' : sub.status === 'PENDING' ? 'status-amber' : 'status-ruby'}`}>
                            {sub.status || 'PENDING'}
                          </span>
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
    </div>
  )
}
