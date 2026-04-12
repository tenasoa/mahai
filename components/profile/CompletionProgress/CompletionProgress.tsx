'use client'

import styles from './CompletionProgress.module.css'

export interface CompletionProgressProps {
  percentage: number
  level?: 'novice' | 'debutant' | 'intermediaire' | 'avance' | 'expert'
  completedSteps?: number
  totalSteps?: number
  nextStepLabel?: string
}

export function CompletionProgress({
  percentage,
  level = 'novice',
  completedSteps = 0,
  totalSteps = 10,
  nextStepLabel = 'Prochaine étape',
}: CompletionProgressProps) {
  const getLevelClass = () => {
    switch (level) {
      case 'debutant':
        return styles.debutant
      case 'intermediaire':
        return styles.intermediaire
      case 'avance':
        return styles.avance
      case 'expert':
        return styles.expert
      default:
        return styles.novice
    }
  }

  const getLevelLabel = () => {
    switch (level) {
      case 'debutant':
        return 'Débutant'
      case 'intermediaire':
        return 'Intermédiaire'
      case 'avance':
        return 'Avancé'
      case 'expert':
        return 'Expert'
      default:
        return 'Novice'
    }
  }

  return (
    <div className={styles.completionProgress}>
      <div className={styles.progressHeader}>
        <span className={styles.progressLabel}>Profil complété</span>
        <span className={`${styles.progressLevel} ${getLevelClass()}`}>
          {getLevelLabel()}
        </span>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>

      <div className={styles.progressFooter}>
        <span className={styles.progressSteps}>
          {completedSteps}/{totalSteps} étapes
        </span>
        <span className={styles.progressNext}>{nextStepLabel}</span>
      </div>
    </div>
  )
}

export default CompletionProgress
