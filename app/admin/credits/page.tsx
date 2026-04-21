import { getCreditTransactionsAdmin, validateCreditTransaction, rejectCreditTransaction } from '@/actions/admin/credits'
import Link from 'next/link'
import { Clock, CheckCircle2, XCircle, Wallet } from 'lucide-react'
import { CreditsTable } from '@/components/admin/CreditsTable'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { AdminPaginationLinks } from '@/components/admin/AdminPaginationLinks'
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
      <AdminBreadcrumb items={[{ label: 'Finances' }, { label: 'Mobile Banking' }]} />
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
        
        <AdminPaginationLinks
          currentPage={page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={PAGE_SIZE}
          buildUrl={(p) => `/admin/credits?tab=${tab}&page=${p}`}
        />
      </div>
    </div>
  )
}