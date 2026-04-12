'use client'

import styles from './ProfileHeader.module.css'

export interface ProfileHeaderProps {
  firstName?: string
  lastName?: string
  role?: string
  email?: string
  phone?: string
  avatarUrl?: string
  initials?: string
  isVerified?: boolean
  onEdit?: () => void
  onAvatarClick?: () => void
}

export function ProfileHeader({
  firstName = '',
  lastName = '',
  role = 'ÉTUDIANT',
  email = '',
  phone = '',
  avatarUrl,
  initials = 'U',
  isVerified = false,
  onEdit,
  onAvatarClick,
}: ProfileHeaderProps) {
  return (
    <header className={styles.profileHeader}>
      <div className={styles.left}>
        <div className={styles.avatarContainer} onClick={onAvatarClick}>
          {avatarUrl ? (
            <div className={styles.avatarImage}>
              <img src={avatarUrl} alt="Avatar" />
            </div>
          ) : (
            <div className={styles.avatarPlaceholder}>
              {initials.toUpperCase()}
            </div>
          )}
          <button className={styles.cameraButton} type="button" aria-label="Changer l'avatar">
            📷
          </button>
        </div>

        <div className={styles.info}>
          <div className={styles.nameBlock}>
            <h1 className={styles.firstName}>{firstName || 'Prénom'}</h1>
            <h2 className={styles.lastName}>{lastName || 'NOM'}</h2>
          </div>

          <div className={styles.badges}>
            <span className={`${styles.badge} ${styles.student}`}>
              {role}
            </span>
            {isVerified && (
              <span className={`${styles.badge} ${styles.verified}`}>
                ✓ Vérifié
              </span>
            )}
          </div>

          <div className={styles.contact}>
            {email && (
              <span className={styles.contactItem}>
                📧 {email}
              </span>
            )}
            {phone && (
              <span className={styles.contactItem}>
                📱 {phone}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.editButton} onClick={onEdit}>
          ✏️ Modifier le profil
        </button>
      </div>
    </header>
  )
}

export default ProfileHeader
