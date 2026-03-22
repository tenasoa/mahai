'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Wallet, History, TrendingUp, Clock, CheckCircle, AlertCircle, Smartphone, CreditCard, Send, Loader2 } from 'lucide-react'
import { NumberInput } from '@/components/ui/NumberInput'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { useToast } from '@/lib/hooks/useToast'

const MOBILE_MONEY_OPERATORS = [
  { id: 'MVOLA', name: 'MVola', color: '#00FF88', prefix: '034', description: 'Yas Madagascar' },
  { id: 'ORANGE', name: 'Orange Money', color: '#FF7900', prefix: '032', description: 'Orange Madagascar' },
  { id: 'AIRTEL', name: 'Airtel Money', color: '#FF0000', prefix: '033', description: 'Airtel Madagascar' },
]

interface WithdrawalsClientProps {
  user: { prenom: string; nom: string; role: string }
  withdrawals: any[]
  stats: { totalWithdrawn: number; pending: number; thisMonth: number; averageWithdrawal: number }
  balance: { available: number; pending: number }
}

export default function WithdrawalsClient({ user, withdrawals, stats, balance }: WithdrawalsClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed' | 'failed'>('all')
  const [showModal, setShowModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedOperator, setSelectedOperator] = useState('MVOLA')
  const [processing, setProcessing] = useState(false)
  
  const toast = useToast()

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const limited = numbers.slice(0, 10)
    if (limited.length <= 3) return limited
    if (limited.length <= 5) return `${limited.slice(0, 3)} ${limited.slice(3)}`
    if (limited.length <= 8) return `${limited.slice(0, 3)} ${limited.slice(3, 5)} ${limited.slice(5)}`
    return `${limited.slice(0, 3)} ${limited.slice(3, 5)} ${limited.slice(5, 8)} ${limited.slice(8, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value))
  }

  const filteredWithdrawals = withdrawals.filter(w => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return w.status === 'PENDING' || w.status === 'PROCESSING'
    if (activeTab === 'completed') return w.status === 'COMPLETED'
    if (activeTab === 'failed') return w.status === 'FAILED'
    return true
  })

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount, 10)
    if (!amount || amount < 5000) {
      toast.error('Montant invalide', 'Le montant minimum est de 5 000 Ar')
      return
    }

    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error('Numéro invalide', 'Veuillez entrer un numéro valide (10 chiffres)')
      return
    }

    const operator = MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator)
    if (!phoneNumber.startsWith(operator?.prefix || '')) {
      toast.error('Numéro invalide', `Le numéro doit commencer par ${operator?.prefix} pour ${operator?.name}`)
      return
    }

    setProcessing(true)
    try {
      const { requestWithdrawal } = await import('./actions')
      const result = await requestWithdrawal(amount, phoneNumber, selectedOperator)
      
      if (result.success) {
        toast.success('Demande envoyée', `Votre demande de retrait de ${amount.toLocaleString('fr-FR')} Ar a été enregistrée. Validation sous 24-48h.`)
        setShowModal(false)
        setWithdrawAmount('')
        setPhoneNumber('')
        setTimeout(() => router.refresh(), 2000)
      } else {
        toast.error('Erreur', result.error || 'Erreur lors de la demande')
      }
    } catch (error) {
      toast.error('Erreur', 'Une erreur est survenue lors de la demande de retrait')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; class: string; icon: any }> = {
      PENDING: { label: 'En attente', class: 'pending', icon: Clock },
      PROCESSING: { label: 'En traitement', class: 'processing', icon: AlertCircle },
      COMPLETED: { label: 'Envoyé', class: 'sent', icon: CheckCircle },
      FAILED: { label: 'Échoué', class: 'failed', icon: AlertCircle }
    }
    return config[status] || { label: status, class: 'pending', icon: Clock }
  }

  return (
    <>
      <ToastContainer />
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-title">
          Retraits <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Gains</em>
        </div>
        <div className="topbar-right">
          <button 
            className="btn-payout"
            onClick={() => setShowModal(true)}
          >
            <Send size={14} />
            Demander un retrait
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="page-content">
        {/* KPI Strip */}
        <div className="kpi-strip">
          <div className="kpi">
            <div className="kpi-label">Solde disponible</div>
            <div className="kpi-val" style={{ fontSize: '1.8rem' }}>{balance.available.toLocaleString('fr-FR')} <span style={{ fontSize: '0.9rem', color: 'var(--gold)' }}>Ar</span></div>
            <div className="kpi-trend trend-up">Retrait min: 5 000 Ar</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">En attente</div>
            <div className="kpi-val" style={{ fontSize: '1.8rem' }}>{balance.pending.toLocaleString('fr-FR')} <span style={{ fontSize: '0.9rem', color: 'var(--amber)' }}>Ar</span></div>
            <div className="kpi-trend" style={{ color: 'var(--amber)' }}><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />Traitement</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Total retiré</div>
            <div className="kpi-val" style={{ fontSize: '1.8rem' }}>{stats.totalWithdrawn.toLocaleString('fr-FR')} <span style={{ fontSize: '0.9rem', color: 'var(--gold-lo)' }}>Ar</span></div>
            <div className="kpi-trend trend-flat">→ Cumul</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Ce mois</div>
            <div className="kpi-val" style={{ fontSize: '1.8rem' }}>{stats.thisMonth.toLocaleString('fr-FR')} <span style={{ fontSize: '0.9rem', color: 'var(--gold-lo)' }}>Ar</span></div>
            <div className="kpi-trend trend-up"><TrendingUp size={12} style={{ display: 'inline', marginRight: '4px' }} />Revenus</div>
          </div>
        </div>

        {/* Cycle Banner */}
        <div className="cycle-banner">
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.57rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-3)', marginBottom: '0.25rem' }}>Prochain cycle de paiement</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', color: 'var(--gold)', letterSpacing: '-0.03em' }}>Mardi & Vendredi</div>
          </div>
          <div style={{ width: '1px', height: '36px', background: 'var(--b1)', flexShrink: '0' }}></div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', animation: 'blink 1.2s ease-in-out infinite' }}></span>
            Traitement sous 24-48h
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>Tous</button>
          <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>En attente</button>
          <button className={`tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>Complétés</button>
          <button className={`tab ${activeTab === 'failed' ? 'active' : ''}`} onClick={() => setActiveTab('failed')}>Échoués</button>
        </div>

        {/* Withdrawals Table */}
        <div className="w-table">
          <div className="wt-head">
            <div>Date</div>
            <div>Montant</div>
            <div>Frais</div>
            <div>Net</div>
            <div style={{ textAlign: 'right' }}>Statut</div>
          </div>
          <div>
            {filteredWithdrawals.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>
                <Wallet size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <div>Aucun retrait trouvé</div>
              </div>
            ) : (
              filteredWithdrawals.map((w) => {
                const statusConfig = getStatusBadge(w.status)
                const fee = w.amount * 0.01
                const net = w.amount - fee
                return (
                  <div key={w.id} className="wt-row">
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--text)' }}>
                      {new Date(w.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', color: 'var(--gold)', letterSpacing: '-0.03em' }}>
                      {w.amount.toLocaleString('fr-FR')} <span style={{ fontSize: '0.8rem', color: 'var(--gold-lo)' }}>Ar</span>
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-3)' }}>
                      {fee.toLocaleString('fr-FR')} Ar
                    </div>
                    <div style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', color: 'var(--text)', letterSpacing: '-0.03em' }}>
                      {net.toLocaleString('fr-FR')} <span style={{ fontSize: '0.8rem', color: 'var(--text-4)' }}>Ar</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="w-status-badge" style={{ 
                        fontFamily: 'var(--mono)', fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.08em', 
                        padding: '0.14rem 0.52rem', borderRadius: '2px', border: '1px solid',
                        background: statusConfig.class === 'pending' ? 'var(--amber-dim)' : statusConfig.class === 'sent' ? 'var(--sage-dim)' : 'var(--ruby-dim)',
                        borderColor: statusConfig.class === 'pending' ? 'var(--amber-line)' : statusConfig.class === 'sent' ? 'var(--sage-line)' : 'var(--ruby-line)',
                        color: statusConfig.class === 'pending' ? 'var(--amber)' : statusConfig.class === 'sent' ? '#8ECAAC' : '#E06070'
                      }}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="receipt-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }}></div>
            <div className="receipt-header">
              <div style={{ fontFamily: 'var(--display)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: '0.25rem' }}>Demander un retrait</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <CreditCard size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                Mobile Money - Madagascar
              </div>
            </div>
            <div className="receipt-body">
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: '0.5rem' }}>Opérateur</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                  {MOBILE_MONEY_OPERATORS.map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => { setSelectedOperator(op.id); setPhoneNumber('') }}
                      style={{
                        padding: '0.5rem',
                        background: selectedOperator === op.id ? op.color + '20' : 'var(--surface)',
                        border: `1px solid ${selectedOperator === op.id ? op.color : 'var(--b1)'}`,
                        borderRadius: 'var(--r)',
                        color: selectedOperator === op.id ? op.color : 'var(--text-3)',
                        fontFamily: 'var(--mono)', fontSize: '0.6rem', textTransform: 'uppercase',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {op.name}
                    </button>
                  ))}
                </div>
                <NumberInput label="Montant (Ar)" value={withdrawAmount} onChange={setWithdrawAmount} min={5000} step={5000} placeholder="Min: 5 000 Ar" disabled={processing} />
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-4)', marginTop: '0.35rem' }}>Frais: 1% • Net reçu: 99%</div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: '0.5rem' }}>
                  Numéro {MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator)?.name}
                </label>
                <div style={{ position: 'relative' }}>
                  <input type="tel" value={phoneNumber} onChange={handlePhoneChange}
                    placeholder={`${MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator)?.prefix} XX XXX XX`}
                    className="admin-input"
                    style={{ width: '100%', paddingRight: '2.5rem' }}
                  />
                  <Smartphone size={18} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: 'var(--text-4)', marginTop: '0.35rem' }}>
                  Doit commencer par {MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator)?.prefix}
                </div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--gold-dim)', border: '1px solid var(--gold-line)', borderRadius: 'var(--r)', marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: '0.35rem' }}>Solde disponible</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', color: 'var(--gold)', letterSpacing: '-0.03em' }}>{balance.available.toLocaleString('fr-FR')} <span style={{ fontSize: '0.9rem' }}>Ar</span></div>
              </div>
              <div className="modal-cta-row">
                <button onClick={handleWithdraw} disabled={processing} className="btn-gold" style={{ flex: 1, opacity: processing ? 0.5 : 1 }}>
                  {processing ? <><Loader2 size={16} className="animate-spin" /> Traitement...</> : 'Confirmer'}
                </button>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: '0.6rem', textTransform: 'uppercase', padding: '0.45rem', borderRadius: 'var(--r)', background: 'transparent', border: '1px solid var(--b1)', color: 'var(--text-3)' }}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}