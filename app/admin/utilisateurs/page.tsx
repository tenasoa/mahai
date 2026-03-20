import { getUsersAdmin } from '@/actions/admin/users'
import Link from 'next/link'
import { Search } from 'lucide-react'

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
  if (role === 'ADMIN') badgeClass = 'status-ruby'
  if (role === 'PROFESSEUR' || role === 'VALIDATEUR') badgeClass = 'status-amber'
  if (role === 'CONTRIBUTEUR' || role === 'VERIFICATEUR') badgeClass = 'status-blue'
  
  return <span className={`status-badge ${badgeClass}`}>{role}</span>
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
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Utilisateurs</h1>
          <p className="admin-subtitle">Gérez les comptes, rôles et accès de vos utilisateurs</p>
        </div>
      </div>

      <div className="admin-card">
        {/* Barre d'outils (recherche, filtres) */}
        <div className="admin-card-header" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--b1)' }}>
          <form style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '400px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>
                <Search size={16} />
              </div>
              <input 
                type="text" 
                name="q" 
                defaultValue={query} 
                className="admin-input" 
                placeholder="Rechercher un email, un nom..." 
                style={{ paddingLeft: '2.5rem' }} 
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary">
              Chercher
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
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="sb-av" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                          {(user.prenom?.charAt(0) || '')}{(user.nom?.charAt(0) || '')}
                        </div>
                        <div style={{ fontWeight: 500, color: 'var(--text)' }}>
                          {user.prenom} {user.nom}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{user.email}</div>
                      {user.telephone && (
                        <div style={{ color: 'var(--text-4)', fontSize: '0.75rem' }}>{user.telephone}</div>
                      )}
                    </td>
                    <td>
                      <RoleBadge role={user.role} />
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/admin/utilisateurs/${user.id}`} className="admin-btn admin-btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        Voir / Éditer
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
