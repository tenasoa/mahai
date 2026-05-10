'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface AIProcessingLoadingProps {
  title?: string
  steps?: string[]
  currentStep?: number
  className?: string
  showSteps?: boolean
}

const DEFAULT_STEPS = [
  'Lecture des réponses',
  'Analyse sémantique',
  'Évaluation des résultats',
  'Génération du rapport',
]

/**
 * Composant de loading pour la correction IA
 * Style: Cercles pulsants avec ligne de scan (inspiré du design luxury)
 */
export function AIProcessingLoading({
  title = 'Correction en cours',
  steps = DEFAULT_STEPS,
  currentStep: controlledStep,
  className,
  showSteps = true,
}: AIProcessingLoadingProps) {
  const [activeStep, setActiveStep] = useState(0)
  const currentStep = controlledStep ?? activeStep

  // Animation auto des steps si non contrôlé
  useEffect(() => {
    if (controlledStep !== undefined) return

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [controlledStep, steps.length])

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'py-12 px-6',
        className
      )}
    >
      {/* Scène avec cercles pulsants */}
      <div className="relative w-[160px] h-[160px] mb-8" aria-hidden="true">
        {/* Cercles pulsants */}
        {[0, 16, 32].map((inset, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-[var(--gold-line)] animate-[ripple_2.4s_ease-in-out_infinite]"
            style={{
              inset: `${inset}px`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}

        {/* Scan line */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div
            className="absolute left-0 right-0 h-[2px] animate-[scan_2s_ease-in-out_infinite]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.6), transparent)',
            }}
          />
        </div>

        {/* Cœur avec icône */}
        <div
          className="absolute flex items-center justify-center rounded-full bg-[var(--gold-dim)] border border-[var(--gold-line)] animate-[iconBeat_1.6s_ease-in-out_infinite]"
          style={{ inset: '48px' }}
        >
          <span className="text-2xl">🤖</span>
        </div>
      </div>

      {/* Titre */}
      <h2 className="font-[family-name:var(--display)] text-2xl text-[var(--text)] tracking-tight text-center mb-2">
        {title.split(' ').slice(0, -1).join(' ')}{' '}
        <em className="text-[var(--gold)]">{title.split(' ').slice(-1)}</em>
        …
      </h2>

      {/* Étapes */}
      {showSteps && (
        <div className="flex flex-col gap-2 mt-6 min-w-[260px]">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-3 font-[family-name:var(--mono)] text-xs tracking-wide transition-colors duration-300',
                index < currentStep && 'text-[var(--text-2)]', // done
                index === currentStep && 'text-[var(--gold)]', // active
                index > currentStep && 'text-[var(--text-3)]' // pending
              )}
            >
              {/* Indicateur d'étape */}
              <span
                className={cn(
                  'w-4 h-4 rounded-full border flex items-center justify-center text-[0.55rem] flex-shrink-0 transition-all duration-300',
                  index < currentStep
                    ? 'border-[var(--text-2)]'
                    : index === currentStep
                      ? 'border-[var(--gold)] bg-[var(--gold-dim)] animate-[gemPulse_1s_ease-in-out_infinite]'
                      : 'border-[var(--text-3)]'
                )}
              >
                {index < currentStep ? '✓' : index === currentStep ? '·' : '·'}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Variante compacte pour les petits espaces
 */
export function AIProcessingLoadingCompact({
  message = 'Correction IA...',
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Spinner simple */}
      <div className="relative w-6 h-6" aria-hidden="true">
        <span className="absolute inset-0 rounded-full border border-[var(--b2)] border-t-[var(--gold)] animate-spin" />
        <span
          className="absolute rounded-full border border-[var(--b2)] border-t-[var(--gold-lo)] opacity-50 animate-spin"
          style={{ inset: '3px', animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
      </div>
      <span className="text-sm text-[var(--text-2)] font-[family-name:var(--mono)] text-xs">
        {message}
      </span>
    </div>
  )
}

/**
 * Overlay plein écran pour la génération PDF
 */
export function PDFGeneratingOverlay({ isOpen }: { isOpen: boolean }) {
  const steps = [
    'Vérification des droits',
    'Capture du contenu',
    'Rendu des formules',
    'Assemblage du PDF',
    'Ajout du filigrane',
  ]
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (!isOpen) { setActiveStep(0); return }
    const timings = [800, 2200, 4000, 5800, 7200]
    const timers = timings.map((delay, i) =>
      window.setTimeout(() => setActiveStep(i), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[var(--void)]/95 backdrop-blur-sm">
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--b1)] p-8 shadow-lg flex flex-col items-center">
        {/* Icône animée PDF */}
        <div className="relative w-[100px] h-[100px] mb-6" aria-hidden="true">
          {[0, 10, 20].map((inset, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-[var(--gold-line)] animate-[ripple_2.4s_ease-in-out_infinite]"
              style={{ inset: `${inset}px`, animationDelay: `${i * 0.5}s` }}
            />
          ))}
          <div
            className="absolute flex items-center justify-center rounded-full bg-[var(--gold-dim)] border border-[var(--gold-line)] animate-[iconBeat_1.6s_ease-in-out_infinite]"
            style={{ inset: '30px' }}
          >
            <span className="text-xl">📄</span>
          </div>
        </div>

        <h2 className="font-[family-name:var(--display)] text-xl text-[var(--text)] tracking-tight text-center mb-1">
          Génération du <em className="text-[var(--gold)]">PDF</em>…
        </h2>
        <p className="text-[var(--text-3)] text-xs mb-5 text-center font-[family-name:var(--mono)]">
          Merci de patienter, ne quittez pas la page
        </p>

        <div className="flex flex-col gap-2 min-w-[220px]">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-3 font-[family-name:var(--mono)] text-xs tracking-wide transition-colors duration-500',
                index < activeStep && 'text-[var(--text-2)]',
                index === activeStep && 'text-[var(--gold)]',
                index > activeStep && 'text-[var(--text-3)]'
              )}
            >
              <span
                className={cn(
                  'w-4 h-4 rounded-full border flex items-center justify-center text-[0.55rem] flex-shrink-0 transition-all duration-300',
                  index < activeStep
                    ? 'border-[var(--text-2)]'
                    : index === activeStep
                      ? 'border-[var(--gold)] bg-[var(--gold-dim)] animate-[gemPulse_1s_ease-in-out_infinite]'
                      : 'border-[var(--text-3)]'
                )}
              >
                {index < activeStep ? '✓' : '·'}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Overlay plein écran pour la correction IA
 */
export function AIProcessingOverlay({
  isOpen,
  title,
  steps,
  currentStep,
}: {
  isOpen: boolean
  title?: string
  steps?: string[]
  currentStep?: number
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[var(--void)]/95 backdrop-blur-sm">
      <AIProcessingLoading
        title={title}
        steps={steps}
        currentStep={currentStep}
        className="bg-[var(--card)] rounded-2xl border border-[var(--b1)] p-8 shadow-lg"
      />
    </div>
  )
}
