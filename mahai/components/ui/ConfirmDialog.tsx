'use client'

import { useState } from 'react'
import { AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { AdminModal } from '../admin/AdminModal'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info' | 'success'
  isConfirming?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  isConfirming = false
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false)
  const loading = isConfirming || internalLoading

  const handleConfirm = async () => {
    setInternalLoading(true)
    try {
      await onConfirm()
    } catch (e) {
      console.error(e)
    } finally {
      setInternalLoading(false)
    }
  }

  const variantConfig = {
    danger: { 
      bg: 'var(--ruby-dim)', 
      border: 'var(--ruby-line)', 
      color: 'var(--ruby)', 
      hoverBg: '#E06070', // Lighter ruby for hover if needed
      icon: AlertTriangle 
    },
    warning: { 
      bg: 'var(--amber-dim)', 
      border: 'var(--amber-line)', 
      color: 'var(--amber)', 
      hoverBg: '#E89A3C',
      icon: AlertTriangle 
    },
    info: { 
      bg: 'var(--blue-dim)', 
      border: 'var(--blue-line)', 
      color: '#5B9BD5', 
      hoverBg: '#7FB2E5',
      icon: Info 
    },
    success: { 
      bg: 'var(--sage-dim)', 
      border: 'var(--sage-line)', 
      color: '#8ECAAC', 
      hoverBg: '#A8DBC1',
      icon: AlertCircle // Or CheckCircle if available
    }
  }

  const config = variantConfig[variant]
  const Icon = config.icon

  const actions = (
    <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
      <button
        onClick={onClose}
        disabled={loading}
        style={{
          flex: 1,
          padding: '0.75rem',
          borderRadius: 'var(--r)',
          border: '1px solid var(--b2)',
          background: 'transparent',
          color: 'var(--text)',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--body)',
          fontWeight: 500,
          opacity: loading ? 0.6 : 1,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => !loading && (e.currentTarget.style.borderColor = 'var(--text-3)')}
        onMouseLeave={(e) => !loading && (e.currentTarget.style.borderColor = 'var(--b2)')}
      >
        {cancelLabel}
      </button>
      <button
        onClick={handleConfirm}
        disabled={loading}
        style={{
          flex: 1,
          padding: '0.75rem',
          borderRadius: 'var(--r)',
          border: `1px solid ${config.border}`,
          background: config.bg,
          color: config.color,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--body)',
          fontWeight: 600,
          opacity: loading ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.background = config.color
            e.currentTarget.style.color = 'var(--void)'
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.background = config.bg
            e.currentTarget.style.color = config.color
          }
        }}
      >
        {loading && <span className="animate-spin">⟳</span>}
        {loading ? 'Traitement...' : confirmLabel}
      </button>
    </div>
  )

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={actions}
      size="sm"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.5rem 0' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: config.bg,
            border: `1px solid ${config.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: config.color
          }}
        >
          <Icon size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
            {description}
          </p>
        </div>
      </div>
    </AdminModal>
  )
}
