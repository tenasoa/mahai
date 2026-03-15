'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { LuxuryFooter } from '@/components/layout/LuxuryFooter'
import './dashboard.css'

interface AppUser {
  id: string
  email: string
  prenom: string
  nom?: string
  role: string
  credits: number
  schoolLevel?: string
}

interface ProgressItem {
  id: string
  exam: string
  title: string
  subject: string
  date: string
  score: string
  progress: number
  completed: string
}

interface ActivityItem {
  id: string
  type: 'purchase' | 'correction' | 'download' | 'credit'
  title: string
  subtitle: string
  time: string
  amount: string
  amountType: 'neg' | 'pos' | 'ia' | 'free'
}

interface RecommendationItem {
  id: string
  exam: string
  subject: string
  title: string
  price: number
  glyph: string
}

interface DashboardCardProps {
  icon: string
  label: string
  value: string | number
  subtitle?: string
  route: string
  color: 'gold' | 'blue' | 'green' | 'ruby' | 'navy' | 'sage'
}

export default function DashboardPage() {
  const router = useRouter()
  const { userId, appUser } = useAuth()
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState('')

  // Mock data - À remplacer par des données réelles de Supabase
  const [progressItems] = useState<ProgressItem[]>([
    {
      id: '1',
      exam: 'BAC 2024',
      title: 'Mathématiques — Algèbre & Fonctions',
      subject: 'Maths',
      date: '12 mars 2025',
      score: '14.5/20',
      progress: 72,
      completed: '3/5 exercices'
    },
    {
      id: '2',
      exam: 'BEPC 2023',
      title: 'Physique-Chimie — Mécanique',
      subject: 'Physique',
      date: '9 mars 2025',
      score: '11/20',
      progress: 40,
      completed: '2/5 exercices'
    }
  ])

  const [activities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'purchase',
      title: 'Achat — Mathématiques BAC 2024',
      subtitle: 'Série D · 18 pages · Correction IA incluse',
      time: 'Il y a 2h',
      amount: '−15 cr',
      amountType: 'neg'
    },
    {
      id: '2',
      type: 'correction',
      title: 'Correction IA — Physique-Chimie BEPC 2023',
      subtitle: 'Score : 11/20 · 3 exercices analysés',
      time: 'Hier',
      amount: '✦ IA',
      amountType: 'ia'
    },
    {
      id: '3',
      type: 'download',
      title: 'Téléchargement — Français CEPE 2022',
      subtitle: 'Gratuit · 8 pages',
      time: 'Il y a 3j',
      amount: 'Gratuit',
      amountType: 'free'
    },
    {
      id: '4',
      type: 'credit',
      title: 'Recharge MVola — 150 crédits',
      subtitle: 'Pack Standard · +10 crédits bonus',
      time: 'Il y a 5j',
      amount: '+150 cr',
      amountType: 'pos'
    }
  ])

  const [recommendations] = useState<RecommendationItem[]>([
    {
      id: '1',
      exam: 'BAC',
      subject: 'Mathématiques',
      title: 'Fonctions & Géométrie 2023',
      price: 12,
      glyph: 'π'
    },
    {
      id: '2',
      exam: 'BAC',
      subject: 'Physique-Chimie',
      title: 'Thermodynamique 2024',
      price: 15,
      glyph: '⚗'
    },
    {
      id: '3',
      exam: 'BAC',
      subject: 'Français',
      title: 'Dissertation & Commentaire 2024',
      price: 10,
      glyph: '📖'
    }
  ])

  // Stats
  const [stats, setStats] = useState({
    subjectsOwned: 24,
    iaCorrections: 18,
    credits: 85,
    serie: 'BAC D',
    favorites: 12,
    downloads: 8,
    studyTime: '24h',
    avgScore: '13.4/20',
    badges: 5,
    daysLeft: 95,
    streak: 7,
    pagesRead: 342,
    examsAvailable: 5,
    rank: 'Top 15%',
    objectives: 3
  })

  useEffect(() => {
    // Format date
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    setCurrentDate(now.toLocaleDateString('fr-FR', options))

    if (appUser) {
      setUser(appUser)
      setStats(prev => ({
        ...prev,
        credits: appUser.credits
      }))
      setLoading(false)
    }
  }, [appUser])

  const showToast = (type: 'success' | 'info' | 'error', title: string, msg: string) => {
    const container = document.getElementById('toast-container')
    if (!container) return

    const icons: Record<string, string> = { success: '✦', info: 'ℹ', error: '✕' }
    const toast = document.createElement('div')
    toast.className = `toast ${type}`
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || 'ℹ'}</div>
      <div>
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${msg}</div>
      </div>
    `
    container.appendChild(toast)
    setTimeout(() => toast.remove(), 4000)
  }

  if (loading) {
    return (
      <>
        <LuxuryNavbar />
        <LuxuryCursor />
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <div className="loading-text">Chargement du dashboard...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <LuxuryNavbar />
      <LuxuryCursor />

      <main className="dashboard-main">
        <div className="dashboard-container">
          
          {/* ═══════ HERO CARD ═══════ */}
          <section className="hero-card" onClick={() => router.push('/dashboard/calendrier')}>
            <div className="hero-content">
              <div className="hero-greeting">
                <span className="hero-icon">🔥</span>
                <div>
                  <h1 className="hero-title">
                    Bonjour, <em>{user?.prenom || 'Utilisateur'}</em> ✦
                  </h1>
                  <p className="hero-subtitle">"Prêt à réussir tes examens aujourd'hui ?"</p>
                </div>
              </div>
              <div className="hero-meta">
                <span className="hero-meta-item">📅 {currentDate}</span>
                <span className="hero-meta-item">🎯 {stats.serie}</span>
                <span className="hero-meta-item">🔥 {stats.streak} jours</span>
              </div>
            </div>
          </section>

          {/* ═══════ STATS PRINCIPALES ═══════ */}
          <section className="dashboard-section">
            <div className="stats-grid-original">
              <DashboardCard
                icon="📚"
                label="Sujets achetés"
                value={stats.subjectsOwned}
                subtitle="+3 ce mois"
                route="/dashboard/achats"
                color="gold"
              />
              <DashboardCard
                icon="🤖"
                label="Corrections IA"
                value={stats.iaCorrections}
                subtitle="Score moy. 13.4/20"
                route="/dashboard/corrections"
                color="blue"
              />
              <DashboardCard
                icon="💎"
                label="Crédits restants"
                value={stats.credits}
                subtitle="≈ 5 sujets BAC"
                route="/credits"
                color="green"
              />
              <DashboardCard
                icon="🎯"
                label="Série active"
                value={stats.serie}
                subtitle="Objectif : Juin 2025"
                route="/dashboard/progression"
                color="ruby"
              />
            </div>
          </section>

          {/* ═══════ EN COURS DE RÉVISION ═══════ */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">En cours de <em>révision</em></h2>
              <button className="btn-link" onClick={() => router.push('/dashboard/progression')}>
                Tout voir →
              </button>
            </div>
            <div className="progress-grid">
              {progressItems.map((item) => (
                <div key={item.id} className="prog-card">
                  <div className="prog-header">
                    <span className="prog-exam">{item.exam}</span>
                    <div className="prog-score">{item.score}</div>
                  </div>
                  <div className="prog-title">{item.title}</div>
                  <div className="prog-date">Dernière session : {item.date}</div>
                  <div className="prog-bar-wrap">
                    <div className="prog-bar-track">
                      <div className="prog-bar-fill" style={{ width: `${item.progress}%` }}></div>
                    </div>
                  </div>
                  <div className="prog-pct">
                    <span>{item.progress}% complété</span>
                    <span>{item.completed}</span>
                  </div>
                  <div className="prog-actions">
                    <button 
                      className="btn-xs primary"
                      onClick={() => router.push(`/sujet/${item.id}/correction`)}
                    >
                      Correction IA
                    </button>
                    <button 
                      className="btn-xs"
                      onClick={() => router.push(`/sujet/${item.id}`)}
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ═══════ ACTIVITÉ & RECOMMANDATIONS ═══════ */}
          <div className="lower-grid">
            {/* Activité Récente */}
            <section className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Activité <em>récente</em></h2>
                <button className="btn-link" onClick={() => router.push('/dashboard/historique')}>
                  Tout l'historique →
                </button>
              </div>
              <div className="activity-list">
                {activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="activity-item"
                    onClick={() => router.push(`/dashboard/activity/${activity.id}`)}
                  >
                    <div className={`ai-dot ${activity.type}`}></div>
                    <div className="ai-content">
                      <div className="ai-title">{activity.title}</div>
                      <div className="ai-sub">{activity.subtitle}</div>
                    </div>
                    <div className="ai-time">{activity.time}</div>
                    <div className={`ai-amount ${activity.amountType}`}>
                      {activity.amount}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Streak & Recommandations */}
            <section className="dashboard-section">
              {/* Streak Card */}
              <div 
                className="streak-card"
                onClick={() => router.push('/dashboard/streak')}
              >
                <div className="streak-title">🔥 Série de révision</div>
                <div className="streak-num">{stats.streak}</div>
                <div className="streak-unit">jours consécutifs</div>
                <div className="streak-days">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                    <div 
                      key={`${day}-${i}`} 
                      className={`streak-day ${i < stats.streak ? 'done' : ''} ${i === 6 ? 'today' : ''}`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommandations */}
              <div className="section-header">
                <h2 className="section-title" style={{ fontSize: '1.1rem' }}>Recommandés</h2>
                <button className="btn-link" onClick={() => router.push('/catalogue')}>
                  Voir plus →
                </button>
              </div>
              <div className="rec-list">
                {recommendations.map((rec) => (
                  <div 
                    key={rec.id} 
                    className="rec-item"
                    onClick={() => router.push(`/catalogue?sujet=${rec.title}`)}
                  >
                    <div className="rec-thumb">{rec.glyph}</div>
                    <div className="rec-body">
                      <div className="rec-tag">{rec.exam} · {rec.subject}</div>
                      <div className="rec-title">{rec.title}</div>
                      <div className="rec-price">{rec.price} crédits</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

        </div>
      </main>

      <LuxuryFooter />

      {/* Toast Container */}
      <div className="toast-container" id="toast-container"></div>
    </>
  )
}

// ═══════ COMPOSANT DE CARTE UNIFIÉ ═══════

function DashboardCard({ icon, label, value, subtitle, route, color }: DashboardCardProps) {
  const router = useRouter()
  
  return (
    <div 
      className={`stat-card stat-card-${color}`}
      onClick={() => router.push(route)}
    >
      <div className="sc-label">{label}</div>
      <div className="sc-value">{value}</div>
      {subtitle && <div className="sc-subtitle">{subtitle}</div>}
      <div className="sc-icon">{icon}</div>
    </div>
  )
}
