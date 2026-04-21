"use client"

import { Suspense } from 'react'
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm'
import { AuthPageSkeleton } from '@/components/ui/PageSkeletons'
import { Logo } from '@/components/common/Logo'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-16 pb-8 px-6 relative overflow-hidden bg-void auth-page">
      {/* Ambient Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="auth-wrap" style={{ 
        width: '100%', 
        maxWidth: '440px',
        animation: 'fadeUp 0.6s ease both'
      }}>
        <div className="auth-logo" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Logo size="md" />
        </div>
        
        <div className="auth-card" style={{ 
          background: 'var(--card)', 
          border: '1px solid var(--b1)', 
          borderRadius: 'var(--r-lg)', 
          padding: '2.5rem', 
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            opacity: 0.45,
          }} />
          
          <VerifyEmailForm 
            email={email}
            onComplete={(nextUrl) => window.location.href = nextUrl} 
          />
        </div>
      </div>

      <div className="auth-footer" style={{ 
        marginTop: '1.25rem', 
        textAlign: 'center', 
        fontSize: '0.78rem', 
        color: 'var(--text-3)' 
      }}>
        Déjà vérifié ? <Link href="/auth/login" style={{ color: 'var(--gold)', textDecoration: 'none', transition: 'color 0.2s' }}>Se connecter</Link>
        &nbsp;·&nbsp; <Link href="#" onClick={() => alert('Support : support@mah.ai')} style={{ color: 'var(--text-3)', textDecoration: 'none', transition: 'color 0.2s' }}>Contacter le support</Link>
      </div>
    </div>
  )
}
