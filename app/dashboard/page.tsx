import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/client'
import { BookOpen, CreditCard, TrendingUp, Award, Clock, Target } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  let user = null
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        purchases: {
          include: {
            subject: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        examAttempts: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
  }

  if (!user) {
    redirect('/auth/role-selection')
  }

  const stats = {
    credits: user.credits,
    sujetsAchetes: user.purchases.length,
    examsFaits: user.examAttempts.length,
    moyenneExams: user.examAttempts.length > 0
      ? user.examAttempts.reduce((acc, exam) => acc + (exam.score || 0), 0) / user.examAttempts.length
      : 0,
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-content py-8">
        <div className="mb-8">
          <h1 className="text-h1 font-bold text-text">
            Bonjour, {user.prenom} 👋
          </h1>
          <p className="mt-2 text-text-muted">
            Voici votre tableau de bord
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Crédits</p>
                <p className="text-3xl font-bold text-teal">{stats.credits}</p>
              </div>
              <CreditCard className="w-10 h-10 text-teal/30" />
            </div>
            <a href="/credits" className="text-sm text-teal hover:text-teal-secondary mt-2 inline-block">
              Acheter des crédits →
            </a>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Sujets achetés</p>
                <p className="text-3xl font-bold text-green">{stats.sujetsAchetes}</p>
              </div>
              <BookOpen className="w-10 h-10 text-green/30" />
            </div>
            <a href="/dashboard/sujets" className="text-sm text-green hover:text-green/80 mt-2 inline-block">
              Voir mes sujets →
            </a>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Examens faits</p>
                <p className="text-3xl font-bold text-purple">{stats.examsFaits}</p>
              </div>
              <Target className="w-10 h-10 text-purple/30" />
            </div>
            <a href="/examens" className="text-sm text-purple hover:text-purple/80 mt-2 inline-block">
              Passer un examen →
            </a>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Moyenne</p>
                <p className="text-3xl font-bold text-gold">
                  {stats.moyenneExams.toFixed(1)}%
                </p>
              </div>
              <Award className="w-10 h-10 text-gold/30" />
            </div>
            <p className="text-sm text-text-muted mt-2">Continuez comme ça !</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-h3 font-bold text-text mb-4">Sujets récents</h2>
            {user.purchases.length > 0 ? (
              <div className="space-y-3">
                {user.purchases.map((purchase) => {
                  if (!purchase.subject) return null
                  return (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-3 bg-bg3 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-text">{purchase.subject.titre}</p>
                        <p className="text-sm text-text-muted">
                          {purchase.subject.matiere} - {purchase.subject.annee}
                        </p>
                      </div>
                      <a
                        href={`/sujet/${purchase.subject.id}/consult`}
                        className="text-teal hover:text-teal-secondary text-sm font-medium"
                      >
                        Consulter →
                      </a>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Aucun sujet acheté</p>
                <a href="/catalogue" className="text-teal hover:text-teal-secondary mt-2 inline-block">
                  Parcourir le catalogue →
                </a>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-h3 font-bold text-text mb-4">Derniers examens</h2>
            {user.examAttempts.length > 0 ? (
              <div className="space-y-3">
                {user.examAttempts.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-3 bg-bg3 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-text">{exam.titre}</p>
                      <p className="text-sm text-text-muted">
                        {exam.matiere} - {exam.typeExamen}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green">
                        {exam.score ? `${exam.score}%` : 'En attente'}
                      </p>
                      <p className="text-xs text-text-muted">
                        {exam.percentile ? `Top ${exam.percentile}%` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Aucun examen passé</p>
                <a href="/examens" className="text-teal hover:text-teal-secondary mt-2 inline-block">
                  Passer un examen →
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 card">
          <h2 className="text-h3 font-bold text-text mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a
              href="/catalogue"
              className="flex flex-col items-center justify-center p-4 bg-bg3 hover:bg-white/5 rounded-lg transition-colors"
            >
              <BookOpen className="w-8 h-8 text-teal mb-2" />
              <span className="text-sm font-medium text-text">Catalogue</span>
            </a>
            <a
              href="/credits"
              className="flex flex-col items-center justify-center p-4 bg-bg3 hover:bg-white/5 rounded-lg transition-colors"
            >
              <CreditCard className="w-8 h-8 text-green mb-2" />
              <span className="text-sm font-medium text-text">Crédits</span>
            </a>
            <a
              href="/examens"
              className="flex flex-col items-center justify-center p-4 bg-bg3 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Target className="w-8 h-8 text-purple mb-2" />
              <span className="text-sm font-medium text-text">Examens</span>
            </a>
            <a
              href="/profile"
              className="flex flex-col items-center justify-center p-4 bg-bg3 hover:bg-white/5 rounded-lg transition-colors"
            >
              <TrendingUp className="w-8 h-8 text-gold mb-2" />
              <span className="text-sm font-medium text-text">Profil</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
