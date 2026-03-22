"use client"

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-16 pb-8 px-6 relative overflow-hidden bg-void auth-page">
      {/* Ambient Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="auth-wrap" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="auth-logo" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2"
            style={{ 
              fontFamily: 'var(--display)', 
              fontSize: '2rem', 
              fontWeight: 600, 
              color: 'var(--text)', 
              textDecoration: 'none', 
              letterSpacing: '-0.02em' 
            }}
          >
            Mah<span className="logo-gem" style={{ 
              width: '9px', 
              height: '9px', 
              background: 'var(--gold)', 
              borderRadius: '50%', 
              boxShadow: '0 0 12px rgba(201,168,76,0.5)',
              animation: 'gemPulse 3s ease-in-out infinite'
            }}></span>AI
          </Link>
        </div>
        
        <ForgotPasswordForm onComplete={() => window.location.href = '/auth/login'} />
      </div>
    </div>
  )
}
