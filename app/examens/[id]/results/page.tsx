import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trophy, TrendingUp, BookOpen, ArrowRight, Users, BarChart3 } from 'lucide-react'

interface ResultsPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ score?: string }>
}

export default async function ExamResultsPage({ params, searchParams }: ResultsPageProps) {
  const { id } = await params
  const { score } = await searchParams

  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const exam = await prisma.examenBlanc.findUnique({
    where: { id },
  })

  if (!exam) {
    redirect('/examens')
  }

  const scoreNum = parseFloat(score || '0')
  const percentage = exam.scoreMax ? (scoreNum / exam.scoreMax) * 100 : 0

  const nationalAverage = 62.5
  const userPercentile = 78
  const totalStudents = 1247

  const questionDetails = [
    { id: 'q1', title: 'Question 1 - Dérivée', points: 5, maxPoints: 5, correct: true },
    { id: 'q2', title: 'Question 2 - Primitive', points: 3, maxPoints: 3, correct: true },
    { id: 'q3', title: 'Question 3 - Équation', points: 0, maxPoints: 2, correct: false },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
              <Trophy className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Résultats de l'examen
            </h1>
            <p className="text-gray-600">{exam.titre}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {scoreNum}
              </div>
              <div className="text-xs text-blue-700">Points</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {percentage.toFixed(1)}%
              </div>
              <div className="text-xs text-green-700">Score</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                Top {100 - userPercentile}%
              </div>
              <div className="text-xs text-purple-700">Classement</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {nationalAverage}%
              </div>
              <div className="text-xs text-orange-700">Moyenne</div>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Performance</span>
              </div>
              <span className={`font-semibold ${
                percentage >= 60 ? 'text-green-600' : percentage >= 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {percentage >= 60 ? 'Excellent' : percentage >= 40 ? 'Bien' : 'À améliorer'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Percentile national</span>
              </div>
              <span className="font-semibold text-blue-600">
                Top {100 - userPercentile}%
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Moyenne nationale</span>
              </div>
              <span className={`font-semibold ${
                percentage >= nationalAverage ? 'text-green-600' : 'text-red-600'
              }`}>
                {percentage >= nationalAverage ? '+' : ''}{(percentage - nationalAverage).toFixed(1)}% vs moyenne
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Détail par exercice</h3>
            <div className="space-y-3">
              {questionDetails.map((q) => (
                <div
                  key={q.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    q.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      q.correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {q.correct ? '✓' : '✗'}
                    </span>
                    <span className="font-medium text-gray-900">{q.title}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${q.correct ? 'text-green-600' : 'text-red-600'}`}>
                      {q.points}/{q.maxPoints}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Prochaine étape</h3>
            <div className="grid gap-3">
              <Link
                href={`/examens/${id}/correction`}
                className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <span className="text-purple-700 font-medium">Acheter la correction IA</span>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-600" />
              </Link>
              <Link
                href="/examens"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ArrowRight className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">Refaire un autre examen</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </Link>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="block w-full py-3 px-4 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  )
}
