import { getCreditTransactionsAdmin, validateCreditTransaction, rejectCreditTransaction } from '@/actions/admin/credits'
import Link from 'next/link'
import { Clock, CheckCircle2, XCircle, Search, CreditCard } from 'lucide-react'

export const metadata = {
  title: 'Gestion des Crédits MVola — Admin Mah.AI'
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date)
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(amount).replace('MGA', 'Ar')
}

export default async function AdminCreditsPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const sp = await searchParams
  const tab = sp.tab || 'pending'
  
  let statusFilter = 'PENDING'
  if (tab === 'completed') statusFilter = 'COMPLETED'
  if (tab === 'rejected') statusFilter = 'REJECTED'

  const transactions = await getCreditTransactionsAdmin(statusFilter)

  async function handleValidate(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    if (id) await validateCreditTransaction(id)
  }

  async function handleReject(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const reason = formData.get('reason') as string
    if (id && reason) await rejectCreditTransaction(id, reason)
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Recharges MVola</h1>
          <p className="admin-subtitle">Gérez les demandes de rechargement de crédits par Mobile Money</p>
        </div>
      </div>

      <div className="admin-tabs" style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--b1)', marginBottom: '2rem' }}>
        <Link href="/admin/credits?tab=pending" className={`admin-tab ${tab === 'pending' ? 'admin-tab-active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '1rem', color: tab === 'pending' ? 'var(--gold)' : 'var(--text-3)', borderBottom: tab === 'pending' ? '2px solid var(--gold)' : '2px solid transparent', textDecoration: 'none', fontWeight: 500 }}>
          <Clock size={16} /> En attente
        </Link>
        <Link href="/admin/credits?tab=completed" className={`admin-tab ${tab === 'completed' ? 'admin-tab-active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '1rem', color: tab === 'completed' ? 'var(--gold)' : 'var(--text-3)', borderBottom: tab === 'completed' ? '2px solid var(--gold)' : '2px solid transparent', textDecoration: 'none', fontWeight: 500 }}>
          <CheckCircle2 size={16} /> Validées
        </Link>
        <Link href="/admin/credits?tab=rejected" className={`admin-tab ${tab === 'rejected' ? 'admin-tab-active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '1rem', color: tab === 'rejected' ? 'var(--gold)' : 'var(--text-3)', borderBottom: tab === 'rejected' ? '2px solid var(--gold)' : '2px solid transparent', textDecoration: 'none', fontWeight: 500 }}>
          <XCircle size={16} /> Refusées
        </Link>
      </div>

      <div className="admin-card">
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Utilisateur (Contact)</th>
                <th>Paiement (Référence)</th>
                <th>Montant & Crédits</th>
                {tab === 'rejected' && <th>Motif du refus</th>}
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
                    Aucune transaction dans cette catégorie.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{formatDate(tx.createdAt)}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>{tx.prenom} {tx.nom}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                        {tx.email}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text)' }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#00CC99' }} title="MVola"></span>
                        <span style={{ fontWeight: 500 }}>{tx.phoneNumber || tx.userPhone || 'N/A'}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--amber)', fontFamily: 'var(--mono)' }}>
                        Réf: {tx.senderCode || 'Non fournie'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{formatMoney(tx.amount)}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>+{tx.creditsCount} crédits</div>
                    </td>
                    
                    {tab === 'rejected' && (
                      <td style={{ color: 'var(--ruby)', fontSize: '0.85rem' }}>{tx.rejectionReason}</td>
                    )}

                    <td style={{ textAlign: 'right' }}>
                      {tab === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <form action={handleValidate}>
                            <input type="hidden" name="id" value={tx.id} />
                            <button type="submit" className="admin-btn" style={{ background: 'var(--emerald)', color: '#000', border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                              Valider
                            </button>
                          </form>

                          {/* Refus avec mini-formulaire caché visuellement, ou prompt natif/HTML */}
                          <form action={handleReject} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="hidden" name="id" value={tx.id} />
                            <input type="text" name="reason" placeholder="Motif..." required className="admin-input" style={{ width: '120px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', minHeight: 'auto' }} />
                            <button type="submit" className="admin-btn admin-btn-outline" style={{ color: 'var(--ruby)', borderColor: 'var(--ruby-dim)', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                              Refuser
                            </button>
                          </form>
                        </div>
                      ) : (
                        <Link href={`/admin/utilisateurs/${tx.userId}?tab=credits`} className="admin-btn admin-btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                          Voir compte
                        </Link>
                      )}
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
