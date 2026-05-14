"use client"

import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { Logo } from '@/components/common/Logo'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-16 pb-8 px-6 relative overflow-hidden bg-void auth-page">
      {/* Ambient Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="auth-wrap">
        <div className="auth-logo">
          <Logo size="lg" />
        </div>

        <div className="auth-card">
          <h1 className="auth-title">
            Bon retour,<br />
            <em>connectez-vous</em>
          </h1>
          <p className="auth-sub">
            Accédez à vos sujets, corrections IA et à votre wallet de crédits.
          </p>

          <Suspense fallback={<div className="auth-skeleton" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
