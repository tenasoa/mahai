'use client'

import { useEffect, useState } from 'react'
import { Play, Pause } from 'lucide-react'

export function MotionToggle() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Charger la préférence depuis localStorage
    const saved = localStorage.getItem('reduced-motion')
    if (saved !== null) {
      setReducedMotion(saved === 'true')
      document.documentElement.setAttribute('data-reduced-motion', saved)
    } else {
      // Vérifier la préférence système
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setReducedMotion(mediaQuery.matches)
      document.documentElement.setAttribute('data-reduced-motion', String(mediaQuery.matches))
    }
    setIsLoaded(true)
  }, [])

  const toggle = () => {
    const newValue = !reducedMotion
    setReducedMotion(newValue)
    localStorage.setItem('reduced-motion', String(newValue))
    document.documentElement.setAttribute('data-reduced-motion', String(newValue))
  }

  if (!isLoaded) return null

  return (
    <button
      onClick={toggle}
      className="motion-toggle"
      aria-pressed={reducedMotion}
      aria-label={reducedMotion ? 'Activer les animations' : 'Désactiver les animations'}
      title={reducedMotion ? 'Animations désactivées' : 'Animations activées'}
    >
      {reducedMotion ? (
        <>
          <Pause size={16} />
          <span className="motion-toggle-label">Réduit</span>
        </>
      ) : (
        <>
          <Play size={16} />
          <span className="motion-toggle-label">Animé</span>
        </>
      )}

      <style jsx>{`
        .motion-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--surface);
          border: 1px solid var(--b1);
          border-radius: var(--r);
          color: var(--text-2);
          font-family: var(--mono);
          font-size: 0.7rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .motion-toggle:hover {
          background: var(--gold-dim);
          border-color: var(--gold-line);
          color: var(--gold);
        }

        .motion-toggle:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: 2px;
        }

        .motion-toggle-label {
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (pointer: coarse) {
          .motion-toggle {
            min-height: 44px;
            min-width: 44px;
          }
        }

        [data-reduced-motion="true"] .motion-toggle {
          transition: none;
        }
      `}</style>
    </button>
  )
}

export default MotionToggle
