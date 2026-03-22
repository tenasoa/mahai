'use client'

import { useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastOptions {
  duration?: number
}

export function useToast() {
  const showToast = useCallback((type: ToastType, title: string, message: string, options: ToastOptions = {}) => {
    const { duration = 4000 } = options
    
    // Créer l'événement toast
    const id = Date.now()
    const event = new CustomEvent('toast', { 
      detail: { 
        id, 
        type, 
        title, 
        message 
      } 
    })
    window.dispatchEvent(event)
    
    // Auto-dismiss après la durée spécifiée
    setTimeout(() => {
      const closeEvent = new CustomEvent('toast-close', { 
        detail: { id } 
      })
      window.dispatchEvent(closeEvent)
    }, duration)
  }, [])

  const success = useCallback((title: string, message: string, options?: ToastOptions) => {
    showToast('success', title, message, options)
  }, [showToast])

  const error = useCallback((title: string, message: string, options?: ToastOptions) => {
    showToast('error', title, message, options)
  }, [showToast])

  const info = useCallback((title: string, message: string, options?: ToastOptions) => {
    showToast('info', title, message, options)
  }, [showToast])

  const warning = useCallback((title: string, message: string, options?: ToastOptions) => {
    showToast('warning', title, message, options)
  }, [showToast])

  return {
    showToast,
    success,
    error,
    info,
    warning
  }
}
