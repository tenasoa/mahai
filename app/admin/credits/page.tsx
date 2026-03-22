import { getCreditTransactionsAdmin, validateCreditTransaction, rejectCreditTransaction } from '@/actions/admin/credits'
import Link from 'next/link'
import { Clock, CheckCircle2, XCircle, Wallet } from 'lucide-react'
import { CreditsTable } from '@/components/admin/CreditsTable'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Gestion des Crédits Mobile Banking — Admin Mah.AI'
}

const PAGE_SIZE = 12

export default async function AdminCreditsPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string, page?: string }>
}) {
  const sp = await searchParams
  const tab = sp.tab || 'pending'
  const page = sp.page ? parseInt(sp.page, 10) : 1

  let statusFilter = 'PENDING'
  if (tab === 'completed') statusFilter = 'COMPLETED'
  if (tab === 'rejected') statusFilter = 'FAILED'

  const { transactions, pagination } = await getCreditTransactionsAdmin(statusFilter, page, PAGE_SIZE)

  if (page > pagination.totalPages && pagination.totalPages > 0) {
    redirect(`/admin/credits?tab=${tab}&page=${pagination.totalPages}`)
  }

  const pendingCount = statusFilter === 'PENDING' ? transactions.length : 0

  async function handleValidate(id: string) {
    'use server'
    await validateCreditTransaction(id)
  }

  async function handleReject(id: string, reason: string) {
    'use server'
    await rejectCreditTransaction(id, reason)
  }

  return (
    <div className="admin-page-content">
      <div className="admin-header">
        <div>
          <div className="admin-header-badge" style={{ background: 'var(--amber-dim)', borderColor: 'var(--amber-line)', color: 'var(--amber)' }}>
            <Wallet size={14} />
            <span>Finances</span>
          </div>
          <h1 className="admin-title">Recharges Mobile Banking</h1>
          <p className="admin-subtitle">Gérez les demandes de rechargement de crédits par Mobile Banking</p>
        </div>
        {pendingCount > 0 && (
          <div className="admin-header-actions">
            <span className="status-badge status-amber">
              {pendingCount} en attente
            </span>
          </div>
        )}
      </div>

      {/* Tabs améliorés */}
      <div className="admin-tabs">
        <Link
          href="/admin/credits?tab=pending"
          className={`admin-tab ${tab === 'pending' ? 'admin-tab-active' : ''}`}
        >
          <Clock size={16} />
          En attente
        </Link>
        <Link
          href="/admin/credits?tab=completed"
          className={`admin-tab ${tab === 'completed' ? 'admin-tab-active' : ''}`}
        >
          <CheckCircle2 size={16} />
          Validées
        </Link>
        <Link
          href="/admin/credits?tab=rejected"
          className={`admin-tab ${tab === 'rejected' ? 'admin-tab-active' : ''}`}
        >
          <XCircle size={16} />
          Refusées
        </Link>
      </div>

      <div className="admin-card">
        <CreditsTable
          transactions={transactions}
          tab={tab}
          onValidate={handleValidate}
          onReject={handleReject}
        />
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            background: 'var(--surface)',
            borderTop: '1px solid var(--b1)',
            borderRadius: '0 0 var(--r-lg) var(--r-lg)',
            fontFamily: 'var(--mono)',
            fontSize: '0.75rem',
            color: 'var(--text-3)'
          }}>
            <span>
              {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, pagination.total)} sur {pagination.total}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Link
                href={`/admin/credits?tab=${tab}&page=${Math.max(1, page - 1)}`}
                className={`admin-btn admin-btn-outline ${page === 1 ? 'admin-btn-disabled' : ''}`}
                style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
              >
                Précédent
              </Link>
              <span>Page {page} sur {pagination.totalPages}</span>
              <Link
                href={`/admin/credits?tab=${tab}&page=${Math.min(pagination.totalPages, page + 1)}`}
                className={`admin-btn admin-btn-outline ${page === pagination.totalPages ? 'admin-btn-disabled' : ''}`}
                style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
              >
                Suivant
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}