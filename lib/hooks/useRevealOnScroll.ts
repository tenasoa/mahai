'use client'

import { useEffect, useRef, useState } from 'react'

interface UseRevealOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useRevealOnScroll<T extends HTMLElement>({
  threshold = 0.1,
  rootMargin = '0px 0px -60px 0px',
  triggerOnce = true
}: UseRevealOptions = {}) {
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (triggerOnce) {
              observer.unobserve(entry.target)
            }
          } else if (!triggerOnce) {
            setIsVisible(false)
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce])

  return { ref, isVisible }
}

// Hook for revealing multiple elements with stagger
export function useMultiReveal(
  selector: string = '.reveal',
  options: UseRevealOptions = {}
) {
  useEffect(() => {
    const { threshold = 0.1, rootMargin = '0px 0px -60px 0px' } = options

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold, rootMargin }
    )

    document.querySelectorAll(selector).forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [selector, options])
}

// Hook for navbar scroll state
export function useScrollThreshold(threshold: number = 40) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold)
    }

    // Check initial state
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return isScrolled
}
