import { getUserDetailAdmin, updateUserRoleAdmin } from '@/actions/admin/users'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft, User, CreditCard, ShoppingBag,
  History, Mail, Phone, Calendar, Award,
  Edit3, ShieldCheck, MapPin, GraduationCap
} from 'lucide-react'
import { AdminCreditAdjuster, AdminUserInfoEditor } from './UserActions'

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
  return new Intl.NumberFormat('fr-FR').format(credits) + ' cr' + (credits > 1 ? 's' : '')
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
  return (
    <span className={`status-badge ${config.class}`}>
      <ShieldCheck size={12} />
      {config.label}
    </span>
  )
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
    { id: 'profil', label: 'Profil & Infos', icon: User, count: null },
    { id: 'purchases', label: 'Achats Sujets', icon: ShoppingBag, count: userDetail.purchases?.length || 0 },
    { id: 'credits', label: 'Flux Crédits', icon: CreditCard, count: userDetail.creditHistory?.length || 0 },
    { id: 'history', label: 'Contributions', icon: History, count: userDetail.submissions?.length || 0 },
  ]

  return (
    <div className="admin-page-content">
      {/* Superior Header / Banner */}
      <div className="admin-detail-banner" style={{
        background: 'linear-gradient(to right, var(--depth), var(--void))',
        border: '1px solid var(--b2)',
        borderRadius: 'var(--r-lg)',
        padding: '2.5rem',
        marginBottom: '2.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decorative Element */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, var(--gold-dim) 0%, transparent 70%)',
          opacity: 0.4,
          pointerEvents: 'none'
        }}></div>

        <Link href="/admin/utilisateurs" className="admin-back-link">
          <ArrowLeft size={14} />
          Retour aux utilisateurs
        </Link>

        <div className="admin-banner-inner" style={{ display: 'flex', alignItems: 'center', gap: '2rem', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative' }}>
            {userDetail.profilePicture ? (
              <img 
                src={userDetail.profilePicture} 
                alt={`${userDetail.prenom} ${userDetail.nom}`}
                style={{ 
                  width: 100, 
                  height: 100, 
                  borderRadius: '1.5rem', 
                  objectFit: 'cover', 
                  border: '3px solid var(--gold-line)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}
              />
            ) : (
              <div style={{ 
                width: 100, 
                height: 100, 
                borderRadius: '1.5rem', 
                fontSize: '2rem', 
                background: 'linear-gradient(135deg, var(--surface), var(--depth))', 
                color: 'var(--gold)', 
                border: '3px solid var(--gold-line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--display)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                {(userDetail.prenom?.charAt(0) || '')}{(userDetail.nom?.charAt(0) || '')}
              </div>
            )}
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              right: '-8px',
              background: 'var(--void)',
              borderRadius: '50%',
              padding: '4px'
            }}>
              <RoleBadge role={userDetail.role} />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <h1 className="admin-title" style={{ fontSize: '2.2rem', margin: 0 }}>
                {userDetail.prenom} <em style={{ fontStyle: 'italic', fontWeight: 300 }}>{userDetail.nom}</em>
              </h1>
              <span style={{ 
                fontFamily: 'var(--mono)', 
                fontSize: '0.7rem', 
                color: 'var(--text-4)',
                background: 'var(--surface)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid var(--b2)'
              }}>
                ID: {userDetail.id.substring(0, 8)}...
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem', 
              marginTop: '0.75rem', 
              flexWrap: 'wrap' 
            }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-3)', fontSize: '0.9rem' }}>
                <Mail size={16} className="text-gold" />
                {userDetail.email}
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-3)', fontSize: '0.9rem' }}>
                <Calendar size={16} className="text-gold" />
                Inscrit le {formatDateShort(userDetail.createdAt)}
              </p>
              <div style={{ 
                background: 'var(--gold-dim)', 
                padding: '4px 12px', 
                borderRadius: '8px', 
                border: '1px solid var(--gold-line)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CreditCard size={14} className="text-gold" />
                <span style={{ color: 'var(--gold)', fontWeight: 700, fontFamily: 'var(--mono)', fontSize: '0.9rem' }}>
                  {formatCredits(userDetail.credits || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <Link
              key={t.id}
              href={`/admin/utilisateurs/${p.id}?tab=${t.id}`}
              className={`admin-tab ${tab === t.id ? 'admin-tab-active' : ''}`}
            >
              <Icon size={18} />
              {t.label}
              {t.count !== null && (
                <span className="admin-tab-count">{t.count}</span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Main Content Sections */}
      <div className="admin-content-view">
        {tab === 'profil' && (
          <div className="admin-grid" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
            {/* Detailed Info Card */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <User size={20} className="text-gold" />
                  Informations de <em>Profil</em>
                </h2>
                <AdminUserInfoEditor user={userDetail} />
              </div>
              <div className="admin-info-grid">
                <div className="admin-info-item">
                  <span className="admin-info-label">Prénom</span>
                  <span className="admin-info-value">{userDetail.prenom || '—'}</span>
                </div>
                <div className="admin-info-item">
                  <span className="admin-info-label">Nom</span>
                  <span className="admin-info-value">{userDetail.nom || '—'}</span>
                </div>
                <div className="admin-info-item">
                  <span className="admin-info-label">Pseudo</span>
                  <span className="admin-info-value" style={{ color: 'var(--gold)' }}>@{userDetail.pseudo || 'non_defini'}</span>
                </div>
                <div className="admin-info-item">
                  <span className="admin-info-label">Téléphone</span>
                  <div className="admin-info-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {userDetail.phone ? (
                      <>
                        <Phone size={14} className="text-text-4" />
                        {userDetail.phone}
                      </>
                    ) : '—'}
                  </div>
                </div>
                <div className="admin-info-item">
                  <span className="admin-info-label">Niveau d'études</span>
                  <div className="admin-info-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <GraduationCap size={14} className="text-text-4" />
                    {userDetail.schoolLevel || userDetail.educationLevel || '—'}
                  </div>
                </div>
                <div className="admin-info-item">
                  <span className="admin-info-label">Localisation</span>
                  <div className="admin-info-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={14} className="text-text-4" />
                    {userDetail.region ? `${userDetail.region}${userDetail.district ? `, ${userDetail.district}` : ''}` : '—'}
                  </div>
                </div>
                <div className="admin-info-item" style={{ gridColumn: 'span 2' }}>
                  <span className="admin-info-label">Biographie / Objectifs</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.6, marginTop: '0.25rem' }}>
                    {userDetail.bio || 'Aucune description fournie.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Management & Quick Stats */}
            <div className="admin-grid" style={{ gap: '2rem' }}>
              <div className="admin-card">
                <div className="admin-card-header">
                  <h2 className="admin-card-title">
                    <Award size={20} className="text-gold" />
                    Gestion des <em>Permissions</em>
                  </h2>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <form action={handleRoleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontFamily: 'var(--mono)', 
                        fontSize: '0.65rem', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.1em', 
                        color: 'var(--text-4)',
                        marginBottom: '0.75rem' 
                      }}>
                        Rôle de l'utilisateur
                      </label>
                      <select name="role" defaultValue={userDetail.role} 
                        style={{
                          width: '100%',
                          background: 'var(--surface)',
                          border: '1px solid var(--b1)',
                          borderRadius: 'var(--r)',
                          padding: '0.8rem 1rem',
                          color: 'var(--text)',
                          fontFamily: 'var(--body)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="ETUDIANT">Étudiant (Par défaut)</option>
                        <option value="CONTRIBUTEUR">Contributeur</option>
                        <option value="VERIFICATEUR">Vérificateur</option>
                        <option value="VALIDATEUR">Validateur</option>
                        <option value="PROFESSEUR">Professeur</option>
                        <option value="ADMIN">Administrateur</option>
                      </select>
                    </div>
                    <button type="submit" className="admin-btn admin-btn-primary" style={{ width: '100%', gap: '0.75rem' }}>
                      <Edit3 size={16} />
                      Appliquer les modifications
                    </button>
                  </form>
                </div>
              </div>

              <div className="admin-card" style={{ 
                background: 'linear-gradient(135deg, var(--card), var(--surface))',
                border: '1px solid var(--gold-line)'
              }}>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '12px', 
                      background: 'var(--gold-dim)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <CreditCard size={20} className="text-gold" />
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text-4)', textTransform: 'uppercase' }}>
                      Portefeuille
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '0.25rem' }}>Crédits actuels</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--display)', letterSpacing: '-0.02em' }}>
                    {userDetail.credits || 0}<span style={{ color: 'var(--gold)', fontSize: '1rem', marginLeft: '0.5rem' }}>cr</span>
                  </div>
                  <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                    <Link
                      href={`/admin/utilisateurs/${p.id}?tab=credits`}
                      className="admin-btn admin-btn-outline"
                      style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem', textAlign: 'center', justifyContent: 'center' }}
                    >
                      Historique
                    </Link>
                    <AdminCreditAdjuster user={userDetail} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'purchases' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <ShoppingBag size={20} className="text-gold" />
                Liste des <em>Achats</em> ({userDetail.purchases?.length || 0})
              </h2>
            </div>
            {userDetail.purchases?.length === 0 ? (
              <div className="admin-empty-state">
                <ShoppingBag className="admin-empty-state-icon" size={64} style={{ marginBottom: '1rem' }} />
                <div className="admin-empty-state-text" style={{ fontSize: '1.1rem' }}>Aucun achat enregistré pour cet utilisateur</div>
                <p style={{ color: 'var(--text-4)', fontSize: '0.85rem' }}>Les futurs achats apparaîtront ici avec le détail des transactions.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Date</th>
                      <th>Sujet & Archive</th>
                      <th style={{ width: '100px' }}>Année</th>
                      <th style={{ width: '150px' }}>Niveau</th>
                      <th style={{ width: '120px', textAlign: 'right' }}>Crédits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userDetail.purchases.map((purchase: any) => (
                      <tr key={purchase.id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 500, color: 'var(--text-2)' }}>{formatDateShort(purchase.createdAt)}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-4)', fontFamily: 'var(--mono)' }}>Transaction #{purchase.id.substring(0, 6)}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '1rem' }}>{purchase.title || 'Sujet sans titre'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{purchase.subType || 'Sujet officiel'}</div>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--mono)' }}>{purchase.year || '—'}</span>
                        </td>
                        <td>
                          <StatusBadge status={purchase.grade || 'ETUDIANT'} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ color: 'var(--gold)', fontWeight: 700, fontFamily: 'var(--mono)', fontSize: '1rem' }}>
                            -{purchase.credits || 0}
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

        {tab === 'credits' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <CreditCard size={20} className="text-gold" />
                Historique des <em>Transactions</em> ({userDetail.creditHistory?.length || 0})
              </h2>
            </div>
            {userDetail.creditHistory?.length === 0 ? (
              <div className="admin-empty-state">
                <CreditCard className="admin-empty-state-icon" size={64} style={{ marginBottom: '1rem' }} />
                <div className="admin-empty-state-text" style={{ fontSize: '1.1rem' }}>Aucune transaction financière</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '150px' }}>Date & Heure</th>
                      <th>Méthode & Opérateur</th>
                      <th>Montant Réel</th>
                      <th>Valeur Crédits</th>
                      <th style={{ width: '150px', textAlign: 'center' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userDetail.creditHistory.map((tx: any) => (
                      <tr key={tx.id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 500, color: 'var(--text-2)' }}>{formatDateShort(tx.createdAt)}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-4)', fontFamily: 'var(--mono)' }}>
                              {new Date(tx.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '8px', 
                              background: 'var(--surface)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1rem'
                            }}>
                              {tx.paymentMethod?.toLowerCase().includes('mvola') ? '🇲' : tx.paymentMethod?.toLowerCase().includes('orange') ? '🇴' : '🇦'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text)' }}>{tx.paymentMethod || 'Mobile Money'}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-4)', fontFamily: 'var(--mono)' }}>REF: {tx.id.substring(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.1rem' }}>
                            {tx.metadata?.price ? new Intl.NumberFormat('fr-FR').format(tx.metadata.price) + ' Ar' : tx.type === 'EARN' && tx.description?.includes('bienvenue') ? '0 Ar' : '—'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ 
                              fontSize: '1rem', 
                              color: tx.amount > 0 ? 'var(--sage)' : 'var(--ruby)', 
                              fontWeight: 700, 
                              fontFamily: 'var(--mono)' 
                            }}>
                              {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-4)' }}>crédits</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
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
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <History size={20} className="text-gold" />
                Soumissions de <em>Sujets</em> ({userDetail.submissions?.length || 0})
              </h2>
            </div>
            {userDetail.submissions?.length === 0 ? (
              <div className="admin-empty-state">
                <History className="admin-empty-state-icon" size={64} style={{ marginBottom: '1rem' }} />
                <div className="admin-empty-state-text" style={{ fontSize: '1.1rem' }}>Aucune contribution active</div>
                <p style={{ color: 'var(--text-4)', fontSize: '0.85rem' }}>Les sujets proposés par ce contributeur s'afficheront ici.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Date</th>
                      <th>Titre du Sujet</th>
                      <th>Matière & Niveau</th>
                      <th style={{ width: '150px', textAlign: 'center' }}>Statut Validation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userDetail.submissions.map((sub: any) => (
                      <tr key={sub.id}>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{formatDateShort(sub.createdAt)}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-2)' }}>{sub.title}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-4)' }}>ID: {sub.id.substring(0, 8)}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span style={{ fontSize: '0.85rem' }}>{sub.matiere || '—'}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--gold)' }}>{sub.serie || 'Pluridisciplinaire'}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
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
    </div>
  )
}