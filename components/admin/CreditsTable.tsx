'use client'

import { useState } from 'react'
import { Clock, CheckCircle2, XCircle, CreditCard, ArrowRight, Phone, Hash, Wallet, User, ArrowLeft } from 'lucide-react'
import { AdminModal } from './AdminModal'

interface Transaction {
  id: string
  createdAt: string
  userId: string
  prenom: string | null
  nom: string | null
  email: string
  amount: number
  creditsCount: number
  phoneNumber: string | null
  userPhone: string | null
  senderCode: string | null
  paymentMethod: string
  status: string
  rejectionReason?: string | null
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date)
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' Ar'
}

function formatCreditsDisplay(credits: number) {
  return credits + ' cr' + (credits > 1 ? 's' : '')
}

export function CreditsTable({
  transactions,
  tab,
  onValidate,
  onReject
}: {
  transactions: Transaction[]
  tab: string
  onValidate: (id: string) => Promise<void>
  onReject: (id: string, reason: string) => Promise<void>
}) {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const handleValidate = async () => {
    if (!selectedTx) return
    setIsProcessing(true)
    try {
      await onValidate(selectedTx.id)
      setSelectedTx(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedTx || !rejectReason.trim()) return
    setIsProcessing(true)
    try {
      await onReject(selectedTx.id, rejectReason.trim())
      setSelectedTx(null)
      setRejectReason('')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Utilisateur</th>
              <th>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span>Paiement</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontWeight: 400, textTransform: 'none' }}>(Montant en Ar)</span>
                </div>
              </th>
              <th>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span>Crédits</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontWeight: 400, textTransform: 'none' }}>(À ajouter)</span>
                </div>
              </th>
              <th>Statut</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="admin-empty-state">
                    {tab === 'pending' && <Clock className="admin-empty-state-icon" size={48} />}
                    {tab === 'completed' && <CheckCircle2 className="admin-empty-state-icon" size={48} />}
                    {tab === 'rejected' && <XCircle className="admin-empty-state-icon" size={48} />}
                    <div className="admin-empty-state-text">
                      {tab === 'pending' && "Aucune transaction en attente"}
                      {tab === 'completed' && "Aucune transaction validée"}
                      {tab === 'rejected' && "Aucune transaction refusée"}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--text)' }}>
                      {formatDate(tx.createdAt)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="sb-av" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
                        {(tx.prenom?.charAt(0) || '')}{(tx.nom?.charAt(0) || '')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text)' }}>{tx.prenom} {tx.nom}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{tx.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--gold)', fontSize: '0.95rem' }}>
                        {formatMoney(tx.amount)}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontFamily: 'var(--mono)' }}>
                        {tx.paymentMethod}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--sage)', fontWeight: 600 }}>
                        +{tx.creditsCount} cr
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-4)' }}>
                        {tx.creditsCount} crédits
                      </span>
                    </div>
                  </td>
                  <td>
                    {tab === 'pending' && <span className="status-badge status-amber"><Clock size={12}/> En attente</span>}
                    {tab === 'completed' && <span className="status-badge status-emerald"><CheckCircle2 size={12}/> Validée</span>}
                    {tab === 'rejected' && <span className="status-badge status-ruby"><XCircle size={12}/> Refusée</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="admin-btn admin-btn-outline"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                    >
                      Gérer
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de gestion */}
      <AdminModal
        isOpen={!!selectedTx}
        onClose={() => { setSelectedTx(null); setRejectReason('') }}
        title="Détails de la transaction"
        subtitle={selectedTx ? `Demande de recharge #${selectedTx.id.slice(0, 8)}` : ''}
        size="lg"
        actions={selectedTx && tab === 'pending' ? (
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'flex-end' }}>
            <button
              onClick={handleReject}
              disabled={isProcessing || !rejectReason.trim()}
              className="admin-btn admin-btn-danger"
            >
              <XCircle size={16} />
              Refuser
            </button>
            <button
              onClick={handleValidate}
              disabled={isProcessing}
              className="admin-btn admin-btn-success"
            >
              <CheckCircle2 size={16} />
              Valider
            </button>
          </div>
        ) : undefined}
      >
        {selectedTx && (
          <div className="tx-detail-grid">
            {/* Montant et Crédits - Section claire pour éviter la confusion */}
            <div className="tx-detail-section">
              <h4 className="tx-detail-title">
                <Wallet size={16} />
                Paiement Mobile Money
              </h4>
              <div className="tx-detail-highlight" style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-line)', borderRadius: 'var(--r)', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                      Montant payé
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--mono)' }}>
                      {formatMoney(selectedTx.amount)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-4)', marginTop: '0.25rem' }}>
                      Montant réel envoyé par l'utilisateur
                    </div>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--gold-line)', paddingLeft: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                      Crédits à ajouter
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--sage)', fontFamily: 'var(--mono)' }}>
                      +{selectedTx.creditsCount} cr
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-4)', marginTop: '0.25rem' }}>
                      Solde après validation
                    </div>
                  </div>
                </div>
              </div>
              <div className="tx-detail-grid-2">
                <div className="tx-detail-item">
                  <span className="tx-detail-label">Opérateur</span>
                  <span className="tx-detail-value">{selectedTx.paymentMethod || 'Mobile Money'}</span>
                </div>
                <div className="tx-detail-item">
                  <span className="tx-detail-label">Numéro</span>
                  <span className="tx-detail-value tx-phone">
                    <Phone size={14} />
                    {selectedTx.phoneNumber || selectedTx.userPhone || 'Non fourni'}
                  </span>
                </div>
              </div>
              
              {/* Code de confirmation - Toujours affiché */}
              <div className="tx-detail-item" style={{ marginTop: '1rem' }}>
                <span className="tx-detail-label">Code de confirmation</span>
                <span className="tx-detail-value tx-code">
                  <Hash size={14} />
                  {selectedTx.senderCode || 'Non renseigné'}
                </span>
                {selectedTx.senderCode && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-4)', marginTop: '0.25rem', display: 'block' }}>
                    ✓ Code fourni par l'utilisateur
                  </span>
                )}
              </div>
            </div>

            {/* Utilisateur */}
            <div className="tx-detail-section">
              <h4 className="tx-detail-title">
                <User size={16} />
                Informations utilisateur
              </h4>
              <div className="tx-detail-grid-2">
                <div className="tx-detail-item">
                  <span className="tx-detail-label">Nom complet</span>
                  <span className="tx-detail-value">{selectedTx.prenom} {selectedTx.nom}</span>
                </div>
                <div className="tx-detail-item">
                  <span className="tx-detail-label">Email</span>
                  <span className="tx-detail-value" style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>{selectedTx.email}</span>
                </div>
              </div>
              <div className="tx-detail-item" style={{ marginTop: '1rem' }}>
                <span className="tx-detail-label">Date de la demande</span>
                <span className="tx-detail-value" style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>{formatDate(selectedTx.createdAt)}</span>
              </div>
            </div>

            {/* Statut */}
            <div className="tx-detail-section tx-detail-status">
              <h4 className="tx-detail-title">
                {selectedTx.status === 'PENDING' && <><Clock size={16} /> En attente de validation</>}
                {selectedTx.status === 'COMPLETED' && <><CheckCircle2 size={16} /> Transaction validée</>}
                {selectedTx.status === 'REJECTED' && <><XCircle size={16} /> Transaction refusée</>}
              </h4>
              {selectedTx.rejectionReason && (
                <div className="tx-rejection-reason">
                  <span className="tx-detail-label">Motif du refus</span>
                  <p>{selectedTx.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Formulaire de refus (uniquement si en attente) */}
            {tab === 'pending' && (
              <div className="tx-detail-section tx-reject-form">
                <h4 className="tx-detail-title">
                  <XCircle size={16} />
                  Refuser cette demande
                </h4>
                <div className="tx-reject-input">
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Motif du refus (obligatoire pour refuser)"
                    className="admin-input"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </>
  )
}