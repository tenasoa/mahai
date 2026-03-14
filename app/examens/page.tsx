import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { BookOpen, Clock, Filter, GraduationCap } from 'lucide-react'
import Link from 'next/link'

export default async function ExamListPage({ searchParams }: { searchParams: Promise<{ type?: string; matiere?: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const params = await searchParams
  const where: any = {}

  if (params.type) where.typeExamen = params.type
  if (params.matiere) where.matiere = params.matiere

  const exams = await prisma.examenBlanc.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const examTypes = ['BAC', 'BEPC', 'CEPE', 'CONCOURS']
  const matieres = ['Maths', 'Physique', 'SVT', 'Histoire-Géo', 'Français']

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-content py-8">
        <div className="mb-8">
          <h1 className="text-h1 font-bold text-text">Examens Blancs</h1>
          <p className="mt-2 text-text-muted">
            Entraînez-vous dans des conditions d'examen réelles
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-teal" />
                <h2 className="font-semibold text-text">Filtres</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Type d'examen
                  </label>
                  <div className="space-y-1">
                    {examTypes.map(type => (
                      <Link
                        key={type}
                        href={`/examens?type=${type}`}
                        className={`block px-3 py-2 rounded-lg text-sm ${
                          params.type === type
                            ? 'bg-teal/10 text-teal'
                            : 'text-text-muted hover:bg-bg3'
                        }`}
                      >
                        {type}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Matière
                  </label>
                  <div className="space-y-1">
                    {matieres.map(matiere => (
                      <Link
                        key={matiere}
                        href={`/examens?matiere=${encodeURIComponent(matiere)}`}
                        className={`block px-3 py-2 rounded-lg text-sm ${
                          params.matiere === matiere
                            ? 'bg-teal/10 text-teal'
                            : 'text-text-muted hover:bg-bg3'
                        }`}
                      >
                        {matiere}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link href="/examens" className="block text-center text-sm text-teal hover:underline">
                  Réinitialiser
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {exams.length === 0 ? (
              <div className="card text-center py-12">
                <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted">Aucun examen disponible</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {exams.map(exam => (
                  <div key={exam.id} className="card hover:border-teal/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-text">{exam.titre}</h3>
                        <p className="text-sm text-text-muted">{exam.matiere}</p>
                      </div>
                      <span className="px-2 py-1 bg-teal/10 text-teal text-xs font-medium rounded">
                        {exam.typeExamen}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{Math.floor(exam.dureeSecondes / 60)} min</span>
                      </div>
                      <span>{exam.annee}</span>
                    </div>

                    <Link
                      href={`/examens/${exam.id}`}
                      className="block w-full py-2 text-center bg-teal text-bg font-medium rounded-lg hover:bg-teal-secondary transition-colors"
                    >
                      Commencer
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
