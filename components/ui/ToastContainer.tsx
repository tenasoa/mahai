'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

interface Toast {
  id: number
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handleToast = (e: any) => {
      setToasts(prev => [...prev, e.detail])
    }
    
    const handleCloseToast = (e: any) => {
      setToasts(prev => prev.filter(t => t.id !== e.detail.id))
    }

    window.addEventListener('toast' as any, handleToast)
    window.addEventListener('toast-close' as any, handleCloseToast)

    return () => {
      window.removeEventListener('toast' as any, handleToast)
      window.removeEventListener('toast-close' as any, handleCloseToast)
    }
  }, [])

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} />
      case 'error': return <AlertCircle size={18} />
      case 'info': return <Info size={18} />
      case 'warning': return <AlertTriangle size={18} />
      default: return <Info size={18} />
    }
  }

  const getToastColor = (type: string) => {
    switch (type) {
      case 'success': return '#5BA85A'
      case 'error': return '#E06070'
      case 'info': return '#5B9BD5'
      case 'warning': return '#E89A3C'
      default: return '#5B9BD5'
    }
  }

  return (
    <div className="toast-container" style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      pointerEvents: 'none'
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="toast"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            background: 'var(--card)',
            border: '1px solid var(--b1)',
            borderLeft: `3px solid ${getToastColor(toast.type)}`,
            borderRadius: 'var(--r-lg)',
            padding: '1rem 1.25rem',
            minWidth: '280px',
            maxWidth: '360px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.5)',
            pointerEvents: 'all',
            animation: 'toastIn 0.4s ease both',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ 
            color: getToastColor(toast.type), 
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center'
          }}>
            {getToastIcon(toast.type)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: '0.8rem', 
              fontWeight: 500, 
              color: 'var(--text)',
              marginBottom: '0.12rem'
            }}>
              {toast.title}
            </div>
            <div style={{ 
              fontSize: '0.74rem', 
              color: 'var(--text-2)',
              lineHeight: 1.5
            }}>
              {toast.message}
            </div>
          </div>
          <button
            onClick={() => {
              const closeEvent = new CustomEvent('toast-close', { 
                detail: { id: toast.id } 
              })
              window.dispatchEvent(closeEvent)
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-3)',
              fontSize: '0.85rem',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
          >
            <X size={16} />
          </button>
        </div>
      ))}

      <style jsx global>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateX(24px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        @keyframes toastOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
            max-height: 0;
            padding: 0;
            margin: 0;
          }
        }
        .toast.exit {
          animation: toastOut 0.3s ease forwards;
        }
      `}</style>
    </div>
  )
}
