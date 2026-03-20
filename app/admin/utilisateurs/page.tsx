import { getUsersAdmin } from '@/actions/admin/users'
import Link from 'next/link'
import { Search, Users, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Utilisateurs — Admin Mah.AI'
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(date)
}

function RoleBadge({ role }: { role: string }) {
  let badgeClass = 'status-gray'
  let label = role
  if (role === 'ADMIN') {
    badgeClass = 'status-ruby'
    label = 'Admin'
  }
  if (role === 'PROFESSEUR') {
    badgeClass = 'status-amber'
    label = 'Professeur'
  }
  if (role === 'VALIDATEUR') {
    badgeClass = 'status-amber'
    label = 'Validateur'
  }
  if (role === 'CONTRIBUTEUR') {
    badgeClass = 'status-blue'
    label = 'Contributeur'
  }
  if (role === 'VERIFICATEUR') {
    badgeClass = 'status-blue'
    label = 'Vérificateur'
  }
  if (role === 'ETUDIANT') {
    badgeClass = 'status-gray'
    label = 'Étudiant'
  }

  return <span className={`status-badge ${badgeClass}`}>{label}</span>
}

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const sp = await searchParams
  const query = sp.q || ''

  const users = await getUsersAdmin(query)

  return (
    <div className="admin-page-content">
      <div className="admin-header">
        <div>
          <div className="admin-header-badge">
            <Users size={14} />
            <span>Gestion</span>
          </div>
          <h1 className="admin-title">Utilisateurs</h1>
          <p className="admin-subtitle">Gérez les comptes, rôles et accès de vos utilisateurs</p>
        </div>
        <div className="admin-header-actions">
          <span className="status-badge status-blue">{users.length} utilisateur{users.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="admin-card">
        {/* Barre d'outils (recherche, filtres) */}
        <div className="admin-card-header" style={{ borderBottom: '1px solid var(--b1)' }}>
          <form style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '450px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }}>
                <Search size={18} />
              </div>
              <input
                type="text"
                name="q"
                defaultValue={query}
                className="admin-input"
                placeholder="Rechercher par email, nom, prénom..."
                style={{ paddingLeft: '3rem' }}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary">
              <Search size={16} />
              Rechercher
            </button>
          </form>
        </div>

        {/* Liste utilisateurs */}
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Contact</th>
                <th>Rôle</th>
                <th>Date d'inscription</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-empty-state">
                      <Users className="admin-empty-state-icon" size={48} />
                      <div className="admin-empty-state-text">
                        {query ? `Aucun résultat pour "${query}"` : "Aucun utilisateur trouvé"}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        {user.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt={`${user.prenom} ${user.nom}`}
                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--gold-line)' }}
                          />
                        ) : (
                          <div className="sb-av" style={{ width: 40, height: 40, fontSize: '0.9rem' }}>
                            {(user.prenom?.charAt(0) || '')}{(user.nom?.charAt(0) || '')}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: '0.95rem' }}>
                            {user.prenom} {user.nom}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{user.email}</div>
                      {user.phone && (
                        <div style={{ color: 'var(--text-4)', fontSize: '0.75rem', fontFamily: 'var(--mono)' }}>
                          {user.phone}
                        </div>
                      )}
                    </td>
                    <td>
                      <RoleBadge role={user.role} />
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/admin/utilisateurs/${user.id}`} className="admin-btn admin-btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                        Voir le profil
                        <ArrowRight size={14} />
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
