"use client"

import { OnboardingFlow } from '@/components/auth/OnboardingFlow'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-void auth-page overflow-hidden">
      <OnboardingFlow />
    </div>
  )
}
