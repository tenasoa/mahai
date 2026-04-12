'use client'

import styles from './ProfileCard.module.css'

export interface ProfileCardProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function ProfileCard({ title, icon, children, className = '' }: ProfileCardProps) {
  return (
    <div className={`${styles.profileCard} ${className}`}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          {icon && <span className={styles.cardIcon}>{icon}</span>}
          {title}
        </h3>
      </div>
      <div className={styles.cardBody}>
        {children}
      </div>
    </div>
  )
}

export default ProfileCard
