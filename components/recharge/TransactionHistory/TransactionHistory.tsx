'use client'

import styles from './TransactionHistory.module.css'

export type TransactionType = 'in' | 'out' | 'bonus'

export interface Transaction {
  id: string
  type: TransactionType
  title: string
  amount: number
  date: string
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
              className={`${styles.txRow} ${styles[tx.type]}`}
              onClick={() => onTransactionClick?.(tx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onTransactionClick?.(tx)
                }
              }}
            >
              <div className={`${styles.txIcon} ${styles[tx.type]}`}>
                {tx.icon || getIconForType(tx.type)}
              </div>
              <div className={styles.txBody}>
                <div className={styles.txTitle}>{tx.title}</div>
                <div className={styles.txMeta}>{tx.meta || tx.date}</div>
              </div>
              <div className={`${styles.txAmount} ${styles[tx.type === 'in' || tx.type === 'bonus' ? 'positive' : 'negative']}`}>
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
