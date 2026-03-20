'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  actions,
  size = 'md'
}: AdminModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  }

  return (
    <div className="admin-overlay open" onClick={onClose}>
      <div
        className={`admin-modal ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{title}</h3>
            {subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>{subtitle}</p>}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>

        {actions && (
          <div className="modal-footer">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
