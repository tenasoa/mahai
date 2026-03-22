"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
}

export function AuthModal({ isOpen, onClose, title, message }: AuthModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="auth-modal-overlay"
      onClick={handleOverlayClick}
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
        className="auth-modal"
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
        {/* Header */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '0.75rem'
          }}>🔒</div>
          <h2 style={{
            fontFamily: 'var(--display)',
            fontSize: '1.4rem',
            fontWeight: 400,
            color: 'var(--text)',
            letterSpacing: '-.02em',
            marginBottom: '0.5rem'
          }}>
            {title || 'Authentification requise'}
          </h2>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-3)',
            lineHeight: 1.6
          }}>
            {message || 'Connectez-vous ou créez un compte pour accéder à cette fonctionnalité'}
          </p>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <Link
            href="/auth/login"
            onClick={() => onClose()}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(168,134,58,0.35)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(168,134,58,0.22)'
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--card)'
              e.currentTarget.style.borderColor = 'var(--gold-line)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--surface)'
              e.currentTarget.style.borderColor = 'var(--b1)'
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

        {/* Close button */}
        <button
          onClick={onClose}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-4)'
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
      `}</style>
    </div>
  )
}
