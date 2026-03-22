import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function ExamResultsPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // TODO: Implement exam results with SQL
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Résultats de l'examen {params.id}</h1>
        <p className="text-gray-600">Cette page est en cours de développement.</p>
      </div>
    </div>
  )
}
