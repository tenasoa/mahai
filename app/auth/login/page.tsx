"use client"

import { LoginForm } from '@/components/auth/LoginForm'
import { Logo } from '@/components/common/Logo'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-16 pb-8 px-6 relative overflow-hidden bg-void auth-page">
      {/* Ambient Orbs - Matches reference styles */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="auth-wrap" style={{ maxWidth: '440px' }}>
        <div className="auth-logo" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Logo size="lg" />
        </div>
        
        <div className="auth-card" style={{ 
          background: 'var(--card)', 
          border: '1px solid var(--b1)', 
          borderRadius: 'var(--r-lg)', 
          padding: '2.5rem', 
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
        }}>
          <h1 className="auth-title" style={{ 
            fontFamily: 'var(--display)', 
            fontSize: '2rem', 
            fontWeight: 400, 
            color: 'var(--text)', 
            letterSpacing: '-0.02em', 
            textAlign: 'center', 
            marginBottom: '0.5rem',
            lineHeight: 1.2
          }}>
            Bon retour,<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>connectez-vous</em>
          </h1>
          <p className="auth-sub" style={{ 
            fontSize: '0.82rem', 
            color: 'var(--text-3)', 
            textAlign: 'center', 
            marginBottom: '2rem', 
            lineHeight: 1.6 
          }}>
            Accédez à vos sujets, corrections IA et à votre wallet de crédits.
          </p>
          
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
