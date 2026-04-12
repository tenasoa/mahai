'use client'

import { ReactNode, forwardRef } from 'react'
import styles from './Card.module.css'

export type CardVariant = 'default' | 'hero' | 'stat' | 'interactive' | 'glass'

export interface CardProps {
  variant?: CardVariant
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  onClick?: () => void
  role?: string
  ariaLabel?: string
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      children,
      className = '',
      hover = false,
      glow = false,
      padding = 'md',
      onClick,
      role,
      ariaLabel,
    },
    ref
  ) => {
    const interactive = !!onClick || hover
    const interactiveClass = interactive ? styles.interactive : ''
    const glowClass = glow ? styles.glow : ''
    const hoverClass = hover ? styles.hover : ''

    return (
      <div
        ref={ref}
        className={`${styles.card} ${styles[variant]} ${interactiveClass} ${glowClass} ${hoverClass} ${styles[`padding-${padding}`]} ${className}`}
        onClick={onClick}
        role={role}
        aria-label={ariaLabel}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onClick()
          }
        }}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
