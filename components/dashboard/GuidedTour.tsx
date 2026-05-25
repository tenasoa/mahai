'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react'

interface TourStep {
  target: string // CSS selector du composant cible
  title: string
  description: string
  position: 'bottom' | 'top' | 'left' | 'right'
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '.hero-card',
    title: 'Bienvenue sur ton tableau de bord ! 👋',
    description:
      'Ici tu retrouves tes stats, ton solde, et ta progression. Tout ce dont tu as besoin pour réussir tes examens.',
    position: 'bottom',
  },
  {
    target: '.streak-card',
    title: '🔥 Construis ton streak',
    description:
      'Reviens chaque jour pour maintenir ta série. Plus ton streak est long, plus tu progresses vite !',
    position: 'left',
  },
  {
    target: '.activity-list',
    title: "🚀 Passe à l'action",
    description:
      'Explore le catalogue, recharge ton compte, ou invite tes amis. Commence par acheter ton premier sujet !',
    position: 'right',
  },
  {
    target: '.stat-card-gold',
    title: '💰 Ton solde en Ariary',
    description:
      'Recharge ton compte avec MVola, Orange ou Airtel pour débloquer des sujets et corrections IA.',
    position: 'bottom',
  },
]

const TOUR_STORAGE_KEY = 'mahai-guided-tour-completed'

export function GuidedTour() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    // Vérifie si le tour a déjà été complété
    const completed = localStorage.getItem(TOUR_STORAGE_KEY)
    if (!completed) {
      // Petit délai pour laisser le dashboard se rendre
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const removeHighlights = useCallback(() => {
    document.querySelectorAll('.tour-highlight').forEach((el) => {
      el.classList.remove('tour-highlight')
    })
  }, [])

  const positionTooltip = useCallback(
    (stepIndex: number) => {
      const step = TOUR_STEPS[stepIndex]
      const targetEl = document.querySelector(step.target)
      if (!targetEl) return

      const targetRect = targetEl.getBoundingClientRect()
      const tooltipWidth = 320
      const gap = 16
      const viewportMargin = 16

      let style: React.CSSProperties = {}

      const clampLeft = (desiredLeft: number) =>
        Math.max(
          viewportMargin,
          Math.min(
            desiredLeft,
            window.innerWidth - tooltipWidth - viewportMargin,
          ),
        )

      switch (step.position) {
        case 'bottom':
          style = {
            top: targetRect.bottom + gap,
            left: clampLeft(
              targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
            ),
          }
          break
        case 'top':
          style = {
            top: targetRect.top - gap - 160, // hauteur estimée du tooltip
            left: clampLeft(
              targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
            ),
          }
          break
        case 'left': {
          const top =
            targetRect.top + targetRect.height / 2 - 80
          let left = targetRect.left - tooltipWidth - gap
          if (left < viewportMargin) {
            // fallback à droite
            left = targetRect.right + gap
          }
          style = { top, left }
          break
        }
        case 'right': {
          const top =
            targetRect.top + targetRect.height / 2 - 80
          let left = targetRect.right + gap
          if (left + tooltipWidth > window.innerWidth - viewportMargin) {
            // fallback à gauche
            left = targetRect.left - tooltipWidth - gap
          }
          style = { top, left }
          break
        }
      }

      setTooltipStyle(style)

      // Highlight l'élément cible
      removeHighlights()
      targetEl.classList.add('tour-highlight')
    },
    [removeHighlights],
  )

  useEffect(() => {
    if (isVisible) {
      positionTooltip(currentStep)
      const onResize = () => positionTooltip(currentStep)
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }
  }, [isVisible, currentStep, positionTooltip])

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }

  const completeTour = () => {
    setIsVisible(false)
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    removeHighlights()
  }

  if (!isVisible) return null

  const step = TOUR_STEPS[currentStep]
  const isLast = currentStep === TOUR_STEPS.length - 1

  return (
    <>
      {/* Overlay semi-transparent */}
      <div className="tour-overlay" onClick={(e) => e.stopPropagation()} />

      {/* Tooltip */}
      <div
        className="tour-tooltip"
        style={{
          position: 'fixed',
          zIndex: 1002,
          width: 320,
          ...tooltipStyle,
        }}
      >
        <button
          className="tour-close"
          onClick={completeTour}
          aria-label="Fermer le tour"
        >
          <X size={16} />
        </button>

        <div className="tour-step-indicator">
          {TOUR_STEPS.map((_, i) => (
            <span
              key={i}
              className={`tour-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'done' : ''}`}
            />
          ))}
        </div>

        <h3 className="tour-step-title">{step.title}</h3>
        <p className="tour-step-desc">{step.description}</p>

        <div className="tour-actions">
          {currentStep > 0 ? (
            <button className="tour-btn tour-btn-secondary" onClick={prevStep}>
              <ChevronLeft size={16} />
              Retour
            </button>
          ) : (
            <button
              className="tour-btn tour-btn-secondary"
              onClick={completeTour}
            >
              <X size={16} />
              Passer
            </button>
          )}
          <button className="tour-btn tour-btn-primary" onClick={nextStep}>
            {isLast ? (
              <>
                <Check size={16} />
                C&apos;est parti !
              </>
            ) : (
              <>
                Suivant
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .tour-overlay {
          position: fixed;
          inset: 0;
          background: rgba(8, 7, 5, 0.65);
          z-index: 1000;
          animation: tourFadeIn 0.3s ease;
        }

        :global(.tour-highlight) {
          position: relative;
          z-index: 1001 !important;
          box-shadow: 0 0 0 4px var(--gold),
            0 0 30px rgba(201, 168, 76, 0.4) !important;
          border-radius: var(--r-lg) !important;
          transition: box-shadow 0.3s ease;
        }

        .tour-tooltip {
          background: var(--card);
          border: 1px solid var(--gold-line);
          border-radius: var(--r-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-lg), 0 0 40px rgba(201, 168, 76, 0.15);
          animation: tourSlideUp 0.3s ease;
        }

        .tour-close {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: none;
          border: none;
          color: var(--text-3);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: var(--r-xs);
          transition: color 0.2s;
        }
        .tour-close:hover {
          color: var(--text);
        }

        .tour-step-indicator {
          display: flex;
          gap: 6px;
          margin-bottom: 1rem;
        }
        .tour-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--b2);
          transition: all 0.3s ease;
        }
        .tour-dot.active {
          background: var(--gold);
          box-shadow: 0 0 8px rgba(201, 168, 76, 0.4);
        }
        .tour-dot.done {
          background: var(--sage);
        }

        .tour-step-title {
          font-family: var(--display);
          font-size: 1.25rem;
          color: var(--text);
          margin: 0 0 0.5rem;
          line-height: 1.3;
        }

        .tour-step-desc {
          font-size: 0.875rem;
          color: var(--text-2);
          margin: 0 0 1.25rem;
          line-height: 1.6;
        }

        .tour-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        .tour-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1rem;
          border-radius: var(--r);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .tour-btn-primary {
          background: var(--gold);
          color: #1a1714;
        }
        .tour-btn-primary:hover {
          background: var(--gold-hi);
        }

        .tour-btn-secondary {
          background: transparent;
          color: var(--text-3);
          border: 1px solid var(--b1);
        }
        .tour-btn-secondary:hover {
          color: var(--text);
          border-color: var(--b2);
        }

        @keyframes tourFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes tourSlideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}
