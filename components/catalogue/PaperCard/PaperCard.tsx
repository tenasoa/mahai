'use client'

import { useState } from 'react'
import styles from './PaperCard.module.css'

export interface PaperCardProps {
  id: string
  title: string
  examType: string
  year: number
  subject: string
  pages?: number
  duration?: string
  difficulty?: 'facile' | 'moyen' | 'difficile'
  rating?: number
  reviews?: number
  price: number
  isFree?: boolean
  isPremium?: boolean
  isAi?: boolean
  isUnlocked?: boolean
  isWished?: boolean
  onPreview?: () => void
  onBuy?: () => void
  onWishlist?: () => void
}

export function PaperCard({
  id,
  title,
  examType,
  year,
  subject,
  pages,
  duration,
  difficulty,
  rating,
  reviews,
  price,
  isFree = false,
  isPremium = false,
  isAi = false,
  isUnlocked = false,
  isWished = false,
  onPreview,
  onBuy,
  onWishlist,
}: PaperCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const difficultyClass = difficulty === 'facile' ? 'easy' : difficulty === 'moyen' ? 'med' : 'hard'
  const difficultyLabel = difficulty === 'facile' ? 'Facile' : difficulty === 'moyen' ? 'Moyen' : 'Difficile'

  return (
    <article
      className={`${styles.paperCard} ${isHovered ? styles.hovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className={styles.thumbnail}>
        <div className={styles.thumbnailPattern} />
        <div className={styles.thumbnailGlyph}>{subject.charAt(0).toUpperCase()}</div>
        
        {/* Badges */}
        <div className={styles.badges}>
          {isPremium && <span className={`${styles.badge} ${styles.badgeGold}`}>Premium</span>}
          {isAi && <span className={`${styles.badge} ${styles.badgeAi}`}>✦ IA</span>}
          {isFree && <span className={`${styles.badge} ${styles.badgeFree}`}>Gratuit</span>}
          {isUnlocked && <span className={`${styles.badge} ${styles.badgeUnlocked}`}>✓ Débloqué</span>}
        </div>

        {/* Wishlist button */}
        <button
          className={`${styles.wishlistButton} ${isWished ? styles.wished : ''}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onWishlist?.()
          }}
          aria-label={isWished ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          {isWished ? '♥' : '♡'}
        </button>
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <div className={styles.metaRow}>
          <span className={styles.examType}>{examType} · {subject}</span>
          <span className={styles.year}>{year}</span>
        </div>

        <h3 className={styles.cardTitle}>{title}</h3>

        <div className={styles.cardInfo}>
          {pages && <span>{pages} pages</span>}
          {duration && <span> · {duration}</span>}
          {difficulty && (
            <span className={`${styles.difficultyBadge} ${styles[difficultyClass]}`}>
              {' '}· {difficultyLabel}
            </span>
          )}
        </div>

        {rating !== undefined && reviews !== undefined && (
          <div className={styles.rating}>
            <div className={styles.stars}>
              {'★'.repeat(Math.floor(rating))}
              {'☆'.repeat(5 - Math.floor(rating))}
            </div>
            <span className={styles.reviewCount}>({reviews})</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        <div className={`${styles.price} ${isFree ? styles.freePrice : ''}`}>
          {isFree ? 'Gratuit' : `${price} cr`}
        </div>
        <div className={styles.actions}>
          <button className={styles.previewButton} onClick={onPreview}>
            Aperçu
          </button>
          {(onBuy && !isUnlocked) ? (
            <button className={styles.buyButton} onClick={onBuy}>
              Acheter
            </button>
          ) : (
            <button className={styles.accessButton} onClick={onBuy}>
              Accéder
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default PaperCard
