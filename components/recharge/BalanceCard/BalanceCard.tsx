'use client'

import { ReactNode } from 'react'
import styles from './BalanceCard.module.css'

export interface BalanceCardProps {
  balance: number
  label?: string
  unit?: string
  showConversion?: boolean  // @deprecated Plus nécessaire, gardé pour compatibilité
  onRecharge?: () => void
  isLoading?: boolean
  children?: ReactNode
}

export function BalanceCard({
  balance,
  label = 'Solde Ariary',
  unit = 'Ar',
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
      
      {/* Noise and Reflection */}
      <div className={styles.noise} />
      <div className={styles.reflection} />

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

        {/* Conversion Ar vers crédits supprimée - système unifié en Ar */}

        {children && <div className={styles.children}>{children}</div>}
      </div>
    </div>
  )
}

export default BalanceCard
