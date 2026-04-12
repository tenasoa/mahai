'use client'

import { Modal } from '@/components/ui'
import { Button } from '@/components/ui'
import styles from './RechargeConfirmation.module.css'

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
  onConfirm?: () => void
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
  const totalCredits = amount + (bonus || 0)

  return (
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
          /* Success State */
          <div className={styles.successState}>
            <div className={styles.successIcon}>✓</div>
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
        ) : error ? (
          /* Error State */
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>✕</div>
            <p className={styles.errorMessage}>{error}</p>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={onClose}
            >
              Réessayer
            </Button>
          </div>
        ) : (
          /* Confirmation State */
          <div className={styles.confirmationState}>
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span className={styles.label}>Montant</span>
                <span className={styles.value}>{amount} crédits</span>
              </div>
              {bonus && (
                <div className={styles.summaryRow}>
                  <span className={styles.label}>Bonus</span>
                  <span className={styles.valueBonus}>+{bonus} crédits</span>
                </div>
              )}
              <div className={styles.summaryDivider} />
              <div className={styles.summaryRow}>
                <span className={styles.label}>Total</span>
                <span className={styles.valueTotal}>{totalCredits} crédits</span>
              </div>
            </div>

            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Prix à payer</span>
                <span className={styles.detailValue}>{price.toLocaleString()} Ar</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Via</span>
                <span className={styles.detailValue}>{providerName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Numéro</span>
                <span className={styles.detailValue}>{phoneNumber}</span>
              </div>
            </div>

            <div className={styles.actions}>
              <Button
                variant="ghost"
                size="md"
                onClick={onClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={onConfirm}
                isLoading={isLoading}
              >
                Confirmer et payer {price.toLocaleString()} Ar
              </Button>
            </div>

            <p className={styles.notice}>
              En confirmant, vous acceptez de payer {price.toLocaleString()} Ar via {providerName}.
              Les crédits seront ajoutés instantanément à votre compte.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default RechargeConfirmation
