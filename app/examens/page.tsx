import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ExamensPageSkeleton } from '@/components/ui/PageSkeletons'
import { db } from '@/lib/db-client'
import Link from 'next/link'
import { BookOpen, Clock, Trophy, ArrowRight } from 'lucide-react'

export default async function ExamenPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Récupérer tous les examens blancs disponibles
  const exams = await db.examenBlanc.findMany({})

  return (
    <Suspense fallback={<ExamensPageSkeleton />}>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Examens Blancs</h1>
            <p className="text-gray-600 text-lg">Préparez-vous aux examens avec nos sujets corrigés</p>
          </div>

          {exams && exams.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam: any) => (
                <Link
                  key={exam.id}
                  href={`/examens/${exam.id}`}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    {exam.typeExamen && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {exam.typeExamen}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {exam.titre || `${exam.matiere || 'Examen'} ${exam.annee || ''}`}
                  </h3>

                  <div className="space-y-2 mb-4">
                    {exam.matiere && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="font-medium">Matière:</span> {exam.matiere}
                      </p>
                    )}
                    {exam.dureeSecondes && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {Math.floor(exam.dureeSecondes / 60)} min
                      </p>
                    )}
                    {exam.scoreMax && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        {exam.scoreMax} points
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Commencer l'examen</span>
                    <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun examen disponible</h3>
              <p className="text-gray-600 mb-6">De nouveaux examens seront bientôt ajoutés.</p>
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voir le catalogue de sujets
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  )
}
