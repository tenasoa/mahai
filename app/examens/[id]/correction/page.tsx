import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { GraduationCap, ArrowRight, CheckCircle, Bot } from 'lucide-react'

interface CorrectionPageProps {
  params: Promise<{ id: string }>
}

export default async function ExamCorrectionPage({ params }: CorrectionPageProps) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const correctionOptions = [
    {
      id: 'ia',
      type: 'IA',
      icon: Bot,
      credits: 15,
      description: 'Correction générée par intelligence artificielle. Explications détaillées et méthode de résolution.',
      color: 'purple',
    },
    {
      id: 'prof',
      type: 'Professeur',
      icon: GraduationCap,
      credits: 30,
      description: 'Correction détaillée par un professeur certifié. Feedback personnalisé et conseils.',
      color: 'blue',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Link
          href={`/examens/${id}/results`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Retour aux résultats
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Corrections disponibles
          </h1>
          <p className="text-gray-600">
            Comprenez vos erreurs et améliorez-vous
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {correctionOptions.map((option) => (
            <div
              key={option.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
            >
              <div className={`w-14 h-14 rounded-full bg-${option.color}-100 flex items-center justify-center mb-4`}>
                <option.icon className={`w-7 h-7 text-${option.color}-600`} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Correction {option.type}
              </h3>
              
              <p className="text-gray-600 mb-4 text-sm">
                {option.description}
              </p>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-gray-900">{option.credits}</span>
                <span className="text-gray-500">crédits</span>
              </div>

              <button
                className={`w-full py-3 px-4 bg-${option.color}-600 text-white font-medium rounded-lg hover:bg-${option.color}-700 transition-colors`}
              >
                Acheter la correction
              </button>

              <div className="mt-4 space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Réponses détaillées</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Explications claires</span>
                </div>
                {option.id === 'prof' && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Feedback personnalisé</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-100 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Pourquoi acheter une correction ?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Comprenez vos erreurs et ne les recommettez pas</li>
            <li>• Apprenez la méthodologie pour résoudre les problèmes</li>
            <li>• Identifiez vos points forts et vos axes d'amélioration</li>
            <li>• Préparez-vous efficacement pour le vrai examen</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
