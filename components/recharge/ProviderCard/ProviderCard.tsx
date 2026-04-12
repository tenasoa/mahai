'use client'

import styles from './ProviderCard.module.css'

export type ProviderType = 'mvola' | 'orange' | 'airtel'

export interface Provider {
  id: ProviderType
  name: string
  logo?: string
  color: string
  available: boolean
}

export interface ProviderCardProps {
  provider: Provider
  isSelected?: boolean
  onSelect?: (provider: Provider) => void
  disabled?: boolean
}

export function ProviderCard({
  provider,
  isSelected = false,
  onSelect,
  disabled = false,
}: ProviderCardProps) {
  const handleClick = () => {
    if (!disabled && provider.available && onSelect) {
      onSelect(provider)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && provider.available && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onSelect?.(provider)
    }
  }

  return (
    <div
      className={`${styles.providerCard} ${isSelected ? styles.selected : ''} ${!provider.available ? styles.unavailable : ''} ${disabled ? styles.disabled : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="radio"
      aria-checked={isSelected}
      aria-disabled={disabled || !provider.available}
      tabIndex={disabled || !provider.available ? -1 : 0}
    >
      <div className={styles.providerLogo}>
        {provider.logo ? (
          <img src={provider.logo} alt={`Logo ${provider.name}`} className={styles.logoImage} />
        ) : (
          <div className={styles.logoPlaceholder} style={{ backgroundColor: provider.color }}>
            {provider.name.charAt(0)}
          </div>
        )}
      </div>

      <div className={styles.providerInfo}>
        <span className={styles.providerName}>{provider.name}</span>
        {!provider.available && (
          <span className={styles.unavailableLabel}>Indisponible</span>
        )}
      </div>

      {isSelected && (
        <div className={styles.checkmark}>✓</div>
      )}
    </div>
  )
}

export default ProviderCard
