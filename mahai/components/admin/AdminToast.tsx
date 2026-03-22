'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, X, Info, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface AdminToastProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function AdminToastContainer({ toasts, onRemove }: AdminToastProps) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <AdminToast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}

interface AdminToastItemProps {
  type: ToastType
  title: string
  message?: string
  onClose: () => void
}

function AdminToast({ type, title, message, onClose }: AdminToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: <CheckCircle2 size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
    warning: <AlertTriangle size={18} />
  }

  return (
    <div className={`admin-toast ${type}`}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1 }}>
        <div style={{ flexShrink: 0, color: type === 'success' ? '#8ECAAC' : type === 'error' ? '#E06070' : type === 'warning' ? 'var(--amber)' : '#5B9BD5' }}>
          {icons[type]}
        </div>
        <div>
          <div className="toast-title">{title}</div>
          {message && <div className="toast-msg">{message}</div>}
        </div>
      </div>
      <button className="toast-close-btn" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  )
}

// Hook for using toasts
export function useAdminToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, type, title, message }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const success = (title: string, message?: string) => addToast('success', title, message)
  const error = (title: string, message?: string) => addToast('error', title, message)
  const info = (title: string, message?: string) => addToast('info', title, message)
  const warning = (title: string, message?: string) => addToast('warning', title, message)

  return {
    toasts,
    success,
    error,
    info,
    warning,
    removeToast
  }
}
