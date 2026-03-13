'use client'

import { useEffect, useCallback, useRef } from 'react'

interface UseMouseGlowOptions {
  selector?: string
  enabled?: boolean
}

export function useMouseGlow({
  selector = '.card-glow, .step-card, .role-card, .price-card',
  enabled = true
}: UseMouseGlowOptions = {}) {
  const rafId = useRef<number | null>(null)
  const lastMousePos = useRef({ x: 0, y: 0 })

  const updateCards = useCallback(() => {
    if (!enabled) return

    const cards = document.querySelectorAll(selector)
    const { x: mouseX, y: mouseY } = lastMousePos.current

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect()
      const relativeX = ((mouseX - rect.left) / rect.width) * 100
      const relativeY = ((mouseY - rect.top) / rect.height) * 100

      // Only update if mouse is near or over the card for performance
      const isNear =
        mouseX >= rect.left - 100 &&
        mouseX <= rect.right + 100 &&
        mouseY >= rect.top - 100 &&
        mouseY <= rect.bottom + 100

      if (isNear) {
        ;(card as HTMLElement).style.setProperty('--mx', `${Math.max(0, Math.min(100, relativeX))}%`)
        ;(card as HTMLElement).style.setProperty('--my', `${Math.max(0, Math.min(100, relativeY))}%`)
      }
    })

    rafId.current = null
  }, [selector, enabled])

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY }

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(updateCards)
      }
    },
    [updateCards]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('mousemove', onMouseMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [onMouseMove, enabled])
}

// Hook for a single element with mouse glow
export function useElementGlow<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const rafId = useRef<number | null>(null)

  const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
    if (!ref.current) return

    if (rafId.current) cancelAnimationFrame(rafId.current)

    rafId.current = requestAnimationFrame(() => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      ref.current.style.setProperty('--mx', `${x}%`)
      ref.current.style.setProperty('--my', `${y}%`)
    })
  }, [])

  const onMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.setProperty('--mx', '50%')
    ref.current.style.setProperty('--my', '50%')
  }, [])

  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [])

  return {
    ref,
    glowProps: {
      onMouseMove,
      onMouseLeave
    }
  }
}
