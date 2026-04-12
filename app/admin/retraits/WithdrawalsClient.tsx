'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Download, FileText, Zap, CheckCircle, XCircle, AlertCircle, Clock, CreditCard, Smartphone, User, ChevronRight } from 'lucide-react'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { useToast } from '@/lib/hooks/useToast'
import { processWithdrawal, runBulkPayments } from './actions'

interface Withdrawal {
  id: string
  userId: string
  amount: number
  phoneNumber: string
  paymentMethod: string
  status: string
  prenom: string
  nom: string
  email: string
  credits: number
  createdAt: string
  rejectionReason?: string
}

interface AdminWithdrawalsClientProps {
  withdrawals: Withdrawal[]
  stats: {
    pending: number
    pendingAmount: number
    completed: number
    completedAmount: number
    failed: number
    totalAmount: number
  }
  cycle: {
    current: string
    period: string
    threshold: number
    daysLeft: number
  }
}

export default function AdminWithdrawalsClient({ withdrawals, stats, cycle }: AdminWithdrawalsClientProps) {
  const router = useRouter()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'failed' | 'history'>('pending')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const filteredWithdrawals = withdrawals.filter(w => {
    if (activeTab === 'pending') return w.status === 'PENDING' || w.status === 'PROCESSING'
    if (activeTab === 'completed') return w.status === 'COMPLETED'
    if (activeTab === 'failed') return w.status === 'FAILED'
    return true
  })

  // ... (keep helper functions: handleSelect, handleSelectAll, handleProcess, handleBulkPayment, getStatusBadge, formatMoney, formatDate)
  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === filteredWithdrawals.filter(w => w.status === 'PENDING').length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredWithdrawals.filter(w => w.status === 'PENDING').map(w => w.id))
    }
  }

  const handleProcess = async (id: string, action: 'approve' | 'reject' | 'send', reason?: string) => {
    setProcessing(true)
    const result = await processWithdrawal(id, action, reason)
    setProcessing(false)
    
    if (result.success) {
      toast.success('Traitement réussi', `Le retrait a été ${action === 'approve' ? 'approuvé' : action === 'reject' ? 'rejeté' : 'envoyé'}`)
      setShowModal(false)
      setRejectReason('')
      router.refresh()
    } else {
      toast.error('Erreur', result.error || 'Erreur lors du traitement')
    }
  }

  const handleBulkPayment = async () => {
    if (selectedIds.length === 0) {
      toast.warning('Sélection requise', 'Veuillez sélectionner au moins un retrait')
      return
    }

    setProcessing(true)
    const result = await runBulkPayments(selectedIds)
    setProcessing(false)

    if (result.success) {
      toast.success('Paiements envoyés', `${result.message}`)
      setSelectedIds([])
      router.refresh()
    } else {
      toast.error('Erreur', result.error || 'Erreur lors des paiements')
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; class: string }> = {
      PENDING: { label: 'En attente', class: 'pending' },
      PROCESSING: { label: 'En traitement', class: 'status-blue' },
      COMPLETED: { label: 'Envoyé', class: 'completed' },
      FAILED: { label: 'Échoué', class: 'failed' }
    }
    return config[status] || { label: status, class: 'pending' }
  }

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' Ar'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="admin-page-content">
      <ToastContainer />
      
      {/* Header Section */}
      <div className="admin-header">
        <div>
          <div className="admin-header-badge">
            <CreditCard size={12} />
            Gestion des Gains
          </div>
          <h1 className="admin-title">Retraits de fonds</h1>
          <p className="admin-subtitle">
            Cycle mensuel · {stats.pending} demandes en attente · {cycle.daysLeft} jours avant clôture
          </p>
        </div>
        <div className="admin-header-actions">
          <button 
            className="admin-btn admin-btn-outline"
            onClick={() => toast.info('Export', 'Génération du rapport CSV...')}
          >
            <Download size={16} />
            Exporter
          </button>
          <button 
            className="admin-btn admin-btn-primary"
            onClick={handleBulkPayment}
            disabled={selectedIds.length === 0 || processing}
          >
            <Zap size={16} />
            Verser vers Mobile Money ({selectedIds.length})
          </button>
        </div>
      </div>

      <div>
        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">En attente</span>
              <div className="kpi-icon" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>
                <Clock size={16} />
              </div>
            </div>
            <div className="kpi-value">{stats.pending}</div>
            <div className="kpi-trend kpi-trend-up">
              {formatMoney(stats.pendingAmount)} <span style={{ color: 'var(--text-4)', marginLeft: 4 }}>à verser</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Payés (ce mois)</span>
              <div className="kpi-icon" style={{ background: 'var(--sage-dim)', color: 'var(--sage)' }}>
                <CheckCircle size={16} />
              </div>
            </div>
            <div className="kpi-value">{stats.completed}</div>
            <div className="kpi-trend kpi-trend-up">
              ↑ {formatMoney(stats.completedAmount)} total
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Volume Total</span>
              <div className="kpi-icon" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
                <Zap size={16} />
              </div>
            </div>
            <div className="kpi-value gold">{formatMoney(stats.totalAmount)}</div>
            <div className="kpi-trend">
              {cycle.current}
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Valeur Moyenne</span>
              <div className="kpi-icon" style={{ background: 'rgba(107, 74, 155, 0.1)', color: '#B8A0E0' }}>
                <Smartphone size={16} />
              </div>
            </div>
            <div className="kpi-value">
              {stats.completed > 0 ? formatMoney(Math.round(stats.completedAmount / stats.completed)) : '0 Ar'}
            </div>
            <div className="kpi-trend">
              Par contributeur
            </div>
          </div>
        </div>

        {/* Cycle Banner */}
        <div className="cycle-banner">
          <div className="cb-item">
            <span className="cb-label">Cycle actuel</span>
            <span className="cb-val">{cycle.current}</span>
          </div>
          <div className="cb-divider"></div>
          <div className="cb-item">
            <span className="cb-label">Période de référence</span>
            <span className="cb-val" style={{ fontSize: '1rem' }}>{cycle.period}</span>
          </div>
          <div className="cb-divider"></div>
          <div className="cb-item">
            <span className="cb-label">Seuil minimum</span>
            <span className="cb-val" style={{ fontSize: '1rem' }}>{cycle.threshold} crédits</span>
          </div>
          <div className="cb-divider"></div>
          <div className="cb-item">
            <span className="cb-label">Statut du cycle</span>
            <div className="cb-countdown">
              <span className="cb-dot"></span>
              {cycle.daysLeft} jours restants
            </div>
          </div>
          <button 
            className="admin-btn admin-btn-primary" 
            style={{ marginLeft: 'auto' }}
            onClick={handleBulkPayment}
            disabled={selectedIds.length === 0 || processing}
          >
            ⚡ Exécuter les paiements sélectionnés
          </button>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'pending' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            En attente <span className="admin-tab-count">{withdrawals.filter(w => w.status === 'PENDING' || w.status === 'PROCESSING').length}</span>
          </button>
          <button 
            className={`admin-tab ${activeTab === 'completed' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Envoyés <span className="admin-tab-count">{withdrawals.filter(w => w.status === 'COMPLETED').length}</span>
          </button>
          <button 
            className={`admin-tab ${activeTab === 'failed' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('failed')}
          >
            Échecs <span className="admin-tab-count">{withdrawals.filter(w => w.status === 'FAILED').length}</span>
          </button>
        </div>

        {/* Withdrawals Table */}
        <div className="admin-card">
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === filteredWithdrawals.filter(w => w.status === 'PENDING').length && filteredWithdrawals.filter(w => w.status === 'PENDING').length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Contributeur</th>
                  <th>Montant</th>
                  <th>Crédits</th>
                  <th>Opérateur</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="admin-empty-state">
                        <CreditCard size={48} className="admin-empty-state-icon" />
                        <p className="admin-empty-state-text">Aucun retrait trouvé dans cette catégorie</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((w) => (
                    <tr key={w.id}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(w.id)}
                          onChange={() => handleSelect(w.id)}
                          disabled={w.status !== 'PENDING'}
                        />
                      </td>
                      <td>
                        <div className="w-contrib">
                          <div className="w-av">
                            {(w.prenom?.charAt(0) || 'U').toUpperCase()}
                          </div>
                          <div>
                            <div className="w-name">{w.prenom} {w.nom}</div>
                            <div className="w-email">{w.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={`w-amount ${w.status === 'PENDING' ? 'pending' : ''}`}>
                          {formatMoney(w.amount)}
                        </div>
                      </td>
                      <td>
                        <div className="w-credits">
                          {w.credits} cr
                        </div>
                      </td>
                      <td>
                        <div className="w-operator">
                          <Smartphone size={14} />
                          {w.paymentMethod}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadge(w.status).class}`}>
                          {getStatusBadge(w.status).label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {w.status === 'PENDING' && (
                            <button 
                              className="admin-btn admin-btn-outline" 
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                              onClick={() => { setSelectedWithdrawal(w); handleProcess(w.id, 'send') }}
                            >
                              Envoyer
                            </button>
                          )}
                          <button 
                            className="admin-btn admin-btn-outline"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                            onClick={() => { setSelectedWithdrawal(w); setShowModal(true) }}
                          >
                            <FileText size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedWithdrawal && (
        <div className="receipt-overlay" onClick={() => { setShowModal(false); setSelectedWithdrawal(null); setRejectReason('') }}>
          <div className="receipt-card" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-header">
              <div className="receipt-title">Détail du Retrait</div>
              <span className={`status-badge ${getStatusBadge(selectedWithdrawal.status).class}`}>
                {getStatusBadge(selectedWithdrawal.status).label}
              </span>
            </div>
            
            <div className="receipt-body">
              <div className="receipt-row">
                <span className="receipt-label">Contributeur</span>
                <span className="receipt-value">{selectedWithdrawal.prenom} {selectedWithdrawal.nom}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Email</span>
                <span className="receipt-value">{selectedWithdrawal.email}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Montant à verser</span>
                <span className="receipt-value gold">{formatMoney(selectedWithdrawal.amount)}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Crédits déduits</span>
                <span className="receipt-value">{selectedWithdrawal.credits} cr</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Opérateur</span>
                <span className="receipt-value">{selectedWithdrawal.paymentMethod}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Numéro de mobile</span>
                <span className="receipt-value" style={{ fontFamily: 'var(--mono)', color: 'var(--gold)' }}>{selectedWithdrawal.phoneNumber}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Date de demande</span>
                <span className="receipt-value">{formatDate(selectedWithdrawal.createdAt)}</span>
              </div>
              
              {selectedWithdrawal.rejectionReason && (
                <div className="receipt-row" style={{ marginTop: '0.5rem', background: 'var(--ruby-dim)', padding: '0.75rem', borderRadius: 'var(--r)', borderLeft: '3px solid var(--ruby)' }}>
                  <span className="receipt-label" style={{ color: 'var(--ruby)' }}>Motif du refus</span>
                  <span className="receipt-value" style={{ color: 'var(--ruby)' }}>{selectedWithdrawal.rejectionReason}</span>
                </div>
              )}

              {selectedWithdrawal.status === 'PENDING' && (
                <div style={{ marginTop: '1.5rem' }}>
                  <label className="admin-info-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Motif de refus (optionnel)</label>
                  <input
                    className="admin-input"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Solde insuffisant, erreur réseau..."
                  />
                </div>
              )}
            </div>

            <div className="receipt-footer">
              {selectedWithdrawal.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="admin-btn admin-btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => handleProcess(selectedWithdrawal.id, 'approve')}
                    disabled={processing}
                  >
                    <CheckCircle size={16} /> Approuver
                  </button>
                  <button
                    className="admin-btn admin-btn-reject"
                    style={{ flex: 1 }}
                    onClick={() => handleProcess(selectedWithdrawal.id, 'reject', rejectReason)}
                    disabled={processing}
                  >
                    <XCircle size={16} /> Refuser
                  </button>
                </div>
              )}
              <button
                className="admin-btn admin-btn-outline"
                style={{ width: '100%' }}
                onClick={() => { setShowModal(false); setSelectedWithdrawal(null); setRejectReason('') }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
