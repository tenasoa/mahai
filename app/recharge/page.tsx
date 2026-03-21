'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTransactionsRealtime } from '@/lib/hooks/useTransactionsRealtime'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { RechargePageSkeleton } from '@/components/ui/PageSkeletons'
import {
  Zap, Smartphone, CreditCard, CheckCircle, ArrowRight,
  Info, Shield, Clock, TrendingUp, Gift, Star, Trophy,
  X, AlertCircle, Copy, Send
} from 'lucide-react'
import { rechargeCreditsAction, getUserTransactionsAction } from '@/actions/profile'
import './recharge.css'

// Packs de crédits
const CREDIT_PACKS = [
  { credits: 50, price: 2500, priceEur: 0.50, popular: false },
  { credits: 150, price: 7500, priceEur: 1.50, popular: true },
  { credits: 300, price: 15000, priceEur: 3.00, popular: false, bestValue: true },
]

// Opérateurs Mobile Money avec leurs préfixes et numéros admin
const MOBILE_MONEY_OPERATORS = [
  { 
    id: 'MVOLA', 
    name: 'MVola', 
    color: '#E84517', 
    prefix: '034',
    adminNumber: '034 77 130 85',
    ussdCode: '#111*1#2*0347713085*MONTANT*2*0000#',
    description: 'Yas Madagascar'
  },
  { 
    id: 'ORANGE', 
    name: 'Orange Money', 
    color: '#FF7900', 
    prefix: '032',
    adminNumber: '032 17 560 02',
    ussdCode: '#144#1*1*0321756002*0321756002*MONTANT*2#',
    description: 'Orange Madagascar'
  },
  { 
    id: 'AIRTEL', 
    name: 'Airtel Money', 
    color: '#FF0000', 
    prefix: '033',
    adminNumber: '033 12 345 67',
    ussdCode: 'Code USSD à définir',
    description: 'Airtel Madagascar'
  },
]

export default function RechargePage() {
  const router = useRouter()
  const { userId, appUser, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'historique' | 'recharger'>('recharger')
  const [selectedPack, setSelectedPack] = useState(CREDIT_PACKS[1]) // 150 crédits par défaut
  const [selectedOperator, setSelectedOperator] = useState('MVOLA')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [processing, setProcessing] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // États pour le modal de paiement manuel
  const [showManualModal, setShowManualModal] = useState(false)
  const [transferCode, setTransferCode] = useState('')

  // Hook Realtime pour les transactions
  const { newTransactionCount, lastTransaction, resetCount } = useTransactionsRealtime({
    userId: userId ?? undefined,
    enabled: true
  })

  // Charger les transactions
  const loadTransactions = async () => {
    if (transactionsLoading) return
    setTransactionsLoading(true)
    try {
      const result = await getUserTransactionsAction()
      if (result.success) {
        setTransactions(result.data || [])
        // Réinitialiser le compteur de nouvelles transactions après chargement
        resetCount()
      }
    } catch (error) {
      console.error('Erreur chargement transactions:', error)
    } finally {
      setTransactionsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      if (!userId) {
        router.push('/auth/login')
      } else {
        setLoading(false)
        // Charger les transactions si on est sur l'onglet historique
        if (activeTab === 'historique') {
          loadTransactions()
        }
      }
    }
  }, [userId, authLoading, router, activeTab])

  useEffect(() => {
    if (activeTab === 'historique' && transactions.length === 0 && !transactionsLoading) {
      loadTransactions()
    }
  }, [activeTab])

  // Recharger les transactions quand une nouvelle arrive en temps réel
  useEffect(() => {
    if (newTransactionCount > 0 && lastTransaction) {
      // Recharger les transactions pour afficher la nouvelle
      loadTransactions()
      
      // Afficher une notification
      const txType = lastTransaction.type === 'RECHARGE' ? 'Recharge' : lastTransaction.type === 'ACHAT' ? 'Achat' : 'Transaction'
      const status = lastTransaction.status === 'PENDING' ? 'en attente de validation' : lastTransaction.status === 'COMPLETED' ? 'validée' : 'refusée'
      
      setNotification({
        type: lastTransaction.status === 'COMPLETED' ? 'success' : 'error',
        message: `${txType} de ${lastTransaction.creditsCount || Math.abs(lastTransaction.amount)} crédits ${status}.`
      })
      
      // Auto-dismiss après 5 secondes
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    }
  }, [newTransactionCount])

  // Grouper les transactions par mois
  const groupTransactionsByMonth = (txs: any[]) => {
    const groups: Record<string, any[]> = {}
    txs.forEach(tx => {
      const date = new Date(tx.createdAt)
      const monthKey = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      if (!groups[monthKey]) groups[monthKey] = []
      groups[monthKey].push(tx)
    })
    return groups
  }

  // Transaction par pack - Mode Manuel MVP
  const handleRecharge = async () => {
    if (!phoneNumber.trim()) {
      setNotification({ type: 'error', message: 'Veuillez entrer votre numéro de téléphone' })
      return
    }

    // Valider le numéro selon l'opérateur
    const validation = validatePhoneNumber()
    if (!validation.valid) {
      setNotification({ type: 'error', message: validation.message || '' })
      return
    }

    // Ouvrir le modal d'instructions de paiement manuel
    setShowManualModal(true)
  }

  const handleFinalSubmit = async () => {
    if (!transferCode.trim()) {
      setNotification({ type: 'error', message: 'Veuillez entrer le code de transfert reçu' })
      return
    }

    // Bloquer les achats à 0 Ar
    if (selectedPack.price <= 0) {
      setNotification({ type: 'error', message: 'Le montant de la recharge doit être supérieur à 0 Ar' })
      return
    }

    // Bloquer les crédits à 0
    if (selectedPack.credits <= 0) {
      setNotification({ type: 'error', message: 'Le nombre de crédits doit être supérieur à 0' })
      return
    }

    setProcessing(true)
    try {
      const result = await rechargeCreditsAction({
        packCredits: selectedPack.credits,
        packPrice: selectedPack.price,
        operator: selectedOperator,
        phoneNumber: phoneNumber,
        transferCode: transferCode, // On passe le code de transfert
        status: 'PENDING' // Indique que l'admin doit valider
      })

      if (result.success) {
        setNotification({
          type: 'success',
          message: `Votre demande d'achat de ${selectedPack.credits} crédits a été enregistrée. L'administrateur validera votre transfert sous 12h.`
        })
        setShowManualModal(false)
        setTransferCode('')
        // Recharger les transactions
        await loadTransactions()
        // Retour à l'historique
        setActiveTab('historique')
      } else {
        setNotification({ type: 'error', message: result.error || 'Erreur lors de la validation' })
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Erreur serveur' })
    } finally {
      setProcessing(false)
    }
  }

  // Formater et valider le numéro de téléphone (10 chiffres avec préfixe opérateur)
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    
    // Limiter à 10 chiffres
    const limited = numbers.slice(0, 10)
    
    if (limited.length <= 3) return limited
    if (limited.length <= 5) return `${limited.slice(0, 3)} ${limited.slice(3)}`
    if (limited.length <= 8) return `${limited.slice(0, 3)} ${limited.slice(3, 5)} ${limited.slice(5)}`
    return `${limited.slice(0, 3)} ${limited.slice(3, 5)} ${limited.slice(5, 8)} ${limited.slice(8, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  // Valider le numéro selon l'opérateur
  const validatePhoneNumber = () => {
    const numbers = phoneNumber.replace(/\D/g, '')
    const operator = MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator)
    
    if (numbers.length !== 10) {
      return { valid: false, message: 'Le numéro doit contenir exactement 10 chiffres' }
    }
    
    if (!numbers.startsWith(operator?.prefix || '')) {
      return { 
        valid: false, 
        message: `Le numéro doit commencer par ${operator?.prefix} pour ${operator?.name}` 
      }
    }
    
    return { valid: true }
  }

  if (loading || authLoading) {
    return <RechargePageSkeleton />
  }

  const transactionGroups = groupTransactionsByMonth(transactions)

  return (
    <div className="credits-page">
      <LuxuryCursor />
      <LuxuryNavbar />

      {/* HERO */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-label">{appUser?.prenom || 'Utilisateur'}</div>
          <h1 className="hero-title">Mes <em>crédits</em></h1>
          <div className="balance-row">
            <div className="balance-card luxury-card card-noise">
              <div className="balance-label">Solde disponible</div>
              <div className="balance-amount serif">
                {appUser?.credits ?? 0}
                <span className="balance-unit">crédits</span>
              </div>
              <div className="balance-ariary">
                ≈ {(appUser?.credits ?? 0) * 50} Ariary
              </div>
            </div>
            <div className="balance-mini-stats">
              <div className="bms">
                <div className="bms-lbl">Reçus ce mois</div>
                <div className="bms-val cr-in">
                  {transactions
                    .filter(tx => tx.type === 'RECHARGE' && new Date(tx.createdAt).getMonth() === new Date().getMonth())
                    .reduce((sum, tx) => sum + tx.amount, 0)}
                </div>
              </div>
              <div className="bms">
                <div className="bms-lbl">Dépensés ce mois</div>
                <div className="bms-val cr-out">
                  {transactions
                    .filter(tx => tx.type === 'ACHAT' && new Date(tx.createdAt).getMonth() === new Date().getMonth())
                    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)}
                </div>
              </div>
            </div>
            <button 
              className="btn-recharge" 
              onClick={() => setActiveTab('recharger')}
            >
              <Zap size={16} />
              Recharger via Mobile Money
            </button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        {/* LEFT */}
        <div>
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'historique' ? 'active' : ''}`}
              onClick={() => setActiveTab('historique')}
            >
              Historique
              {newTransactionCount > 0 && (
                <span className="tab-badge">{newTransactionCount}</span>
              )}
            </button>
            <button
              className={`tab ${activeTab === 'recharger' ? 'active' : ''}`}
              onClick={() => setActiveTab('recharger')}
            >
              Recharger
            </button>
          </div>

          {/* TRANSACTIONS */}
          {activeTab === 'historique' && (
            <div className="tab-panel active">
              {transactionsLoading ? (
                <div className="transactions-loading">Chargement de vos transactions...</div>
              ) : transactions.length > 0 ? (
                Object.entries(transactionGroups).map(([month, txs]) => (
                  <div key={month}>
                    <div className="month-label">{month}</div>
                    {txs.map((tx) => (
                      <div key={tx.id} className="tx-row card-noise">
                        <div className={`tx-icon ${tx.type === 'ACHAT' ? 'out' : tx.type === 'RECHARGE' ? 'in' : 'bonus'}`}>
                          {tx.type === 'ACHAT' ? '🔓' : tx.type === 'RECHARGE' ? '💳' : '🎁'}
                        </div>
                        <div className="tx-body">
                          <div className="tx-title serif">
                            {tx.type === 'ACHAT' ? 'Déblocage — ' : tx.type === 'RECHARGE' ? 'Recharge Mobile Money — ' : ''}
                            {tx.description || `${tx.type} de crédits`}
                          </div>
                          <div className="tx-meta mono">
                            {new Date(tx.createdAt).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {tx.id && ` · Réf. ${tx.id.slice(0, 8).toUpperCase()}`}
                          </div>
                        </div>
                        <div>
                          <div className={`tx-amount mono ${tx.type === 'RECHARGE' ? 'positive' : 'negative'}`}>
                            {tx.type === 'RECHARGE' 
                              ? `+${tx.creditsCount || tx.amount} cr`
                              : `${tx.amount >= 0 ? '+' : ''}${tx.amount} cr`
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="transactions-empty">
                  <p>Aucune transaction enregistrée pour le moment.</p>
                  <span className="text-xs text-text-4">Vos futurs achats et recharges apparaîtront ici.</span>
                </div>
              )}
            </div>
          )}

          {/* RECHARGER */}
          {activeTab === 'recharger' && (
            <div className="tab-panel active">
              <div className="recharge-info">
                <Smartphone size={16} />
                <span>Paiement sécurisé via Mobile Money · Crédité instantanément</span>
              </div>

              {/* Packs */}
              <div className="packs-grid">
                {CREDIT_PACKS.map((pack) => (
                  <div 
                    key={pack.credits}
                    className={`pack-card card-noise ${selectedPack.credits === pack.credits ? 'selected' : ''}`}
                    onClick={() => setSelectedPack(pack)}
                  >
                    {pack.popular && <div className="pack-popular">Populaire</div>}
                    {pack.bestValue && <div className="pack-popular" style={{ background: 'var(--sage)' }}>Best Value</div>}
                    <div className="pack-cr serif">{pack.credits}</div>
                    <div className="pack-lbl">crédits</div>
                    <div className="pack-price serif">{pack.price.toLocaleString('fr-FR')} Ar</div>
                    <div className="pack-ariary">≈ {pack.priceEur} €</div>
                    <button className="btn-buy-pack">
                      {selectedPack.credits === pack.credits ? '✓ Sélectionné' : 'Sélectionner'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Operator & Phone */}
              <div className="recharge-form">
                <div className="form-group">
                  <label className="form-label">Opérateur Mobile Money</label>
                  <div className="operator-grid">
                    {MOBILE_MONEY_OPERATORS.map((op) => (
                      <button
                        key={op.id}
                        className={`operator-card card-noise ${selectedOperator === op.id ? 'selected' : ''}`}
                        onClick={() => setSelectedOperator(op.id)}
                      >
                        <div 
                          className="operator-dot" 
                          style={{ background: op.color }}
                        />
                        <span>{op.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Numéro de téléphone</label>
                  <div className="mvola-input-wrap">
                    <div className="mvola-flag">
                      <Smartphone size={14} />
                      <span>{MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator)?.name}</span>
                    </div>
                    <input
                      type="tel"
                      className="form-input mvola-input"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="034 XX XXX XX"
                      maxLength={14}
                      autoComplete="tel"
                    />
                  </div>
                  <div className="form-hint">
                    <Info size={12} />
                    <span>Le numéro doit être associé à votre compte <strong>{MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator)?.name}</strong></span>
                  </div>
                </div>

                {/* How it works */}
                <div className="how-it-works card-noise">
                  <Info size={20} />
                  <div>
                    <div className="hiw-title serif">Processus d'achat</div>
                    <div className="hiw-steps">
                      <span>1️⃣ Choisissez votre pack et entrez votre numéro</span>
                      <span>2️⃣ Transférez le montant au numéro administrateur</span>
                      <span>3️⃣ Saisissez le code de transfert reçu par SMS</span>
                      <span>4️⃣ Votre compte sera crédité après vérification (12h)</span>
                    </div>
                  </div>
                </div>

                {/* Summary & Pay */}
                <div className="recharge-summary card-noise">
                  <div className="rs-row">
                    <span>Pack sélectionné</span>
                    <span className="rs-val">{selectedPack.credits} crédits</span>
                  </div>
                  <div className="rs-row">
                    <span>Prix à payer</span>
                    <span className="rs-price">{selectedPack.price.toLocaleString('fr-FR')} Ar</span>
                  </div>
                  <div className="rs-row">
                    <span>Opérateur</span>
                    <span className="rs-val">{MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator)?.name}</span>
                  </div>
                  <div className="rs-row">
                    <span>Numéro</span>
                    <span className="rs-val">{phoneNumber || '—'}</span>
                  </div>
                </div>

                <button 
                  className="btn-pay"
                  onClick={handleRecharge}
                  disabled={processing || !phoneNumber.trim()}
                >
                  {processing ? (
                    'Traitement en cours...'
                  ) : (
                    <>
                      Continuer le paiement ({selectedPack.price.toLocaleString('fr-FR')} Ar)
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="trust-badges">
                  <div className="trust-item">
                    <Shield size={14} />
                    <span>Paiement 100% sécurisé</span>
                  </div>
                  <div className="trust-item">
                    <Clock size={14} />
                    <span>Validation manuelle sous 12h</span>
                  </div>
                  <div className="trust-item">
                    <CheckCircle size={14} />
                    <span>Transaction vérifiée par admin</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
          <aside>
          <div className="panel luxury-card card-noise">
            <div className="p-head">
              <span className="p-label">
                <div className="p-dot" />
                Résumé du compte
              </span>
            </div>
            <div className="p-body">
              <div className="info-row">
                <span className="ir-key">Solde actuel</span>
                <span className="ir-val gold serif">{appUser?.credits ?? 0} cr</span>
              </div>
              <div className="info-row">
                <span className="ir-key">Total rechargé</span>
                <span className="ir-val">
                  {transactions.filter(tx => tx.type === 'RECHARGE').reduce((sum, tx) => sum + tx.amount, 0)} cr
                </span>
              </div>
              <div className="info-row">
                <span className="ir-key">Total dépensé</span>
                <span className="ir-val">
                  {transactions.filter(tx => tx.type === 'ACHAT').reduce((sum, tx) => sum + Math.abs(tx.amount), 0)} cr
                </span>
              </div>
              <div className="info-row">
                <span className="ir-key">Bonus obtenus</span>
                <span className="ir-val gold">
                  +{transactions.filter(tx => tx.type === 'BONUS').reduce((sum, tx) => sum + tx.amount, 0)} cr
                </span>
              </div>
            </div>
          </div>

          <div className="panel luxury-card card-noise">
            <div className="p-head">
              <span className="p-label">
                <div className="p-dot" />
                Mobile Money lié
              </span>
            </div>
            <div className="p-body">
              <div className="mm-info">
                <div className="mm-icon">
                  <Smartphone size={18} />
                </div>
                <div className="mm-details">
                  <div className="mm-number mono">
                    {appUser?.phone || 'Non renseigné'}
                  </div>
                  <div className="mm-status">
                    {appUser?.defaultOperator || 'MVOLA'} · Actif
                  </div>
                </div>
              </div>
              <button 
                className="btn-modify"
                onClick={() => router.push('/profil')}
              >
                Modifier dans le profil
              </button>
            </div>
          </div>

          <div className="panel luxury-card card-noise">
            <div className="p-head">
              <span className="p-label">
                <div className="p-dot" />
                Gagner des crédits
              </span>
            </div>
            <div className="p-body">
              <div className="earn-item">
                <Gift size={16} />
                <span>Parrainez un ami → <strong className="gold">+20 cr</strong></span>
              </div>
              <div className="earn-item">
                <Star size={16} />
                <span>Laissez un avis → <strong className="gold">+2 cr</strong></span>
              </div>
              <div className="earn-item">
                <Trophy size={16} />
                <span>Défi mensuel → jusqu'à <strong className="gold">+50 cr</strong></span>
              </div>
              <button className="btn-earn-more" onClick={() => router.push('/parrainage')}>
                Voir tous les moyens →
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="toast-container">
          <div className={`toast ${notification.type}`}>
            <div className="toast-icon">
              {notification.type === 'success' ? '✓' : '✕'}
            </div>
            <div className="toast-content">
              <div className="toast-title">
                {notification.type === 'success' ? 'Succès' : 'Erreur'}
              </div>
              <div className="toast-msg">{notification.message}</div>
            </div>
            <button 
              className="toast-close"
              onClick={() => setNotification(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* MANUAL PAYMENT MODAL */}
      {showManualModal && (
        <div className="modal-overlay" onClick={() => setShowManualModal(false)}>
          <div className="modal-content card-noise" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title serif">Instructions de paiement</h2>
              <button className="modal-close" onClick={() => setShowManualModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {/* ÉTAPE 1 */}
              <div className="instruction-box">
                <div className="step-number">01</div>
                <div className="hiw-title">Effectuez le transfert</div>
                <p className="text-xs text-text-muted mb-4">
                  Envoyez exactement <strong className="gold">{selectedPack.price.toLocaleString('fr-FR')} Ar</strong> depuis votre téléphone vers le numéro administrateur :
                </p>
                
                <div className="admin-number-card">
                  <div 
                    className="operator-badge"
                    style={{ 
                      background: `${MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator)?.color}20`,
                      borderColor: MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator)?.color
                    }}
                  >
                    <div 
                      className="operator-dot" 
                      style={{ background: MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator)?.color }} 
                    />
                    <span>{MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator)?.name}</span>
                  </div>
                  
                  <div className="admin-number-display">
                    <div className="admin-label">Numéro administrateur :</div>
                    <div className="admin-number">
                      {MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator)?.adminNumber}
                    </div>
                    <button 
                      className="btn-copy"
                      onClick={() => {
                        const num = MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator)?.adminNumber || ''
                        navigator.clipboard.writeText(num.replace(/\s/g, ''))
                        setNotification({ type: 'success', message: 'Numéro copié !' })
                      }}
                    >
                      <Copy size={12} />
                      Copier
                    </button>
                  </div>
                  
                  <div className="admin-description">
                    <Info size={12} />
                    <span>
                      {MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator)?.description}
                    </span>
                  </div>
                </div>

                <div className="transfer-steps">
                  <div className="transfer-step">
                    <div className="ts-icon">📱</div>
                    <div className="ts-text">
                      Composez le code USSD : <br />
                      <strong className="ussd-code">
                        {MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator)?.ussdCode?.replace('MONTANT', selectedPack.price.toString())}
                      </strong>
                    </div>
                  </div>
                  <div className="transfer-step">
                    <div className="ts-icon">💰</div>
                    <div className="ts-text">
                      Vérifiez le montant : <strong>{selectedPack.price.toLocaleString('fr-FR')} Ar</strong>
                    </div>
                  </div>
                  <div className="transfer-step">
                    <div className="ts-icon">🔐</div>
                    <div className="ts-text">
                      Saisissez votre <strong>code PIN secret</strong> sur votre téléphone pour confirmer
                    </div>
                  </div>
                  <div className="transfer-step">
                    <div className="ts-icon">📨</div>
                    <div className="ts-text">
                      Vous recevrez un <strong>SMS de confirmation</strong> avec le code de transfert
                    </div>
                  </div>
                </div>
              </div>

              {/* ÉTAPE 2 */}
              <div className="instruction-box">
                <div className="step-number">02</div>
                <div className="hiw-title">Entrez le code de transfert</div>
                <p className="text-xs text-text-muted mb-4">
                  Après le transfert, vous recevrez un SMS de confirmation avec un <strong>code de transaction</strong>. Saisissez-le ci-dessous :
                </p>
                
                <div className="form-group code-field">
                  <label className="code-label">
                    <Send size={12} />
                    Code de transfert reçu par SMS
                  </label>
                  <input
                    type="text"
                    className="form-input code-input"
                    placeholder="Ex: TXN123456 ou CODE-123-XYZ"
                    value={transferCode}
                    onChange={(e) => setTransferCode(e.target.value.toUpperCase())}
                    maxLength={20}
                  />
                  <div className="code-hint">
                    <AlertCircle size={12} />
                    <span>Conservez précieusement le SMS de confirmation</span>
                  </div>
                </div>
              </div>

              {/* MESSAGE D'ATTENTE */}
              <div className="wait-msg">
                <div className="wait-icon">
                  <Clock size={20} />
                </div>
                <div className="wait-content">
                  <div className="wait-title">Délai de validation</div>
                  <p>
                    Après soumission, un administrateur vérifiera votre paiement manuellement.
                    Vos crédits seront ajoutés à votre compte sous un délai maximum de <strong className="gold">12 heures</strong>.
                  </p>
                  <div className="wait-badge">
                    <CheckCircle size={12} />
                    <span>Transaction sécurisée et vérifiée</span>
                  </div>
                </div>
              </div>

              {/* BOUTON DE SOUMISSION */}
              <button
                className="btn-pay mt-8"
                onClick={handleFinalSubmit}
                disabled={processing || !transferCode.trim()}
              >
                {processing ? (
                  <>
                    <div className="spinner" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Confirmer le paiement ({selectedPack.price.toLocaleString('fr-FR')} Ar)
                  </>
                )}
              </button>

              <div className="modal-footer-note">
                En confirmant, vous déclarez avoir effectué le transfert vers le numéro administrateur ci-dessus.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
