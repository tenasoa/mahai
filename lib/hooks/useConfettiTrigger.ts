'use client'

import { useState, useCallback, useEffect } from 'react'

interface ConfettiTriggerOptions {
  /** Déclenche après ce délai (ms) après que la condition soit vraie */
  delay?: number
  /** Ne se déclenche qu'une seule fois par session */
  oncePerSession?: boolean
}

export function useConfettiTrigger(
  condition: boolean,
  options: ConfettiTriggerOptions = {}
) {
  const { delay = 500, oncePerSession = true } = options
  const [trigger, setTrigger] = useState(false)
  const [hasFired, setHasFired] = useState(false)

  useEffect(() => {
    if (condition && !hasFired) {
      const timer = setTimeout(() => {
        setTrigger(true)
        if (oncePerSession) {
          setHasFired(true)
        }
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [condition, hasFired, delay, oncePerSession])

  const reset = useCallback(() => {
    setTrigger(false)
    setHasFired(false)
  }, [])

  return { trigger, reset }
}
