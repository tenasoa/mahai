import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { RoleSelectionSkeleton } from '@/components/ui/PageSkeletons'

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // TODO: Implement role selection with SQL
  return (
    <Suspense fallback={<RoleSelectionSkeleton />}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sélection de rôle</h1>
          <p className="text-gray-600">Cette page est en cours de développement.</p>
        </div>
      </div>
    </Suspense>
  )
}
