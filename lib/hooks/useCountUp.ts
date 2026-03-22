'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseCountUpOptions {
  start?: number
  end: number
  duration?: number // in milliseconds
  delay?: number // in milliseconds
  decimals?: number
}

export function useCountUp({
  start = 0,
  end,
  duration = 2000,
  delay = 0,
  decimals = 0
}: UseCountUpOptions) {
  const [count, setCount] = useState(start)
  const [isComplete, setIsComplete] = useState(false)

  const easeOutCubic = useCallback((t: number) => {
    return 1 - Math.pow(1 - t, 3)
  }, [])

  useEffect(() => {
    let animationFrameId: number
    let startTime: number | null = null

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = easeOutCubic(progress)
      const currentCount = start + (end - start) * easeProgress

      setCount(Number(currentCount.toFixed(decimals)))

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        setIsComplete(true)
      }
    }

    const timer = setTimeout(() => {
      animationFrameId = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timer)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [start, end, duration, delay, decimals, easeOutCubic])

  return { count, isComplete }
}

// Hook for multiple counters
interface CounterTarget {
  key: string
  value: number
  decimals?: number
}

export function useMultiCountUp(
  targets: CounterTarget[],
  duration = 2000,
  delay = 0
) {
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    targets.reduce((acc, t) => ({ ...acc, [t.key]: 0 }), {})
  )

  useEffect(() => {
    let animationFrameId: number
    let startTime: number | null = null

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = easeOutCubic(progress)

      setCounts(
        targets.reduce((acc, t) => ({
          ...acc,
          [t.key]: Math.floor(easeProgress * t.value)
        }), {})
      )

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    const timer = setTimeout(() => {
      animationFrameId = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timer)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [targets, duration, delay])

  return counts
}
