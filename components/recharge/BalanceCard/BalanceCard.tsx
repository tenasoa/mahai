'use client'

import { ReactNode } from 'react'
import styles from './BalanceCard.module.css'

export interface BalanceCardProps {
  balance: number
  label?: string
  unit?: string
  ariaryEquivalent?: string
  onRecharge?: () => void
  isLoading?: boolean
  children?: ReactNode
}

export function BalanceCard({
  balance,
  label = 'Solde disponible',
  unit = 'crédits',
  ariaryEquivalent,
  onRecharge,
  isLoading = false,
  children,
}: BalanceCardProps) {
  return (
    <div className={styles.balanceCard}>
      {/* Gradient line */}
      <div className={styles.gradientLine} />
      
      {/* Background gradient */}
      <div className={styles.bgGradient} />

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
          {onRecharge && (
            <button 
              className={styles.rechargeButton}
              onClick={onRecharge}
              type="button"
            >
              Recharger
            </button>
          )}
        </div>

        <div className={styles.balance}>
          <span className={styles.amount}>{isLoading ? '...' : balance.toLocaleString()}</span>
          <span className={styles.unit}>{unit}</span>
        </div>

        {ariaryEquivalent && (
          <div className={styles.ariary}>{ariaryEquivalent}</div>
        )}

        {children && <div className={styles.children}>{children}</div>}
      </div>
    </div>
  )
}

export default BalanceCard
