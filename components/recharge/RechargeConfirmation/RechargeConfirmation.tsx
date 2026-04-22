'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui'
import { Button } from '@/components/ui'
import { ShieldCheck, Hash, Info, Smartphone, CheckCircle2, XCircle, Copy, Building } from 'lucide-react'
import styles from './RechargeConfirmation.module.css'

interface MerchantPhoneInfo {
  phone: string
  label: string
  isDefault: boolean
}

export interface RechargeConfirmationProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  price: number
  bonus?: number
  providerName: string
  phoneNumber: string
  transactionId?: string
  isLoading?: boolean
  isSuccess?: boolean
  error?: string
  onConfirm?: (senderCode: string) => void
}

export function RechargeConfirmation({
  isOpen,
  onClose,
  amount,
  price,
  bonus,
  providerName,
  phoneNumber,
  transactionId,
  isLoading = false,
  isSuccess = false,
  error,
  onConfirm,
}: RechargeConfirmationProps) {
  const [senderCode, setSenderCode] = useState('')
  const [localError, setLocalError] = useState('')
  const [copied, setCopied] = useState(false)
  const [merchantPhones, setMerchantPhones] = useState<Record<string, MerchantPhoneInfo>>({})
  const totalCredits = amount + (bonus || 0)

  // Charger les numéros marchand depuis l'API
  useEffect(() => {
    if (isOpen) {
      fetch('/api/config/merchant-phones')
        .then(res => res.json())
        .then(data => {
          if (data.phones) {
            setMerchantPhones(data.phones)
          }
        })
        .catch(err => console.error('Erreur chargement numéros marchand:', err))
    }
  }, [isOpen])

  const merchantPhone = merchantPhones[providerName]?.phone || ''

  const handleCopyNumber = () => {
    if (merchantPhone) {
      navigator.clipboard.writeText(merchantPhone.replace(/\s/g, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleConfirm = () => {
    if (!senderCode.trim()) {
      setLocalError('Le code de transaction est obligatoire')
      return
    }
    setLocalError('')
    onConfirm?.(senderCode)
  }

  return (
    <div className={styles.luxuryModal}>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isSuccess ? 'Paiement réussi !' : 'Confirmer le paiement'}
        size="md"
        showCloseButton={!isLoading}
        closeOnOverlayClick={!isLoading}
        closeOnEsc={!isLoading}
      >
      <div className={styles.content}>
        {isSuccess ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}><CheckCircle2 size={48} /></div>
            <p className={styles.successMessage}>
              Vos {totalCredits} crédits ont été ajoutés à votre compte.
            </p>
            {transactionId && (
              <div className={styles.transactionId}>
                <span className={styles.transactionIdLabel}>ID Transaction :</span>
                <span className={styles.transactionIdValue}>{transactionId}</span>
              </div>
            )}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onClose}
            >
              Retour au tableau de bord
            </Button>
          </div>
        ) : error || localError ? (
          <div className={styles.errorState}>
            <div className={styles.errorIcon}><XCircle size={48} /></div>
            <p className={styles.errorMessage}>{error || localError}</p>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => { setLocalError(''); }}
            >
              Réessayer
            </Button>
          </div>
            ) : (
              <div className={styles.confirmationState}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryRow}>
                    <span className={styles.label}>Crédits à recevoir</span>
                    <span className={styles.valueTotal}>+{totalCredits} cr</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.label}>Montant à payer</span>
                    <span className={styles.valuePrice}>{price.toLocaleString()} Ar</span>
                  </div>
                </div>
    
                <div className={styles.detailsList}>
                  <div className={styles.detailItem}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Smartphone size={14} className="text-gold" />
                        <span className="text-sm">Via {providerName} au <strong>{phoneNumber}</strong></span>
                      </div>
                      <button 
                        type="button"
                        onClick={onClose}
                        className="text-[0.65rem] uppercase tracking-widest text-gold hover:underline font-bold"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                </div>
    
                {/* Numéro marchand à transférer */}
                {merchantPhone ? (
                  <div className={styles.merchantPhoneCard}>
                    <div className={styles.merchantPhoneLabel}>
                      <Building size={14} />
                      <span>Transférez vers ce numéro {providerName}</span>
                    </div>
                    <div className={styles.merchantPhoneNumber}>
                      <span className={styles.merchantPhoneValue}>{merchantPhone}</span>
                      <button
                        type="button"
                        onClick={handleCopyNumber}
                        className={styles.copyButton}
                        disabled={copied}
                      >
                        {copied ? (
                          <><CheckCircle2 size={16} /> Copié !</>
                        ) : (
                          <><Copy size={16} /> Copier</>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.merchantPhoneCard + ' ' + styles.unavailable}>
                    <p className="text-sm text-text-2">
                      Numéro {providerName} temporairement indisponible. Veuillez choisir un autre opérateur.
                    </p>
                  </div>
                )}
    
                <div className={styles.instructionBox}>
                  <div className="flex gap-3">
                    <Info size={18} className="text-gold shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed text-text-2">
                      Effectuez le transfert manuellement vers le numéro ci-dessus depuis votre téléphone, puis saisissez le <strong>code de transaction</strong> reçu par SMS pour valider votre recharge.
                    </p>
                  </div>
                </div>
    
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>
                    <Hash size={12} /> Code de transaction (Reçu par SMS)
                  </label>
                  <input
                    type="text"
                    className={styles.codeInput}
                    placeholder="Ex: 123456789"
                    value={senderCode}
                    onChange={(e) => setSenderCode(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
    
                 <div className={styles.actions}>
                   <Button 
                     variant="secondary" 
                     onClick={onClose}
                     disabled={isLoading}
                     className="flex-1"
                   >
                     Annuler
                   </Button>
                   <Button 
                     variant="primary" 
                     onClick={handleConfirm}
                     isLoading={isLoading}
                     className="flex-[1.5]"
                   >
                     {isLoading ? 'Validation...' : `Payer ${price.toLocaleString()} Ar`}
                   </Button>
                 </div>

                 <p className={styles.notice}>
                   En confirmant, vous déclarez avoir effectué le paiement de {price.toLocaleString()} Ar. Votre solde sera mis à jour après vérification.
                 </p>
               </div>
             )}
      </div>
      </Modal>
    </div>
  )
}

export default RechargeConfirmation
