"use client"

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { Logo } from '@/components/common/Logo'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-16 pb-8 px-6 relative overflow-hidden bg-void auth-page">
      {/* Ambient Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="auth-wrap" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="auth-logo" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Logo size="lg" />
        </div>
        
        <ForgotPasswordForm onComplete={() => window.location.href = '/auth/login'} />
      </div>
    </div>
  )
}
