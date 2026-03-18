'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { LuxuryFooter } from '@/components/layout/LuxuryFooter'
import { DashboardPageSkeleton } from '@/components/ui/PageSkeletons'
import { getRandomQuote, type MotivationalQuote } from '@/lib/constants/motivationalQuotes'
import './dashboard.css'

interface DashboardCardProps {
  icon: string
  label: string
  value: string | number
  subtitle: string
  route: string
  color: 'gold' | 'blue' | 'green'
}

export default function DashboardPage() {
  const router = useRouter()
  const { userId, appUser, loading: authLoading } = useAuth()
  const [currentDate, setCurrentDate] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [greeting, setGreeting] = useState('')
  const [motivationalQuote, setMotivationalQuote] = useState<MotivationalQuote | null>(null)

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

    // Charger une citation aléatoire
    setMotivationalQuote(getRandomQuote())
  }, [])

  useEffect(() => {
    if (!authLoading && !userId) {
      router.push('/auth/login')
    }
  }, [authLoading, userId, router])

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

  if (authLoading || !userId) {
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
      icon: '💎',
      label: 'Crédits disponibles',
      value: appUser?.credits ?? 0,
      subtitle: 'Utilisables pour débloquer des sujets',
      route: '/credits',
      color: 'gold',
    },
    {
      icon: '👤',
      label: 'Profil',
      value: `${profileCompletion}%`,
      subtitle: 'Complétion des informations personnelles',
      route: '/profil',
      color: 'blue',
    },
    {
      icon: '📚',
      label: 'Catalogue',
      value: appUser?.educationLevel || appUser?.schoolLevel || 'À définir',
      subtitle: 'Niveau utilisé pour orienter votre profil',
      route: '/catalogue',
      color: 'green',
    },
  ]

  return (
    <>
      <LuxuryNavbar />
      <LuxuryCursor />

      <main className="dashboard-main">
        <div className="dashboard-container">
          <section className="hero-card">
            <div className="hero-content">
              <div className="hero-greeting">
                <span className="hero-icon">✦</span>
                <div>
                  <h1 className="hero-title">
                    {greeting}, <em>{appUser?.pseudo || appUser?.prenom || 'Utilisateur'}</em>
                  </h1>
                  <p className="hero-subtitle">
                    Espace de pilotage minimal pendant l'intégration du profil.
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
                    <span>🕐</span>
                    <span>{currentTime}</span>
                  </p>
                </div>
              </div>
              
              {/* Citation de motivation */}
              {motivationalQuote && (
                <div className="hero-quote-card">
                  <div className="hero-quote-icon">💬</div>
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
              
              <div className="hero-meta">
                <span className="hero-meta-item">📅 {currentDate}</span>
                <span className="hero-meta-item">🎓 {appUser?.role || 'Compte étudiant'}</span>
                <span className="hero-meta-item">💎 {appUser?.credits ?? 0} crédits</span>
              </div>
            </div>
          </section>

          <section className="dashboard-section">
            <div className="stats-grid-original">
              {cards.map((card) => (
                <DashboardCard key={card.label} {...card} />
              ))}
            </div>
          </section>

          <div className="lower-grid">
            <section className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Actions <em>Disponibles</em></h2>
              </div>
              <div className="activity-list">
                <div className="activity-item" onClick={() => router.push('/catalogue')}>
                  <div className="ai-dot correction"></div>
                  <div className="ai-content">
                    <div className="ai-title">Parcourir le catalogue</div>
                    <div className="ai-sub">Accéder aux sujets déjà branchés sur les données Supabase.</div>
                  </div>
                </div>
                <div className="activity-item" onClick={() => router.push('/profil')}>
                  <div className="ai-dot purchase"></div>
                  <div className="ai-content">
                    <div className="ai-title">Compléter mon profil</div>
                    <div className="ai-sub">Mettre à jour les informations réellement utilisées par l’application.</div>
                  </div>
                </div>
                <div className="activity-item" onClick={() => router.push('/credits')}>
                  <div className="ai-dot credit"></div>
                  <div className="ai-content">
                    <div className="ai-title">Recharger mes crédits</div>
                    <div className="ai-sub">Préparer les prochains achats de sujets depuis le parcours actif.</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">État <em>Du Produit</em></h2>
              </div>
              <div className="streak-card" style={{ cursor: 'default' }}>
                <div className="streak-title">Intégration en cours</div>
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
                  Les sections achats, progression, activité détaillée et recommandations reviendront quand leurs vraies sources seront connectées.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <LuxuryFooter />
    </>
  )
}

function DashboardCard({ icon, label, value, subtitle, route, color }: DashboardCardProps) {
  const router = useRouter()

  return (
    <div className={`stat-card stat-card-${color}`} onClick={() => router.push(route)}>
      <div className="sc-label">{label}</div>
      <div className="sc-value">{value}</div>
      <div className="sc-subtitle">{subtitle}</div>
      <div className="sc-icon">{icon}</div>
    </div>
  )
}
