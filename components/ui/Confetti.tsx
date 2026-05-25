'use client'

import { useEffect, useCallback } from 'react'
import confetti from 'canvas-confetti'

type ConfettiType = 'streak' | 'purchase' | 'achievement'

interface ConfettiProps {
  trigger: boolean
  type?: ConfettiType
  onComplete?: () => void
}

const CONFETTI_CONFIGS: Record<ConfettiType, confetti.Options> = {
  streak: {
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#c9a84c', '#e8c96a', '#d4a855', '#a8782a', '#8b6914'],
  },
  purchase: {
    particleCount: 120,
    spread: 100,
    origin: { y: 0.4 },
    colors: ['#c9a84c', '#6EAA8C', '#E05575', '#4A8BC9', '#8050c8'],
  },
  achievement: {
    particleCount: 200,
    spread: 160,
    origin: { y: 0.5 },
    colors: ['#c9a84c', '#e8c96a', '#d4a855', '#6EAA8C', '#4A8BC9', '#E05575', '#8050c8'],
    decay: 0.91,
    scalar: 1.2,
  },
}

export function Confetti({ trigger, type = 'streak', onComplete }: ConfettiProps) {
  const fire = useCallback(() => {
    const config = CONFETTI_CONFIGS[type]

    // Tir principal
    confetti({
      ...config,
      zIndex: 9999,
    })

    // Deuxième salve avec délai pour effet plus riche
    if (type === 'achievement') {
      setTimeout(() => {
        confetti({
          ...config,
          particleCount: config.particleCount! / 2,
          origin: { x: 0.2, y: 0.5 },
          angle: 60,
        })
        confetti({
          ...config,
          particleCount: config.particleCount! / 2,
          origin: { x: 0.8, y: 0.5 },
          angle: 120,
        })
      }, 250)
    }

    onComplete?.()
  }, [type, onComplete])

  useEffect(() => {
    if (trigger) {
      fire()
    }
  }, [trigger, fire])

  return null // Ce composant ne rend rien visuellement
}
