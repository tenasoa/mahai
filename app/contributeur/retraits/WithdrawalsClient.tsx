'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Wallet, History, TrendingUp, Clock, CheckCircle, AlertCircle, Smartphone } from 'lucide-react'
import '../contributeur.css'

interface WithdrawalsClientProps {
  user: {
    prenom: string
    nom: string
    role: string
  }
  withdrawals: any[]
  stats: {
    totalWithdrawn: number
    pending: number
    thisMonth: number
    averageWithdrawal: number
  }
  balance: {
    available: number
    pending: number
  }
}

export default function WithdrawalsClient({ user, withdrawals, stats, balance }: WithdrawalsClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed' | 'failed'>('all')
  const [showModal, setShowModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [processing, setProcessing] = useState(false)

  // Appliquer le thème dark
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  const filteredWithdrawals = withdrawals.filter(w => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return w.status === 'PENDING' || w.status === 'PROCESSING'
    if (activeTab === 'completed') return w.status === 'COMPLETED'
    if (activeTab === 'failed') return w.status === 'FAILED'
    return true
  })

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount, 10)
    if (!amount || amount < 5000) {
      alert('Le montant minimum est de 5 000 Ar')
      return
    }

    if (!phoneNumber) {
      alert('Veuillez entrer un numéro MVola')
      return
    }

    setProcessing(true)
    // Appel API à implémenter
    setTimeout(() => {
      setProcessing(false)
      setShowModal(false)
      alert('Demande de retrait envoyée !')
    }, 1000)
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; class: string; icon: any }> = {
      PENDING: { label: 'En attente', class: 'pending', icon: Clock },
      PROCESSING: { label: 'En traitement', class: 'processing', icon: AlertCircle },
      COMPLETED: { label: 'Envoyé', class: 'sent', icon: CheckCircle },
      FAILED: { label: 'Échoué', class: 'failed', icon: AlertCircle }
    }
    return config[status] || { label: status, class: 'pending', icon: Clock }
  }

  return (
    <div className={`contributor-dashboard-page ${isCollapsed ? 'sidebar-collapsed' : ''}`} data-theme="dark">
      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} id="sidebar">
        <Link href="/" className="sb-logo">
          Mah<span className="sb-gem" />AI
        </Link>

        <div className="sb-user">
          <div className="sb-avatar">
            {(user.prenom?.charAt(0) || 'C').toUpperCase()}
          </div>
          <div>
            <div className="sb-name">{user.prenom} {user.nom}</div>
            <div className="sb-badge">Contributeur certifié ✦</div>
          </div>
        </div>

        <div className="sb-earnings">
          <div className="sb-e-label">Revenus totaux</div>
          <div className="sb-e-val">
            {(balance.available + balance.pending).toLocaleString('fr-FR')}
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--gold-lo)' }}> Ar</span>
          </div>
          <div className="sb-e-sub">+0 Ar ce mois</div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section"><span className="sb-section-text">Tableau de bord</span></div>
          <Link className="sb-link" href="/contributeur">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span className="sb-link-text">Vue d&apos;ensemble</span>
          </Link>
          <Link className="sb-link" href="/contributeur/sujets">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span className="sb-link-text">Mes sujets</span>
          </Link>
          <Link className="sb-link" href="/contributeur/nouveau">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 4v16m8-8H4"/>
            </svg>
            <span className="sb-link-text">Nouveau sujet</span>
          </Link>

          <div className="sb-section" style={{ marginTop: '0.75rem' }}><span className="sb-section-text">Finances</span></div>
          <Link className="sb-link active" href="/contributeur/retraits">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            <span className="sb-link-text">Retraits MVola</span>
          </Link>
          <Link className="sb-link" href="/contributeur/analytiques">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <span className="sb-link-text">Analytiques</span>
          </Link>

          <div className="sb-section" style={{ marginTop: '0.75rem' }}><span className="sb-section-text">Compte</span></div>
          <Link className="sb-link" href="/profil">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span className="sb-link-text">Profil public</span>
          </Link>
        </nav>

        <div className="sb-bottom">
          <button className="btn-new" onClick={() => window.location.href = '/contributeur/nouveau'}>
            + Publier un sujet
          </button>
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Déployer le menu' : 'Réduire le menu'}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Main */}
      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-title">
            Retraits <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>MVola</em>
          </div>
          <div className="topbar-right">
            <button 
              className="btn-payout"
              onClick={() => setShowModal(true)}
              style={{ background: 'var(--gold-dim)', borderColor: 'var(--gold-line)', color: 'var(--gold)' }}
            >
              💸 Demander un retrait
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          {/* KPI Strip */}
          <div className="kpi-strip">
            <div className="kpi">
              <div className="kpi-label">Solde disponible</div>
              <div className="kpi-val" style={{ fontSize: '1.8rem' }}>{balance.available.toLocaleString('fr-FR')} <span style={{ fontSize: '0.9rem', color: 'var(--gold)' }}>Ar</span></div>
              <div className="kpi-trend trend-up">Retrait min: 5 000 Ar</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">En attente</div>
              <div className="kpi-val" style={{ fontSize: '1.8rem' }}>{balance.pending.toLocaleString('fr-FR')} <span style={{ fontSize: '0.9rem', color: 'var(--amber)' }}>Ar</span></div>
              <div className="kpi-trend" style={{ color: 'var(--amber)' }}>⏳ Traitement</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Total retiré</div>
              <div className="kpi-val" style={{ fontSize: '1.8rem' }}>{stats.totalWithdrawn.toLocaleString('fr-FR')} <span style={{ fontSize: '0.9rem', color: 'var(--gold-lo)' }}>Ar</span></div>
              <div className="kpi-trend trend-flat">→ Cumul</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Ce mois</div>
              <div className="kpi-val" style={{ fontSize: '1.8rem' }}>{stats.thisMonth.toLocaleString('fr-FR')} <span style={{ fontSize: '0.9rem', color: 'var(--gold-lo)' }}>Ar</span></div>
              <div className="kpi-trend trend-up">↑ Revenus</div>
            </div>
          </div>

          {/* Cycle Banner */}
          <div className="cycle-banner" style={{ background: 'linear-gradient(135deg, var(--card), rgba(201, 168, 76, 0.04))', border: '1px solid var(--gold-line)', borderRadius: 'var(--r-lg)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', overflow: 'hidden', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.57rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-3)', marginBottom: '0.25rem' }}>Prochain cycle de paiement</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', color: 'var(--gold)', letterSpacing: '-0.03em' }}>Mardi & Vendredi</div>
            </div>
            <div style={{ width: '1px', height: '36px', background: 'var(--b1)', flexShrink: '0' }}></div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', animation: 'blink 1.2s ease-in-out infinite' }}></span>
              Traitement sous 24-48h
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ display: 'flex', borderBottom: '1px solid var(--b1)', marginBottom: '1.25rem' }}>
            <button
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
              style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0.6rem 1rem', cursor: 'none', color: activeTab === 'all' ? 'var(--gold)' : 'var(--text-3)', border: 'none', background: 'none', borderBottom: activeTab === 'all' ? '2px solid var(--gold)' : '2px solid transparent', marginBottom: '-1px', transition: 'all 0.2s' }}
            >
              Tous
            </button>
            <button
              className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
              style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0.6rem 1rem', cursor: 'none', color: activeTab === 'pending' ? 'var(--gold)' : 'var(--text-3)', border: 'none', background: 'none', borderBottom: activeTab === 'pending' ? '2px solid var(--gold)' : '2px solid transparent', marginBottom: '-1px', transition: 'all 0.2s' }}
            >
              En attente
            </button>
            <button
              className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
              style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0.6rem 1rem', cursor: 'none', color: activeTab === 'completed' ? 'var(--gold)' : 'var(--text-3)', border: 'none', background: 'none', borderBottom: activeTab === 'completed' ? '2px solid var(--gold)' : '2px solid transparent', marginBottom: '-1px', transition: 'all 0.2s' }}
            >
              Complétés
            </button>
            <button
              className={`tab ${activeTab === 'failed' ? 'active' : ''}`}
              onClick={() => setActiveTab('failed')}
              style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0.6rem 1rem', cursor: 'none', color: activeTab === 'failed' ? 'var(--gold)' : 'var(--text-3)', border: 'none', background: 'none', borderBottom: activeTab === 'failed' ? '2px solid var(--gold)' : '2px solid transparent', marginBottom: '-1px', transition: 'all 0.2s' }}
            >
              Échoués
            </button>
          </div>

          {/* Withdrawals Table */}
          <div className="w-table" style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div className="wt-head" style={{ background: 'var(--lift)', borderBottom: '1px solid var(--b1)', display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr', gap: '0.75rem', padding: '0.6rem 1.1rem', fontFamily: 'var(--mono)', fontSize: '0.56rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)' }}>
              <div>Date</div>
              <div>Montant</div>
              <div>Frais</div>
              <div>Net</div>
              <div style={{ textAlign: 'right' }}>Statut</div>
            </div>
            <div>
              {filteredWithdrawals.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>
                  <Wallet size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <div>Aucun retrait trouvé</div>
                </div>
              ) : (
                filteredWithdrawals.map((w) => {
                  const statusConfig = getStatusBadge(w.status)
                  const fee = w.amount * 0.01 // 1% frais
                  const net = w.amount - fee
                  return (
                    <div key={w.id} className="wt-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr', gap: '0.75rem', padding: '0.75rem 1.1rem', borderBottom: '1px solid var(--b3)', alignItems: 'center', transition: 'background 0.15s', cursor: 'none' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--lift)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--text)' }}>
                        {new Date(w.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', color: 'var(--gold)', letterSpacing: '-0.03em' }}>
                        {w.amount.toLocaleString('fr-FR')} <span style={{ fontSize: '0.8rem', color: 'var(--gold-lo)' }}>Ar</span>
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-3)' }}>
                        {fee.toLocaleString('fr-FR')} Ar
                      </div>
                      <div style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', color: 'var(--text)', letterSpacing: '-0.03em' }}>
                        {net.toLocaleString('fr-FR')} <span style={{ fontSize: '0.8rem', color: 'var(--text-4)' }}>Ar</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="w-status-badge" style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.14rem 0.52rem', borderRadius: '2px', border: '1px solid', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: statusConfig.class === 'pending' ? 'var(--amber-dim)' : statusConfig.class === 'processing' ? 'var(--violet-dim)' : statusConfig.class === 'sent' ? 'var(--sage-dim)' : 'var(--ruby-dim)', borderColor: statusConfig.class === 'pending' ? 'var(--amber-line)' : statusConfig.class === 'processing' ? 'var(--violet-line)' : statusConfig.class === 'sent' ? 'var(--sage-line)' : 'var(--ruby-line)', color: statusConfig.class === 'pending' ? 'var(--amber)' : statusConfig.class === 'processing' ? '#B8A0E0' : statusConfig.class === 'sent' ? '#8ECAAC' : '#E06070' }}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Withdrawal Modal */}
      {showModal && (
        <div className="overlay" style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(4, 3, 2, 0.76)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={() => setShowModal(false)}>
          <div className="receipt-card" style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)', maxWidth: '420px', width: '100%', position: 'relative', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }}></div>
            <div className="receipt-header" style={{ background: 'var(--lift)', borderBottom: '1px solid var(--b1)', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: '0.25rem' }}>Demander un retrait</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>MVola - Madagascar</div>
            </div>
            <div className="receipt-body" style={{ padding: '1.1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: '0.5rem' }}>Montant (Ar)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Min: 5 000 Ar"
                  className="admin-input"
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--b1)', borderRadius: 'var(--r)', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '0.9rem' }}
                />
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-4)', marginTop: '0.35rem' }}>Frais: 1% • Net reçu: 99%</div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: '0.5rem' }}>Numéro MVola</label>
                <div style={{ position: 'relative' }}>
                  <Smartphone size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="034 XX XXX XX"
                    className="admin-input"
                    style={{ width: '100%', paddingLeft: '2.5rem', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--b1)', borderRadius: 'var(--r)', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--gold-dim)', border: '1px solid var(--gold-line)', borderRadius: 'var(--r)', marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: '0.35rem' }}>Solde disponible</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', color: 'var(--gold)', letterSpacing: '-0.03em' }}>{balance.available.toLocaleString('fr-FR')} <span style={{ fontSize: '0.9rem' }}>Ar</span></div>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={processing}
                className="btn-gold"
                style={{ width: '100%', fontFamily: 'var(--body)', fontSize: '0.82rem', fontWeight: 500, padding: '0.75rem', borderRadius: 'var(--r)', background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))', color: 'var(--void)', border: 'none', cursor: 'none', transition: 'all 0.2s', opacity: processing ? 0.5 : 1 }}
              >
                {processing ? 'Traitement...' : 'Confirmer le retrait'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ width: '100%', marginTop: '0.5rem', fontFamily: 'var(--mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.45rem', borderRadius: 'var(--r)', background: 'transparent', border: '1px solid var(--b1)', color: 'var(--text-3)', cursor: 'none', transition: 'all 0.2s' }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
