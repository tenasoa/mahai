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
    <html lang="fr">
      <body style={{ margin: 0, background: '#0a0a0f', fontFamily: 'sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 24px' }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>⚠️</div>
            <h1 style={{ color: '#f5f0e8', fontSize: 24, marginBottom: 12 }}>
              Erreur critique
            </h1>
            <p style={{ color: '#a09880', marginBottom: 32 }}>
              L&apos;application a rencontré une erreur inattendue. Notre équipe a été notifiée.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                background: '#FFD166',
                color: '#0a0a0f',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
