'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Download, FileText, Zap, CheckCircle, XCircle, AlertCircle, Clock, CreditCard, Smartphone, User, ChevronRight } from 'lucide-react'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { useToast } from '@/lib/hooks/useToast'
import { processWithdrawal, runBulkPayments } from './actions'
import './retraits.css'

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
      PENDING: { label: 'En attente', class: 'wsb-pending' },
      PROCESSING: { label: 'En traitement', class: 'wsb-processing' },
      COMPLETED: { label: 'Envoyé', class: 'wsb-sent' },
      FAILED: { label: 'Échoué', class: 'wsb-failed' }
    }
    return config[status] || { label: status, class: 'wsb-pending' }
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
    <div className="admin-retraits">
      <ToastContainer />
      
      {/* Top Bar */}
      <div className="admin-topbar">
        <div>
          <div className="tb-title">Retraits Gains — {cycle.current}</div>
          <div className="tb-sub">
            Cycle mensuel · {stats.pending} en attente · Clôture dans {cycle.daysLeft}j
          </div>
        </div>
        <div className="tb-actions">
          <button 
            className="admin-btn admin-btn-ghost"
            onClick={() => toast.info('Export', 'Export CSV généré…')}
          >
            <Download size={14} />
            Exporter
          </button>
          <button 
            className="admin-btn admin-btn-ghost"
            onClick={() => setShowModal(true)}
          >
            <FileText size={14} />
            Récap. du mois
          </button>
          <button 
            className="admin-btn admin-btn-gold"
            onClick={handleBulkPayment}
            disabled={selectedIds.length === 0 || processing}
          >
            <Zap size={14} />
            Lancer les versements ({selectedIds.length})
          </button>
        </div>
      </div>

      {/* KPI Strip & Content Wrapper */}
      <div className="admin-page-content">
        <div className="kpi-row">
          <div className="kpi kpi-pending">
            <div className="kpi-label">En attente</div>
            <div className="kpi-val gold">{stats.pending}</div>
            <div className="kpi-sub">{formatMoney(stats.pendingAmount)}</div>
          </div>
          <div className="kpi kpi-paid">
            <div className="kpi-label">Versements effectués</div>
            <div className="kpi-val">{stats.completed}</div>
            <div className="kpi-sub up">↑ +18 vs mois dernier</div>
          </div>
          <div className="kpi kpi-total">
            <div className="kpi-label">Total à verser</div>
            <div className="kpi-val gold">{formatMoney(stats.totalAmount)}</div>
            <div className="kpi-sub">Ariary ce cycle</div>
          </div>
          <div className="kpi kpi-avg">
            <div className="kpi-label">Versement moyen</div>
            <div className="kpi-val">{stats.completed > 0 ? formatMoney(Math.round(stats.completedAmount / stats.completed)) : '0 Ar'}</div>
            <div className="kpi-sub">Ar / contributeur</div>
          </div>
        </div>

        {/* Cycle Banner */}
        <div className="cycle-banner">
          <div>
            <div className="cb-label">Cycle actuel</div>
            <div className="cb-val">{cycle.current}</div>
          </div>
          <div className="cb-divider"></div>
          <div>
            <div className="cb-label">Période de référence</div>
            <div>{cycle.period}</div>
          </div>
          <div className="cb-divider"></div>
          <div>
            <div className="cb-label">Seuil minimum</div>
            <div>{cycle.threshold} crédits ≈ 25 000 Ar</div>
          </div>
          <div className="cb-divider"></div>
          <div>
            <div className="cb-label">Statut</div>
            <div className="cb-countdown">
              <span className="cb-dot"></span>
              En préparation — {cycle.daysLeft}j restants
            </div>
          </div>
          <button 
            className="btn-run" 
            onClick={handleBulkPayment}
            disabled={selectedIds.length === 0 || processing}
          >
            ⚡ Exécuter maintenant
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            En attente ({withdrawals.filter(w => w.status === 'PENDING' || w.status === 'PROCESSING').length})
          </button>
          <button 
            className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Envoyés ({withdrawals.filter(w => w.status === 'COMPLETED').length})
          </button>
          <button 
            className={`tab ${activeTab === 'failed' ? 'active' : ''}`}
            onClick={() => setActiveTab('failed')}
          >
            Échecs ({withdrawals.filter(w => w.status === 'FAILED').length})
          </button>
        </div>

        {/* Withdrawals Table */}
        <div className="w-table">
          <div className="wt-head">
            <input 
              type="checkbox" 
              checked={selectedIds.length === filteredWithdrawals.filter(w => w.status === 'PENDING').length && filteredWithdrawals.filter(w => w.status === 'PENDING').length > 0}
              onChange={handleSelectAll}
            />
            <span>Contributeur</span>
            <span>Montant</span>
            <span>Crédits</span>
            <span>Opérateur</span>
            <span>Statut</span>
            <span style={{ textAlign: 'right' }}>Action</span>
          </div>
          <div>
            {filteredWithdrawals.length === 0 ? (
              <div className="empty-state">
                <CreditCard size={48} />
                <div>Aucun retrait trouvé</div>
              </div>
            ) : (
              filteredWithdrawals.map((w) => (
                <div 
                  key={w.id} 
                  className="wt-row"
                >
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(w.id)}
                    onChange={() => handleSelect(w.id)}
                    disabled={w.status !== 'PENDING'}
                  />
                  <div className="w-contrib">
                    <div className="w-av">
                      {(w.prenom?.charAt(0) || 'U').toUpperCase()}
                    </div>
                    <div>
                      <div className="w-name">{w.prenom} {w.nom}</div>
                      <div className="w-tier">{w.email}</div>
                    </div>
                  </div>
                  <div className={`w-amount ${w.status === 'PENDING' ? 'pending' : ''}`}>
                    {formatMoney(w.amount)}
                  </div>
                  <div className="w-credits">
                    {w.credits} cr
                  </div>
                  <div className="w-mvola">
                    <Smartphone size={12} />
                    {w.paymentMethod}
                  </div>
                  <div>
                    <span className={`w-status-badge wsb-${w.status.toLowerCase()}`}>
                      {getStatusBadge(w.status).label}
                    </span>
                  </div>
                  <div className="w-actions">
                    {w.status === 'PENDING' && (
                      <>
                        <button 
                          className="wa-btn send" 
                          onClick={() => { setSelectedWithdrawal(w); handleProcess(w.id, 'send') }}
                        >
                          Envoyer
                        </button>
                        <button 
                          className="wa-btn" 
                          onClick={() => { setSelectedWithdrawal(w); setShowModal(true) }}
                        >
                          Détail
                        </button>
                      </>
                    )}
                    {w.status === 'PROCESSING' && (
                      <button 
                        className="wa-btn" 
                        onClick={() => { setSelectedWithdrawal(w); setShowModal(true) }}
                      >
                        Voir
                      </button>
                    )}
                    {w.status === 'FAILED' && (
                      <button 
                        className="wa-btn retry" 
                        onClick={() => { setSelectedWithdrawal(w); handleProcess(w.id, 'send') }}
                      >
                        Réessayer
                      </button>
                    )}
                    {w.status === 'COMPLETED' && (
                      <button 
                        className="wa-btn" 
                        onClick={() => { setSelectedWithdrawal(w); setShowModal(true) }}
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedWithdrawal && (
        <div 
          className="overlay open" 
          style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(4, 3, 2, 0.76)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          onClick={() => { setShowModal(false); setSelectedWithdrawal(null); setRejectReason('') }}
        >
          <div 
            className="receipt-card" 
            style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)', maxWidth: '420px', width: '100%', position: 'relative', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }}></div>
            <div className="receipt-header" style={{ background: 'var(--lift)', borderBottom: '1px solid var(--b1)', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: '0.25rem' }}>Détail du retrait</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {selectedWithdrawal.status === 'PENDING' ? '⏳ En attente' : selectedWithdrawal.status === 'COMPLETED' ? '✅ Envoyé' : '❌ Échoué'}
              </div>
            </div>
            <div className="receipt-body" style={{ padding: '1.1rem' }}>
              <div className="receipt-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.38rem 0', borderBottom: '1px solid var(--b3)', fontSize: '0.8rem' }}>
                <span className="rr-key" style={{ color: 'var(--text-3)' }}>Contributeur</span>
                <span className="rr-val" style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--text)' }}>{selectedWithdrawal.prenom} {selectedWithdrawal.nom}</span>
              </div>
              <div className="receipt-row">
                <span className="rr-key">Email</span>
                <span className="rr-val">{selectedWithdrawal.email}</span>
              </div>
              <div className="receipt-row">
                <span className="rr-key">Montant</span>
                <span className="rr-val gold" style={{ color: 'var(--gold)' }}>{formatMoney(selectedWithdrawal.amount)}</span>
              </div>
              <div className="receipt-row">
                <span className="rr-key">Crédits</span>
                <span className="rr-val">{selectedWithdrawal.credits} cr</span>
              </div>
              <div className="receipt-row">
                <span className="rr-key">Opérateur</span>
                <span className="rr-val">{selectedWithdrawal.paymentMethod}</span>
              </div>
              <div className="receipt-row">
                <span className="rr-key">Numéro</span>
                <span className="rr-val">{selectedWithdrawal.phoneNumber}</span>
              </div>
              <div className="receipt-row">
                <span className="rr-key">Date</span>
                <span className="rr-val">{formatDate(selectedWithdrawal.createdAt)}</span>
              </div>
              {selectedWithdrawal.rejectionReason && (
                <div className="receipt-row">
                  <span className="rr-key">Motif du refus</span>
                  <span className="rr-val" style={{ color: 'var(--ruby)' }}>{selectedWithdrawal.rejectionReason}</span>
                </div>
              )}
              
              {selectedWithdrawal.status === 'PENDING' && (
                <>
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: '0.5rem' }}>Motif du refus (optionnel)</label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Solde insuffisant, numéro invalide..."
                      style={{ width: '100%', padding: '0.5rem', background: 'var(--surface)', border: '1px solid var(--b1)', borderRadius: 'var(--r)', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button
                      onClick={() => handleProcess(selectedWithdrawal.id, 'approve')}
                      disabled={processing}
                      className="btn-gold"
                      style={{ flex: 1, fontFamily: 'var(--body)', fontSize: '0.75rem', fontWeight: 500, padding: '0.5rem', borderRadius: 'var(--r)', background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))', color: 'var(--void)', border: 'none', cursor: 'none', transition: 'all 0.2s', opacity: processing ? 0.5 : 1 }}
                    >
                      <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleProcess(selectedWithdrawal.id, 'reject', rejectReason)}
                      disabled={processing}
                      style={{ flex: 1, fontFamily: 'var(--body)', fontSize: '0.75rem', fontWeight: 500, padding: '0.5rem', borderRadius: 'var(--r)', background: 'var(--ruby-dim)', color: '#E06070', border: '1px solid var(--ruby-line)', cursor: 'none', transition: 'all 0.2s', opacity: processing ? 0.5 : 1 }}
                    >
                      <XCircle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      Refuser
                    </button>
                  </div>
                </>
              )}
              
              <button
                onClick={() => { setShowModal(false); setSelectedWithdrawal(null); setRejectReason('') }}
                style={{ width: '100%', marginTop: '1rem', fontFamily: 'var(--mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.45rem', borderRadius: 'var(--r)', background: 'transparent', border: '1px solid var(--b1)', color: 'var(--text-3)', cursor: 'none', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold-line)'; e.currentTarget.style.color = 'var(--gold)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--b1)'; e.currentTarget.style.color = 'var(--text-3)' }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .wsb-processing {
          background: rgba(107, 74, 155, 0.12);
          border-color: rgba(107, 74, 155, 0.3);
          color: #B8A0E0;
        }
      `}</style>
    </div>
  )
}
