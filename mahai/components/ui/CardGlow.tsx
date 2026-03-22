'use client'

import { ReactNode, useRef, useCallback } from 'react'

interface CardGlowProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'hero' | 'teal' | 'gold' | 'rose' | 'green'
}

export function CardGlow({ children, className = '', variant = 'default' }: CardGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const rafId = useRef<number | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
    }

    rafId.current = requestAnimationFrame(() => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      cardRef.current.style.setProperty('--mx', `${x}%`)
      cardRef.current.style.setProperty('--my', `${y}%`)
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return
    cardRef.current.style.setProperty('--mx', '50%')
    cardRef.current.style.setProperty('--my', '50%')
  }, [])

  const variantClass = variant === 'default' ? '' : `card-${variant}`

  return (
    <div
      ref={cardRef}
      className={`card-glow ${variantClass} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

// Bento grid wrapper
interface BentoGridProps {
  children: ReactNode
  className?: string
}

export function BentoGrid({ children, className = '' }: BentoGridProps) {
  return (
    <div className={`bento-a ${className}`}>
      {children}
    </div>
  )
}

// Individual bento card
interface BentoCardProps {
  children: ReactNode
  variant?: 'default' | 'hero' | 'teal' | 'gold' | 'rose' | 'green'
  span?: 'default' | 'wide' | 'tall' | 'large'
  className?: string
}

export function BentoCard({ children, variant = 'default', span = 'default', className = '' }: BentoCardProps) {
  const spanClasses = {
    default: '',
    wide: 'col-span-full md:col-span-7 md:row-span-1',
    tall: 'md:row-span-2',
    large: 'md:col-span-7 md:row-span-2'
  }

  return (
    <CardGlow variant={variant} className={`${spanClasses[span]} ${className}`}>
      {children}
    </CardGlow>
  )
}
