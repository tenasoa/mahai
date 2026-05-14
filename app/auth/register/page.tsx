"use client"

import { Suspense } from 'react'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Logo } from '@/components/common/Logo'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-16 pb-8 px-6 relative overflow-hidden bg-void auth-page">
      {/* Ambient Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="auth-wrap" style={{ maxWidth: '520px' }}>
        <div className="auth-logo">
          <Logo size="lg" />
        </div>

        <div className="auth-card">
          <Suspense fallback={<div className="auth-skeleton-tall" />}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
