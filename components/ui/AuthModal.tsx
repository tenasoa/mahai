"use client"

import Link from "next/link"
import { useEffect, useId, useRef } from "react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
}

const FOCUSABLE_SELECTOR =
  'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function AuthModal({ isOpen, onClose, title, message }: AuthModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!isOpen) return

    previouslyFocusedElement.current = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current

    if (!dialog) return

    const getFocusableElements = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true'
      )

    const focusableElements = getFocusableElements()
    const initialFocusTarget = focusableElements[0] ?? dialog

    document.body.style.overflow = 'hidden'
    initialFocusTarget.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const currentFocusableElements = getFocusableElements()

      if (currentFocusableElements.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const firstElement = currentFocusableElements[0]
      const lastElement = currentFocusableElements[currentFocusableElements.length - 1]
      const activeElement = document.activeElement as HTMLElement | null

      if (event.shiftKey) {
        if (activeElement === firstElement || activeElement === dialog) {
          event.preventDefault()
          lastElement.focus()
        }
        return
      }

      if (activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedElement.current?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const modalTitle = title || 'Authentification requise'
  const modalMessage =
    message || 'Connectez-vous ou créez un compte pour accéder à cette fonctionnalité'

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="auth-modal-overlay"
      onClick={handleOverlayClick}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        ref={dialogRef}
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--card)',
          border: '1px solid var(--b1)',
          borderRadius: 'var(--r-lg)',
          padding: '2rem',
          maxWidth: '440px',
          width: '90%',
          boxShadow: 'var(--glow-lg)',
          animation: 'slideUp 0.3s ease'
        }}
      >
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div
            aria-hidden="true"
            style={{
              fontSize: '2.5rem',
              marginBottom: '0.75rem'
            }}
          >
            🔒
          </div>
          <h2
            id={titleId}
            style={{
              fontFamily: 'var(--display)',
              fontSize: '1.4rem',
              fontWeight: 400,
              color: 'var(--text)',
              letterSpacing: '-.02em',
              marginBottom: '0.5rem'
            }}
          >
            {modalTitle}
          </h2>
          <p
            id={descriptionId}
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-3)',
              lineHeight: 1.6
            }}
          >
            {modalMessage}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <Link
            href="/auth/login"
            onClick={() => onClose()}
            className="auth-action auth-action-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--r)',
              background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))',
              color: 'var(--void)',
              fontFamily: 'var(--body)',
              fontSize: '0.85rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 2px 12px rgba(168,134,58,0.22)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Connexion
          </Link>

          <Link
            href="/auth/register"
            onClick={() => onClose()}
            className="auth-action auth-action-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--r)',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontFamily: 'var(--body)',
              fontSize: '0.85rem',
              fontWeight: 500,
              textDecoration: 'none',
              border: '1px solid var(--b1)',
              transition: 'all 0.2s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Créer un compte
          </Link>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="auth-modal-dismiss"
          style={{
            width: '100%',
            marginTop: '1rem',
            padding: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-4)',
            fontFamily: 'var(--mono)',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            cursor: 'none',
            transition: 'color 0.2s'
          }}
        >
          Fermer
        </button>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .auth-action:hover {
          transform: translateY(-1px);
        }

        .auth-action-primary:hover {
          box-shadow: 0 4px 20px rgba(168,134,58,0.35);
        }

        .auth-action-secondary:hover {
          background: var(--card) !important;
          border-color: var(--gold-line) !important;
        }

        .auth-modal-dismiss:hover {
          color: var(--text-3) !important;
        }
      `}</style>
    </div>
  )
}
