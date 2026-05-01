import { Suspense } from 'react'
import { db } from '@/lib/db-client'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trophy, TrendingUp, BookOpen, ArrowRight, Clock, CheckCircle2, Circle, Zap } from 'lucide-react'
import { ExamenResultsSkeleton } from '@/components/ui/PageSkeletons'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import './results.css'

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

  const exam = await db.examenBlanc.findUnique({
    where: { id },
  })

  if (!exam) {
    redirect('/examens')
  }

  const scoreNum = parseFloat(score || '0')
  const percentage = exam.scoreMax ? (scoreNum / exam.scoreMax) * 100 : 0

  const questions = await db.questionExamen.findMany({
    where: { examenId: id },
    orderBy: { numero: 'asc' },
  })
  const totalQuestionPoints = questions.reduce((sum: number, question: { points?: number }) => sum + (question.points || 0), 0)

  return (
    <div className="results-page">
      <LuxuryNavbar />
      <LuxuryCursor />
      
      <Suspense fallback={<ExamenResultsSkeleton />}>
        <main id="main-content" className="results-container">
          <div className="results-header luxury-card">
            <div className="rh-left">
              <div className="rh-trophy">
                <Trophy className="w-10 h-10 text-gold" />
                <div className="rh-trophy-glow"></div>
              </div>
              <div>
                <p className="rh-kicker">Examen Blanc Terminé</p>
                <h1 className="rh-title">{exam.titre}</h1>
                <div className="rh-meta">
                  <span className="rh-meta-item"><Clock size={12} /> Durée enregistrée</span>
                  <span className="rh-meta-item"><CheckCircle2 size={12} /> {exam.scoreMax} points max</span>
                </div>
              </div>
            </div>
            <div className="rh-right">
              <div className="rh-score-big">
                <span className="n text-gold">{scoreNum}</span>
                <span className="slash">/</span>
                <span className="total">{exam.scoreMax}</span>
              </div>
              <div className="rh-percentage">
                Score : <strong>{percentage.toFixed(1)}%</strong>
              </div>
            </div>
          </div>

          <div className="results-grid">
            <div className="grid-column">
              <div className="luxury-card stats-card">
                <div className="card-header">
                  <h3 className="card-title">Analyse de <em>Performance</em></h3>
                  <TrendingUp size={14} className="text-gold" />
                </div>
                <div className="stats-rows">
                  <div className="stat-row">
                    <div className="sr-label">Statut</div>
                    <div className={`sr-val ${percentage >= 50 ? 'text-sage' : 'text-ruby'}`}>
                      {percentage >= 60 ? 'Admis avec mention' : percentage >= 50 ? 'Admis' : 'Ajourné'}
                    </div>
                  </div>
                  <div className="stat-row">
                    <div className="sr-label">Questions</div>
                    <div className="sr-val text-gold">{questions.length}</div>
                  </div>
                  <div className="stat-row">
                    <div className="sr-label">Points des questions</div>
                    <div className="sr-val">{totalQuestionPoints || exam.scoreMax}</div>
                  </div>
                  <div className="stat-row">
                    <div className="sr-label">Correction détaillée</div>
                    <div className="sr-val">Disponible via IA</div>
                  </div>
                </div>
              </div>

              <div className="luxury-card correction-promo-card">
                <div className="cp-bg-glow"></div>
                <div className="card-header">
                  <div className="rh-badge">Premium</div>
                  <h3 className="card-title">Correction <em>IA Détaillée</em></h3>
                </div>
                <div className="cp-body">
                  <p className="cp-text">
                    Ne restez pas sur vos erreurs. Notre IA analyse votre copie et vous explique comment obtenir la note maximale.
                  </p>
                  <ul className="cp-features">
                    <li><CheckCircle2 size={14} /> Analyse pas à pas de vos réponses</li>
                    <li><CheckCircle2 size={14} /> Suggestions d'amélioration personnalisées</li>
                    <li><CheckCircle2 size={14} /> Rappels de cours sur les points faibles</li>
                  </ul>
                  <div className="cp-price">
                    <span className="p-amount">15</span>
                    <span className="p-unit">crédits</span>
                  </div>
                  <Link href={`/examens/${id}/correction`} className="btn-luxury-buy">
                    <Zap size={18} />
                    Débloquer la correction
                  </Link>
                </div>
              </div>

              <div className="luxury-card actions-card">
                <div className="actions-list">
                  <Link href="/examens" className="action-item">
                      <div className="ai-icon"><Clock size={18} /></div>
                      <div className="ai-content">
                        <div className="ai-title">Refaire un autre examen</div>
                      <div className="ai-desc">Continuez l'entraînement avec un nouveau sujet.</div>
                      </div>
                    <ArrowRight size={16} className="ai-arrow" />
                  </Link>
                  <Link href="/catalogue" className="action-item">
                    <div className="ai-icon"><BookOpen size={18} /></div>
                    <div className="ai-content">
                      <div className="ai-title">Explorer le catalogue</div>
                      <div className="ai-desc">Découvrez d'autres sujets d'examen.</div>
                    </div>
                    <ArrowRight size={16} className="ai-arrow" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid-column">
              <div className="luxury-card questions-card">
                <div className="card-header">
                  <h3 className="card-title">Détail par <em>Exercice</em></h3>
                </div>
                <div className="questions-list">
                  {questions.map((q: { id: string; numero?: number; texte?: string; points?: number }) => (
                    <div key={q.id} className="q-item">
                      <div className="q-status ok">
                        <Circle size={14} />
                      </div>
                      <div className="q-info">
                        <div className="q-title">Question {q.numero || ''}</div>
                        <div className="q-points">{q.points || 0} pts · {q.texte || 'Énoncé enregistré'}</div>
                      </div>
                    </div>
                  ))}
                  {questions.length === 0 && (
                    <div className="q-item">
                      <div className="q-status ok">
                        <Circle size={14} />
                      </div>
                      <div className="q-info">
                        <div className="q-title">Détail indisponible</div>
                        <div className="q-points">Aucune question détaillée n'est enregistrée pour cet examen.</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <Link href="/dashboard" className="btn-luxury-full">
                    Retour au tableau de bord
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </Suspense>
    </div>
  )
}
