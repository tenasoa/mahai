'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { AdminModal } from './AdminModal'

interface AdminConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  isConfirming?: boolean
}

export function AdminConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  isConfirming = false
}: AdminConfirmDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  const variantColors = {
    danger: { bg: 'var(--ruby-dim)', border: 'var(--ruby-line)', color: '#E06070', icon: '#E06070' },
    warning: { bg: 'var(--amber-dim)', border: 'var(--amber-line)', color: 'var(--amber)', icon: 'var(--amber)' },
    info: { bg: 'var(--blue-dim)', border: 'var(--blue-line)', color: '#5B9BD5', icon: '#5B9BD5' }
  }

  const colors = variantColors[variant]

  const actions = (
    <>
      <button
        className="admin-btn admin-btn-outline"
        onClick={onClose}
        disabled={loading || isConfirming}
        style={{ flex: 1 }}
      >
        {cancelLabel}
      </button>
      <button
        className="admin-btn"
        onClick={handleConfirm}
        disabled={loading || isConfirming}
        style={{
          flex: 1,
          background: loading || isConfirming ? 'var(--text-4)' : colors.bg,
          border: `1px solid ${colors.border}`,
          color: colors.color
        }}
      >
        {loading || isConfirming ? '...' : confirmLabel}
      </button>
    </>
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
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: colors.icon
          }}
        >
          <AlertTriangle size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.5 }}>
            {description}
          </p>
        </div>
      </div>
    </AdminModal>
  )
}
