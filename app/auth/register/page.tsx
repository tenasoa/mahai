"use client"

import { RegisterForm } from '@/components/auth/RegisterForm'
import { Logo } from '@/components/common/Logo'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-16 pb-8 px-6 relative overflow-hidden bg-void auth-page">
      {/* Ambient Orbs - Matches reference styles */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="auth-wrap" style={{ maxWidth: '520px', width: '100%' }}>
        <div className="auth-logo" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Logo size="lg" />
        </div>
        
        <div className="auth-card" style={{ 
          background: 'var(--card)', 
          border: '1px solid var(--b1)', 
          borderRadius: 'var(--r-lg)', 
          padding: '2.5rem', 
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
        }}>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
