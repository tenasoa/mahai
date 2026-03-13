'use client'

import { ReactNode, ElementType, ComponentPropsWithoutRef } from 'react'
import { useRevealOnScroll } from '@/lib/hooks/useRevealOnScroll'

interface RevealOnScrollProps<T extends ElementType = 'div'> {
  children: ReactNode
  className?: string
  delay?: number
  as?: T
}

export function RevealOnScroll<T extends ElementType = 'div'>({
  children,
  className = '',
  delay = 0,
  as
}: RevealOnScrollProps<T>) {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>()

  const delayClass = delay > 0 ? `reveal-delay-${Math.min(delay, 4)}` : ''
  const Component = as || 'div'

  return (
    <Component
      ref={ref}
      className={`reveal ${delayClass} ${className} ${isVisible ? 'visible' : ''}`}
    >
      {children}
    </Component>
  )
)

// Wrapper for section tag
export function RevealSection({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <RevealOnScroll as="section" className={className} delay={delay}>
      {children}
    </RevealOnScroll>
  )
}

// Wrapper for individual cards with staggered delay
interface RevealGroupProps {
  children: ReactNode[]
  baseClassName?: string
  staggerDelay?: number
}

export function RevealGroup({ children, baseClassName = '', staggerDelay = 1 }: RevealGroupProps) {
  return (
    <>
      {Array.isArray(children) && children.map((child, index) => (
        <div
          key={index}
          className={`reveal reveal-delay-${Math.min(index * staggerDelay, 4)} ${baseClassName}`}
        >
          {child}
        </div>
      ))}
    </>
  )
}
