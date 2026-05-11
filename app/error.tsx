'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--void)]">
      <div className="text-center max-w-md px-6">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-[var(--ivory)] mb-3">
          Une erreur est survenue
        </h1>
        <p className="text-[var(--text-3)] mb-8">
          Quelque chose s&apos;est mal passé. Notre équipe a été notifiée automatiquement.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[var(--gold)] text-[var(--void)] font-semibold rounded-lg hover:bg-[var(--gold-hi)] transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
