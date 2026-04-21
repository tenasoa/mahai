"use client"

import Link from "next/link"
import { useEffect, useId, useRef } from "react"
import { Lock, LogIn, UserPlus } from "lucide-react"
import "@/components/modals/Modal.css"

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
    >
      <div
        ref={dialogRef}
        className="auth-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-modal-head">
          <div className="auth-modal-icon" aria-hidden="true">
            <Lock size={36} />
          </div>
          <h2 id={titleId} className="auth-modal-title">{modalTitle}</h2>
          <p id={descriptionId} className="auth-modal-desc">{modalMessage}</p>
        </div>

        <div className="auth-modal-actions">
          <Link
            href="/auth/login"
            onClick={() => onClose()}
            className="auth-modal-btn-primary"
          >
            <LogIn size={18} />
            Connexion
          </Link>
          <Link
            href="/auth/register"
            onClick={() => onClose()}
            className="auth-modal-btn-secondary"
          >
            <UserPlus size={18} />
            Créer un compte
          </Link>
        </div>

        <button type="button" onClick={onClose} className="auth-modal-dismiss">
          Fermer
        </button>
      </div>
    </div>
  )
}
