'use client'

import styles from './ExamTypePills.module.css'

export interface ExamType {
  id: string
  label: string
  count?: number
}

export interface ExamTypePillsProps {
  types: ExamType[]
  selected?: string
  onSelect?: (id: string | undefined) => void
  isLoading?: boolean
}

export function ExamTypePills({
  types,
  selected,
  onSelect,
  isLoading = false,
}: ExamTypePillsProps) {
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingPill} />
        <div className={styles.loadingPill} />
        <div className={styles.loadingPill} />
      </div>
    )
  }

  return (
    <div className={styles.pillsContainer}>
      {/* All option */}
      <button
        className={`${styles.pill} ${selected === undefined ? styles.active : ''}`}
        onClick={() => onSelect?.(undefined)}
      >
        <span className={styles.pillDot} />
        <strong>Tous</strong>
      </button>

      {/* Exam types */}
      {types.map((type) => (
        <button
          key={type.id}
          className={`${styles.pill} ${selected === type.id ? styles.active : ''}`}
          onClick={() => onSelect?.(type.id === selected ? undefined : type.id)}
        >
          <span className={styles.pillDot} />
          <strong>{type.label}</strong>
          {type.count !== undefined && (
            <span className={styles.pillCount}>{type.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

export default ExamTypePills
