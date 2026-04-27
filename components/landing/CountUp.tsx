'use client'

import { useEffect, useRef, useState } from 'react'

type CountUpProps = {
  end: number
  duration?: number
  format?: (n: number) => string
  className?: string
  /** Texte à afficher tant que l'animation ne s'est pas déclenchée. */
  placeholder?: string
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Compteur animé qui ne démarre que lorsque l'élément entre dans le viewport.
 * Une seule animation par cycle de vie. Respecte `prefers-reduced-motion`.
 */
export function CountUp({
  end,
  duration = 1400,
  format = (n) => Math.round(n).toLocaleString('fr-FR').replace(/\u202F/g, ' '),
  className,
  placeholder = '—',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState<number | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Respect reduced-motion : on saute l'animation et on affiche la valeur finale.
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      setValue(end)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return
        startedRef.current = true

        const startTs = performance.now()
        let frameId = 0

        const tick = (now: number) => {
          const progress = Math.min((now - startTs) / duration, 1)
          setValue(end * easeOutCubic(progress))
          if (progress < 1) {
            frameId = requestAnimationFrame(tick)
          }
        }

        frameId = requestAnimationFrame(tick)

        return () => cancelAnimationFrame(frameId)
      },
      { threshold: 0.4 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [end, duration])

  return (
    <span ref={ref} className={className}>
      {value === null ? placeholder : format(value)}
    </span>
  )
}
