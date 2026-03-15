'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { getUserData } from '@/actions/auth'
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
  amountType: 'neg' | 'pos' | 'neutral' | 'ia' | 'free'
}

interface RecommendationItem {
  id: string
  exam: string
  subject: string
  title: string
  price: number
  glyph: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { userId, appUser } = useAuth()
  const [user, setUser] = useState<AppUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

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

  const [streak] = useState(7)
  const [stats, setStats] = useState({
    subjectsOwned: 24,
    iaCorrections: 18,
    credits: 85,
    serie: 'BAC D'
  })

  useEffect(() => {
    if (appUser) {
      setUser(appUser)
      setStats(prev => ({
        ...prev,
        credits: appUser.credits
      }))
      setLoading(false)
    }
  }, [appUser])

  useEffect(() => {
    // Custom cursor
    const cursor = document.getElementById('cursor') as HTMLElement
    const ring = document.getElementById('cursor-ring') as HTMLElement
    
    if (!cursor || !ring) return

    let mx = 0, my = 0, rx = 0, ry = 0

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      cursor.style.left = mx + 'px'
      cursor.style.top = my + 'px'
    }

    const animate = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      ring.style.left = rx + 'px'
      ring.style.top = ry + 'px'
      requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', handleMouseMove)
    animate()

    // Hover effects
    const interactiveElements = document.querySelectorAll('a, button, .rec-item, .notif-btn, .sb-link')
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '14px'
        cursor.style.height = '14px'
        ring.style.width = '52px'
        ring.style.height = '52px'
      })
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '8px'
        cursor.style.height = '8px'
        ring.style.width = '36px'
        ring.style.height = '36px'
      })
    })

    // Animate progress bars
    setTimeout(() => {
      document.querySelectorAll('.prog-bar-fill').forEach((el: any) => {
        const width = el.style.width
        el.style.width = '0'
        setTimeout(() => {
          el.style.width = width
        }, 100)
      })
    }, 200)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  const handleNav = (e: React.MouseEvent, section: string) => {
    e.preventDefault()
    // Update active state
    document.querySelectorAll('.sb-link').forEach(link => {
      link.classList.remove('active')
    })
    e.currentTarget.classList.add('active')
    
    if (section !== '#') {
      router.push(section)
    }
  }

  const showToast = (type: 'success' | 'info' | 'error', title: string, msg: string) => {
    const icons: Record<string, string> = { success: '✦', info: 'ℹ', error: '✕' }
    const container = document.getElementById('toast-container')
    if (!container) return

    const toast = document.createElement('div')
    toast.className = `toast ${type}`
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || 'ℹ'}</div>
      <div>
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${msg}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.classList.add('exit');setTimeout(()=>this.parentElement.remove(),350)">✕</button>
    `
    container.appendChild(toast)
    setTimeout(() => {
      toast.classList.add('exit')
      setTimeout(() => toast.remove(), 350)
    }, 4000)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <div className="loading-text">Chargement du dashboard...</div>
      </div>
    )
  }

  return (
    <>
      <div className="cursor" id="cursor"></div>
      <div className="cursor-ring" id="cursor-ring"></div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
        <Link href="/" className="sb-logo">
          Mah<span className="sb-logo-gem"></span>AI
        </Link>
        
        <div className="sb-user">
          <div className="sb-avatar">
            {user?.prenom?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="sb-name">
              {user?.prenom} {user?.nom || ''}
            </div>
            <div className="sb-role">
              {user?.role || 'Étudiant'} · {user?.schoolLevel || 'BAC'}
            </div>
          </div>
        </div>

        <div className="sb-credits">
          <div>
            <div className="sb-cr-label">Crédits</div>
            <div className="sb-cr-val">
              {stats.credits} <span className="sb-cr-unit">cr</span>
            </div>
          </div>
          <div style={{ fontSize: '1.5rem' }}>💎</div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section">Principal</div>
          <a href="#" className="sb-link active" onClick={(e) => handleNav(e, '#')}>
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Tableau de bord
          </a>
          <Link href="/catalogue" className="sb-link">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            </svg>
            Catalogue
          </Link>
          <a href="/dashboard/achats" className="sb-link">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Mes sujets
            <span className="sb-badge gold">{stats.subjectsOwned}</span>
          </a>
          <a href="#" className="sb-link" onClick={(e) => handleNav(e, '#')}>
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            Corrections IA
            <span className="sb-badge">{stats.iaCorrections}</span>
          </a>
          
          <div className="sb-section" style={{ marginTop: '0.75rem' }}>Compte</div>
          <Link href="/dashboard/profil" className="sb-link">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Profil
          </Link>
          <Link href="/credits" className="sb-link">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            Recharger
          </Link>
        </nav>

        <div className="sb-bottom">
          <button 
            className="btn-recharge"
            onClick={() => showToast('success', 'Recharge MVola', 'Entrez votre numéro MVola pour recharger vos crédits')}
          >
            + Recharger via MVola
          </button>
        </div>
      </aside>

      <div className={`overlay ${sidebarOpen ? 'open' : ''}`} id="overlay" onClick={closeSidebar}></div>

      {/* Main Content */}
      <main className="main">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="menu-btn" 
              id="menu-btn" 
              onClick={toggleSidebar}
            >
              ☰
            </button>
            <div className="topbar-title">
              Bonjour, <em>{user?.prenom || 'Utilisateur'}</em> ✦
            </div>
          </div>
          <div className="topbar-right">
            <div 
              className="topbar-search"
              onClick={() => showToast('info', 'Recherche', 'Tapez pour chercher dans vos sujets…')}
            >
              <svg style={{ width: '14px', height: '14px', stroke: 'currentColor', fill: 'none', strokeWidth: 2 }} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              Rechercher…
            </div>
            <div 
              className="notif-btn"
              onClick={() => showToast('info', 'Notifications', '3 nouvelles corrections IA disponibles')}
            >
              🔔<div className="notif-dot"></div>
            </div>
          </div>
        </div>

        <div className="page-content">
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card c1">
              <div className="sc-label">Sujets achetés</div>
              <div className="sc-val">{stats.subjectsOwned}</div>
              <div className="sc-sub">+3 ce mois</div>
              <div className="sc-icon">📚</div>
            </div>
            <div className="stat-card c2">
              <div className="sc-label">Corrections IA</div>
              <div className="sc-val">{stats.iaCorrections}</div>
              <div className="sc-sub">Score moy. 13.4/20</div>
              <div className="sc-icon">🤖</div>
            </div>
            <div className="stat-card c3">
              <div className="sc-label">Crédits restants</div>
              <div className="sc-val">{stats.credits}</div>
              <div className="sc-sub">≈ 5 sujets BAC</div>
              <div className="sc-icon">💎</div>
            </div>
            <div className="stat-card c4">
              <div className="sc-label">Série active</div>
              <div className="sc-val" style={{ fontSize: '2rem' }}>{stats.serie}</div>
              <div className="sc-sub">Objectif : Juin 2025</div>
              <div className="sc-icon">🎯</div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="section-header">
            <div className="section-title">En cours de <em>révision</em></div>
            <button className="btn-link" onClick={() => showToast('info', 'Navigation', 'Tout l\'historique disponible prochainement')}>
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
                    onClick={() => showToast('info', 'Correction IA', 'Ouverture de la correction IA…')}
                  >
                    Correction IA
                  </button>
                  <button 
                    className="btn-xs"
                    onClick={() => showToast('info', 'Sujet', 'Ouverture du sujet…')}
                  >
                    Continuer
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Lower Grid */}
          <div className="lower-grid">
            {/* Activity */}
            <div>
              <div className="section-header">
                <div className="section-title">Activité <em>récente</em></div>
                <button className="btn-link" onClick={() => showToast('info', 'Historique', 'Historique complet disponible prochainement')}>
                  Tout l'historique →
                </button>
              </div>
              <div className="activity-list">
                {activities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className={`ai-dot ${activity.type}`}></div>
                    <div className="ai-content">
                      <div className="ai-title">{activity.title}</div>
                      <div className="ai-sub">{activity.subtitle}</div>
                    </div>
                    <div className="ai-time">{activity.time}</div>
                    <div className={`ai-amount ${activity.amountType === 'neg' ? 'neg' : activity.amountType === 'pos' ? '' : activity.amountType}`}>
                      {activity.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak & Recommendations */}
            <div>
              <div className="streak-card">
                <div className="streak-title">🔥 Série de révision</div>
                <div className="streak-num">{streak}</div>
                <div className="streak-unit">jours consécutifs</div>
                <div className="streak-days">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                    <div 
                      key={day} 
                      className={`streak-day ${i === streak - 1 ? 'today' : 'done'}`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              <div className="section-header">
                <div className="section-title" style={{ fontSize: '1.1rem' }}>Recommandés</div>
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
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="mob-nav">
        <a href="#" className="active" onClick={(e) => handleNav(e, '#')}>
          🏠<span>Accueil</span>
        </a>
        <Link href="/catalogue">📚<span>Catalogue</span></Link>
        <a href="/dashboard/achats">📄<span>Mes sujets</span></a>
        <Link href="/dashboard/profil">👤<span>Profil</span></Link>
      </nav>

      {/* Toast Container */}
      <div className="toast-container" id="toast-container"></div>
    </>
  )
}
