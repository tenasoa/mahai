'use client'

import styles from './TransactionHistory.module.css'

export type TransactionType = 'in' | 'out' | 'bonus'
export type TransactionStatus = 'pending' | 'completed' | 'refused'

export interface Transaction {
  id: string
  type: TransactionType
  title: string
  amount: number
  date: string
  status?: TransactionStatus
  meta?: string
  icon?: string
}

export interface TransactionHistoryProps {
  transactions?: Transaction[]
  isLoading?: boolean
  emptyMessage?: string
  onTransactionClick?: (transaction: Transaction) => void
}

export function TransactionHistory({
  transactions = [],
  isLoading = false,
  emptyMessage = 'Aucune transaction',
  onTransactionClick,
}: TransactionHistoryProps) {
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Chargement des transactions...</p>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className={styles.empty}>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  // Grouper par mois
  const groupedByMonth = transactions.reduce((acc, tx) => {
    const month = new Date(tx.date).toLocaleString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    })
    if (!acc[month]) {
      acc[month] = []
    }
    acc[month].push(tx)
    return acc
  }, {} as Record<string, Transaction[]>)

  return (
    <div className={styles.history}>
      {Object.entries(groupedByMonth).map(([month, monthTransactions]) => (
        <div key={month} className={styles.monthGroup}>
          <div className={styles.monthLabel}>{month}</div>
          {monthTransactions.map((tx) => (
            <div
              key={tx.id}
              className={`${styles.txRow} ${styles[tx.type]} ${tx.status === 'pending' ? styles.pending : ''} ${tx.status === 'refused' ? styles.refused : ''}`}
              onClick={() => onTransactionClick?.(tx)}
              role="button"
              tabIndex={0}
              aria-label={`${tx.title}, ${tx.amount} crédits${tx.status === 'pending' ? ', en attente de validation' : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onTransactionClick?.(tx)
                }
              }}
            >
              <div className={`${styles.txIcon} ${styles[tx.type]} ${tx.status === 'pending' ? styles.pendingIcon : ''}`}>
                {tx.status === 'pending' ? '⏳' : tx.icon || getIconForType(tx.type)}
              </div>
              <div className={styles.txBody}>
                <div className={styles.txTitle}>
                  {tx.title}
                  {tx.status === 'pending' && (
                    <span className={styles.statusBadge} aria-label="En attente de validation">En attente</span>
                  )}
                  {tx.status === 'refused' && (
                    <span className={styles.statusBadgeRefused} aria-label="Recharge refusée">Refusé</span>
                  )}
                </div>
                <div className={styles.txMeta}>{tx.meta || tx.date}</div>
              </div>
              <div className={`${styles.txAmount} ${tx.status === 'pending' ? styles.amountPending : tx.status === 'refused' ? styles.amountRefused : styles[tx.type === 'in' || tx.type === 'bonus' ? 'positive' : 'negative']}`}>
                {tx.type === 'in' || tx.type === 'bonus' ? '+' : '-'}{tx.amount} cr
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function getIconForType(type: TransactionType): string {
  switch (type) {
    case 'in':
      return '↓'
    case 'out':
      return '↑'
    case 'bonus':
      return '★'
    default:
      return '•'
  }
}

export default TransactionHistory
