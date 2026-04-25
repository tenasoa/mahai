'use client'

import { ReactNode, useEffect, useCallback, useRef } from 'react'
import styles from './Modal.module.css'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEsc?: boolean
  showCloseButton?: boolean
  ariaLabel?: string
  /**
   * Désactive la fermeture (overlay/Esc/bouton ✕) le temps qu'une opération
   * asynchrone se termine. Utile pour les modales de confirmation pendant
   * un appel réseau.
   */
  isLoading?: boolean
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  ariaLabel,
  isLoading = false,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  // Trap focus inside modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!closeOnEsc || isLoading) return

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }

      // Trap focus
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )

        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    },
    [onClose, closeOnEsc, isLoading]
  )

  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousActiveElement.current = document.activeElement

      // Add event listeners
      document.addEventListener('keydown', handleKeyDown)

      // Prevent body scroll (désactivé à la demande de l'utilisateur pour utiliser le scroll navigateur)
      // document.body.style.overflow = 'hidden'

      // Focus first focusable element
      setTimeout(() => {
        if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement

          firstFocusable?.focus()
        }
      }, 0)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // document.body.style.overflow = ''

      // Restore previous focus
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, handleKeyDown])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && !isLoading && e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-label={ariaLabel}
    >
      <div
        ref={modalRef}
        className={`${styles.content} ${styles[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || (showCloseButton && !isLoading)) && (
          <div className={styles.header}>
            {title && (
              <div>
                <h2 id="modal-title" className={styles.title}>
                  {title}
                </h2>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
              </div>
            )}

            {showCloseButton && !isLoading && (
              <button
                onClick={onClose}
                className={styles.closeButton}
                aria-label="Fermer"
                type="button"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}

export default Modal
