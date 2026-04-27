'use client'

import { useEffect } from 'react'

type UseTiltOptions = {
  /** Inclinaison max en degrés (X et Y). Défaut: 6. */
  max?: number
  /** Échelle au survol. Défaut: 1.02. */
  scale?: number
  /** Désactive sur appareils tactiles (pas de souris). Défaut: true. */
  disableOnTouch?: boolean
}

/**
 * Applique un effet tilt 3D au survol pour tous les éléments matchant le
 * sélecteur dans le DOM. Utilise rAF pour rester fluide. Sans dépendance.
 *
 * Usage : useTilt('.paper-card')
 */
export function useTilt(
  selector: string,
  options: UseTiltOptions = {},
  /** Dépendances supplémentaires (ex: liste async chargée plus tard). */
  extraDeps: ReadonlyArray<unknown> = []
) {
  const { max = 6, scale = 1.02, disableOnTouch = true } = options

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (disableOnTouch && window.matchMedia?.('(hover: none)').matches) {
      return
    }

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector))
    if (elements.length === 0) return

    const cleanups: Array<() => void> = []

    for (const el of elements) {
      // Préserve le style inline existant pour le restaurer au unmount.
      const previousTransform = el.style.transform
      const previousTransition = el.style.transition
      const previousWillChange = el.style.willChange

      el.style.transition = 'transform 0.18s ease-out'
      el.style.willChange = 'transform'
      el.style.transformStyle = 'preserve-3d'

      let frameId = 0
      let nextX = 0
      let nextY = 0
      let nextActive = false

      const apply = () => {
        frameId = 0
        if (!nextActive) {
          el.style.transform = previousTransform || ''
          return
        }
        el.style.transform = `perspective(900px) rotateX(${nextX}deg) rotateY(${nextY}deg) scale(${scale})`
      }

      const onMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect()
        const px = (e.clientX - rect.left) / rect.width // 0..1
        const py = (e.clientY - rect.top) / rect.height
        nextY = (px - 0.5) * 2 * max
        nextX = -(py - 0.5) * 2 * max
        nextActive = true
        if (!frameId) frameId = requestAnimationFrame(apply)
      }

      const onLeave = () => {
        nextActive = false
        if (!frameId) frameId = requestAnimationFrame(apply)
      }

      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      el.addEventListener('pointercancel', onLeave)

      cleanups.push(() => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
        el.removeEventListener('pointercancel', onLeave)
        if (frameId) cancelAnimationFrame(frameId)
        el.style.transform = previousTransform
        el.style.transition = previousTransition
        el.style.willChange = previousWillChange
      })
    }

    return () => {
      cleanups.forEach((fn) => fn())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, max, scale, disableOnTouch, ...extraDeps])
}
