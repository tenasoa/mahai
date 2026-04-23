'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowUpRight,
  CalendarClock,
  type LucideIcon,
  Target,
  UserRound,
  Wallet,
  MessageSquare,
  Calendar,
  GraduationCap,
  Gem,
  Clock,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { LuxuryFooter } from '@/components/layout/LuxuryFooter'
import { DashboardPageSkeleton } from '@/components/ui/PageSkeletons'
import { getRandomQuote, type MotivationalQuote } from '@/lib/constants/motivationalQuotes'
import { getDashboardData, type UpcomingExam, type WeeklyProgress } from '@/actions/user'
import './dashboard.css'

interface DashboardCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  subtitle: string
  route: string
  color: 'gold' | 'blue' | 'green' | 'ruby'
}

function getDaysRemaining(dateISO: string) {
  const today = new Date()
  const examDate = new Date(dateISO)
  today.setHours(0, 0, 0, 0)
  examDate.setHours(0, 0, 0, 0)
  const diffMs = examDate.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

export default function DashboardPage() {
  const router = useRouter()
  const { userId, appUser, loading: authLoading } = useAuth()
  const [currentDate, setCurrentDate] = useState('')
  const [currentTime, setCurrentTime] = useState('')

  // Set page title
  useEffect(() => {
    document.title = "Mah.AI — Tableau de bord"
  }, [])
  const [greeting, setGreeting] = useState('')
  const [motivationalQuote, setMotivationalQuote] = useState<MotivationalQuote | null>(null)
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([])
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(true)

  useEffect(() => {
    const now = new Date()
    setCurrentDate(
      now.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    )
    setCurrentTime(
      now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    )

    const hour = now.getHours()
    if (hour >= 5 && hour < 12) {
      setGreeting('Bonjour')
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Bon après-midi')
    } else {
      setGreeting('Bonsoir')
    }

    setMotivationalQuote(getRandomQuote())
  }, [])

  useEffect(() => {
    if (!authLoading && !userId) {
      router.push('/auth/login')
    }
  }, [authLoading, userId, router])

  useEffect(() => {
    async function loadDashboardData() {
      if (userId) {
        setDashboardLoading(true)
        try {
          const data = await getDashboardData()
          setUpcomingExams(data.upcomingExams)
          setWeeklyProgress(data.weeklyProgress)
        } catch (error) {
          console.error('Erreur chargement dashboard:', error)
        } finally {
          setDashboardLoading(false)
        }
      }
    }
    loadDashboardData()
  }, [userId])

  const profileFields = appUser
    ? [
        appUser.nomComplet || appUser.prenom,
        appUser.pseudo,
        appUser.educationLevel || appUser.schoolLevel,
        appUser.phone,
        appUser.region,
        appUser.district,
      ]
    : []
  const profileCompletion = profileFields.length
    ? Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100)
    : 0

  const completedSessions = weeklyProgress.filter((entry) => entry.solved > 0).length
  const totalWeeklySolved = weeklyProgress.reduce((sum, entry) => sum + entry.solved, 0)
  const nearestExamDays = upcomingExams.length > 0 ? getDaysRemaining(upcomingExams[0].date) : 0

  const studyPart = Math.max(20, 45 - completedSessions * 2)
  const exercisePart = Math.min(45, 24 + completedSessions * 2)
  const mockExamPart = 100 - studyPart - exercisePart

  const prepDistribution = [
    { label: 'Lecture sujets', value: studyPart, color: 'var(--gold)' },
    { label: 'Exercices', value: exercisePart, color: 'var(--sage)' },
    { label: 'Examens blancs', value: mockExamPart, color: 'var(--blue)' },
  ]

  const pieGradient = `conic-gradient(${prepDistribution
    .map((segment, index) => {
      const start = prepDistribution
        .slice(0, index)
        .reduce((sum, current) => sum + current.value, 0)
      const end = start + segment.value
      return `${segment.color} ${start}% ${end}%`
    })
    .join(', ')})`

  if (authLoading || !userId || dashboardLoading) {
    return (
      <>
        <LuxuryNavbar />
        <LuxuryCursor />
        <DashboardPageSkeleton />
      </>
    )
  }

  const cards: DashboardCardProps[] = [
    {
      icon: Wallet,
      label: 'Crédits disponibles',
      value: appUser?.credits ?? 0,
      subtitle: 'Utilisables pour débloquer des sujets',
      route: '/recharge',
      color: 'gold',
    },
    {
      icon: UserRound,
      label: 'Profil',
      value: `${profileCompletion}%`,
      subtitle: 'Complétion des informations personnelles',
      route: '/profil',
      color: 'blue',
    },
    {
      icon: CalendarClock,
      label: 'Examens planifiés',
      value: upcomingExams.length,
      subtitle: `Prochaine échéance dans ${nearestExamDays} jour(s)`,
      route: '/examens',
      color: 'ruby',
    },
    {
      icon: Target,
      label: 'Sessions cette semaine',
      value: totalWeeklySolved,
      subtitle: `${completedSessions}/7 jours actifs`,
      route: '/catalogue',
      color: 'green',
    },
  ]

  return (
    <>
      <LuxuryNavbar />
      <LuxuryCursor />

      <main id="main-content" className="dashboard-main">
        <div className="dashboard-container">
          <section className="hero-card">
            <div className="hero-content">
              <div className="hero-main-content">
                <div className="hero-greeting">
                  <span className="hero-icon">✦</span>
                  <div>
                    <h1 className="hero-title">
                      {greeting}, <em>{appUser?.pseudo || appUser?.prenom || 'Utilisateur'}</em>
                    </h1>
                    <p className="hero-subtitle">
                      Retrouvez ici vos indicateurs clés, votre planning d'épreuves et vos prochains objectifs de progression.
                    </p>
                    <p
                      className="hero-time"
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '0.65rem',
                        color: 'var(--text-3)',
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Clock size={14} />
                      <span>{currentTime}</span>
                    </p>
                  </div>
                </div>

                <div className="hero-meta">
                  <span className="hero-meta-item"><Calendar size={14} /> {currentDate}</span>
                  <span className="hero-meta-item"><GraduationCap size={14} /> {appUser?.role || 'Compte étudiant'}</span>
                  <span className="hero-meta-item"><Gem size={14} /> {appUser?.credits ?? 0} crédits</span>
                </div>
              </div>

              {motivationalQuote && (
                <div className="hero-quote-card">
                  <div className="hero-quote-icon"><MessageSquare size={20} /></div>
                  <div className="hero-quote-content">
                    <p className="hero-quote-text">"{motivationalQuote.text}"</p>
                    {(motivationalQuote.author || motivationalQuote.source) && (
                      <p className="hero-quote-author">
                        {motivationalQuote.author}
                        {motivationalQuote.source && ` — ${motivationalQuote.source}`}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="dashboard-section">
            <div className="cards-grid cards-grid-4">
              {cards.map((card) => (
                <DashboardCard key={card.label} {...card} />
              ))}
            </div>
          </section>

          <section className="dashboard-section">
            <div className="analytics-grid">
              <article className="dashboard-card">
                <div className="section-header">
                  <h2 className="section-title">Répartition <em>Préparation</em></h2>
                </div>
                <div className="pie-wrap">
                  <div className="pie-chart" style={{ background: pieGradient }}>
                    <div className="pie-center">
                      <span>{totalWeeklySolved}</span>
                      <small>sessions</small>
                    </div>
                  </div>
                  <div className="pie-legend">
                    {prepDistribution.map((segment) => (
                      <div key={segment.label} className="pie-legend-item">
                        <span className="pie-dot" style={{ background: segment.color }} />
                        <span>{segment.label}</span>
                        <strong>{segment.value}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="dashboard-card">
                <div className="section-header">
                  <h2 className="section-title">Progression <em>Hebdomadaire</em></h2>
                </div>
                <div className="bars-chart">
                  {weeklyProgress.length === 0 ? (
                    <div className="empty-chart">Aucune activité cette semaine</div>
                  ) : (
                    weeklyProgress.map((entry, idx) => (
                    <div className="bar-item" key={entry.day}>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            height: `${Math.max(12, entry.solved * 18)}%`,
                            animationDelay: `${idx * 70}ms`,
                          }}
                        />
                      </div>
                      <span className="bar-value">{entry.solved}</span>
                      <span className="bar-label">{entry.day}</span>
                    </div>
                  ))
                  )}
                </div>
              </article>
            </div>
          </section>

          <section className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Planning <em>Examens</em></h2>
            </div>
            <div className="planning-grid">
              {upcomingExams.length === 0 ? (
                <div className="planning-empty">
                  <p>Aucun examen blanc programmé</p>
                  <Link href="/examens" className="planning-cta">Créer un examen blanc</Link>
                </div>
              ) : (
                upcomingExams.map((exam) => (
                <article key={exam.id} className="planning-card">
                  <div className="planning-top">
                    <div>
                      <h3>{exam.title}</h3>
                      <p>
                        {new Date(exam.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className="planning-days">J-{getDaysRemaining(exam.date)}</span>
                  </div>
                  <div className="planning-meta">
                    <span>{exam.slot}</span>
                    <span>{exam.center}</span>
                  </div>
                  <div className="planning-readiness">
                    <div className="planning-readiness-head">
                      <span>Niveau de préparation</span>
                      <strong>{exam.readiness}%</strong>
                    </div>
                    <div className="planning-readiness-track">
                      <div className="planning-readiness-fill" style={{ width: `${exam.readiness}%` }} />
                    </div>
                  </div>
                </article>
              ))
              )}
            </div>
          </section>

          <div className="lower-grid">
            <section className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Actions <em>Rapides</em></h2>
              </div>
              <div className="activity-list">
                <div className="activity-item" onClick={() => router.push('/catalogue')}>
                  <div className="ai-dot correction"></div>
                  <div className="ai-content">
                    <div className="ai-title">Explorer le catalogue</div>
                    <div className="ai-sub">Parcourez les sujets disponibles et trouvez rapidement ceux qui correspondent à votre niveau.</div>
                  </div>
                </div>
                <div className="activity-item" onClick={() => router.push('/profil')}>
                  <div className="ai-dot purchase"></div>
                  <div className="ai-content">
                    <div className="ai-title">Mettre à jour mon profil</div>
                    <div className="ai-sub">Ajoutez vos informations personnelles et académiques pour personnaliser votre expérience.</div>
                  </div>
                </div>
                <div className="activity-item" onClick={() => router.push('/recharge')}>
                  <div className="ai-dot credit"></div>
                  <div className="ai-content">
                    <div className="ai-title">Recharger mes crédits</div>
                    <div className="ai-sub">Ajoutez des crédits à votre compte pour débloquer vos prochains sujets en toute simplicité.</div>
                  </div>
                </div>
                <div className="activity-item" onClick={() => router.push('/examens')}>
                  <div className="ai-dot free"></div>
                  <div className="ai-content">
                    <div className="ai-title">Démarrer un examen blanc</div>
                    <div className="ai-sub">Passez en conditions réelles avec chrono et correction IA.</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Profil <em>À Finaliser</em></h2>
              </div>
              <div className="streak-card" style={{ cursor: 'default' }}>
                <div className="streak-title">Votre progression</div>
                <div className="streak-num">{profileCompletion}%</div>
                <div className="streak-unit">profil complété</div>
                <p
                  style={{
                    marginTop: '1rem',
                    fontSize: '0.78rem',
                    color: 'var(--text-3)',
                    lineHeight: 1.6,
                    maxWidth: '26rem',
                  }}
                >
                  Compléter votre profil améliore la personnalisation de vos recommandations, de votre parcours et de vos futures recherches.
                </p>
              </div>
              <div className="illustration-card" aria-hidden="true">
                <div className="illustration-orb orb-a" />
                <div className="illustration-orb orb-b" />
                <div className="illustration-book" />
                <div className="illustration-pen" />
              </div>
            </section>
          </div>

          {!(appUser?.role && ['CONTRIBUTEUR', 'PROFESSEUR', 'ADMIN', 'VALIDATEUR', 'VERIFICATEUR'].includes(appUser.role)) && (
            <section className="contributor-cta-section">
              <div className="contributor-cta-card">
                <div className="contributor-cta-text">
                  <p className="contributor-kicker">Programme contributeur</p>
                  <h2>Vous maîtrisez une matière ? Partagez vos sujets et gagnez des revenus.</h2>
                  <p>
                    Publiez vos épreuves, accompagnez les élèves et développez votre visibilité académique sur Mah.AI.
                  </p>
                </div>
                <Link href="/devenir-contributeur" className="contributor-cta-link">
                  Devenir contributeur
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </section>
          )}

          {(appUser?.role === 'CONTRIBUTEUR' || appUser?.role === 'PROFESSEUR' || appUser?.role === 'ADMIN' || appUser?.role === 'VALIDATEUR') && (
            <section className="contributor-cta-section">
              <div className="contributor-cta-card" style={{ background: 'linear-gradient(135deg, var(--gold-dim), var(--card))', borderColor: 'var(--gold-line)' }}>
                <div className="contributor-cta-text">
                  <p className="contributor-kicker" style={{ color: 'var(--gold)' }}>Dashboard <em>Contributeur</em></p>
                  <h2>Vous êtes déjà contributeur {appUser?.role === 'ADMIN' ? 'Admin' : 'Or'}, continuez d'améliorer l'éducation !</h2>
                  <p>
                    Partagez de nouveaux sujets, gérez vos publications et suivez l'impact de vos contributions sur la réussite des élèves.
                  </p>
                </div>
                <Link href="/contributeur/sujets" className="contributor-cta-link">
                  Gérer mes sujets
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>

      <LuxuryFooter />
    </>
  )
}

function DashboardCard({ icon, label, value, subtitle, route, color }: DashboardCardProps) {
  const router = useRouter()
  const Icon = icon

  return (
    <div className={`stat-card stat-card-${color}`} onClick={() => router.push(route)}>
      <div className="sc-label">{label}</div>
      <div className="sc-value">{value}</div>
      <div className="sc-subtitle">{subtitle}</div>
      <div className="sc-icon"><Icon size={18} /></div>
    </div>
  )
}
