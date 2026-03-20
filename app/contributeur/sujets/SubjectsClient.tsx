'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, FileText, CheckCircle2, AlertCircle, XCircle, File, Edit3, BarChart3, Eye, Trash2 } from 'lucide-react'
import '../contributeur.css'

interface ContributorSubjectsClientProps {
  user: {
    prenom: string
    nom: string
    role: string
  }
  subjects: any[]
  stats: {
    published: number
    pending: number
    rejected: number
    draft: number
  }
}

function formatStatus(status: string) {
  const config: Record<string, { label: string; class: string; icon: any }> = {
    PUBLISHED: { label: 'Publié', class: 'pub', icon: CheckCircle2 },
    PENDING: { label: 'En attente', class: 'pend', icon: AlertCircle },
    REJECTED: { label: 'Rejeté', class: 'rej', icon: XCircle },
    DRAFT: { label: 'Brouillon', class: 'draft', icon: File }
  }
  return config[status] || { label: status, class: 'draft', icon: File }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(date)
}

export default function ContributorSubjectsClient({ user, subjects, stats }: ContributorSubjectsClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const filteredSubjects = statusFilter === 'ALL' 
    ? subjects 
    : subjects.filter(s => s.status === statusFilter)

  const totalSubjects = subjects.length
  const displayedSubjects = filteredSubjects.length

  return (
    <div className={`contributor-dashboard-page ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
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
            {subjects.reduce((sum, s) => sum + (s.revenus || 0), 0).toLocaleString('fr-FR')}
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
            <span className="sb-link-text">Vue d'ensemble</span>
          </Link>
          <Link className="sb-link active" href="/contributeur/sujets">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span className="sb-link-text">Mes sujets</span>
            <span className="sb-nb">{totalSubjects}</span>
          </Link>
          <Link className="sb-link" href="/contributeur/nouveau">
            <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 4v16m8-8H4"/>
            </svg>
            <span className="sb-link-text">Nouveau sujet</span>
          </Link>

          <div className="sb-section" style={{ marginTop: '0.75rem' }}><span className="sb-section-text">Finances</span></div>
          <Link className="sb-link" href="/contributeur/retraits">
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

      {/* Toggle Button - Outside Sidebar */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="topbar-title">
              Mes <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>sujets</em>
            </div>
            <div className="topbar-stats">
              <span className="stat-badge stat-published">
                <CheckCircle2 size={12} /> {stats.published}
              </span>
              <span className="stat-badge stat-pending">
                <AlertCircle size={12} /> {stats.pending}
              </span>
              <span className="stat-badge stat-rejected">
                <XCircle size={12} /> {stats.rejected}
              </span>
            </div>
          </div>
          <div className="topbar-right">
            <Link href="/contributeur/nouveau" className="btn-new-sujet">
              <FileText size={16} />
              Nouveau sujet
            </Link>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          {/* Filters */}
          <div className="subjects-filters">
            <button 
              className={`filter-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              Tous ({totalSubjects})
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'PUBLISHED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PUBLISHED')}
            >
              <CheckCircle2 size={14} />
              Publiés ({stats.published})
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PENDING')}
            >
              <AlertCircle size={14} />
              En attente ({stats.pending})
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'REJECTED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('REJECTED')}
            >
              <XCircle size={14} />
              Rejetés ({stats.rejected})
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'DRAFT' ? 'active' : ''}`}
              onClick={() => setStatusFilter('DRAFT')}
            >
              <File size={14} />
              Brouillons ({subjects.filter(s => s.status === 'DRAFT').length})
            </button>
          </div>

          {/* Subjects Table */}
          <div className="table-wrap">
            <div className="table-head">
              <div className="th">Titre</div>
              <div className="th">Statut</div>
              <div className="th">Niveau</div>
              <div className="th">Année</div>
              <div className="th">Ventes</div>
              <div className="th">Revenus</div>
              <div className="th">Actions</div>
            </div>

            <div className="table-body">
              {displayedSubjects === 0 ? (
                <div className="empty-state">
                  <FileText size={48} style={{ color: 'var(--text-3)', marginBottom: '1rem' }} />
                  <div style={{ color: 'var(--text)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Aucun sujet trouvé
                  </div>
                  <div style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>
                    {statusFilter === 'ALL' 
                      ? 'Commencez par publier votre premier sujet'
                      : `Aucun sujet ${statusFilter === 'PUBLISHED' ? 'publié' : statusFilter === 'PENDING' ? 'en attente' : statusFilter === 'REJECTED' ? 'rejeté' : 'brouillon'}`
                    }
                  </div>
                </div>
              ) : (
                filteredSubjects.map((subject: any) => {
                  const status = formatStatus(subject.status)
                  const StatusIcon = status.icon
                  return (
                    <div key={subject.id} className="table-row">
                      <div className="td td-title">
                        <div className="td-main">{subject.titre}</div>
                        <div className="td-sub">
                          {subject.matiere || 'N/A'} · {subject.series || 'Toutes séries'} · {subject.credits} cr
                        </div>
                      </div>
                      <div className="td">
                        <span className={`status-badge ${status.class}`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </div>
                      <div className="td">
                        <span className="grade-badge">{subject.grade || 'N/A'}</span>
                      </div>
                      <div className="td">{subject.year || 'N/A'}</div>
                      <div className="td" style={{ color: subject.ventes ? 'var(--text)' : 'var(--text-3)' }}>
                        {subject.ventes || '—'}
                      </div>
                      <div className="td" style={{ color: subject.revenus ? 'var(--gold)' : 'var(--text-3)' }}>
                        {subject.revenus ? `${subject.revenus.toLocaleString('fr-FR')} Ar` : '—'}
                      </div>
                      <div className="td td-actions">
                        <Link href={`/sujet/${subject.id}`} className="btn-action" title="Voir">
                          <Eye size={14} />
                        </Link>
                        <Link href={`/contributeur/nouveau?id=${subject.id}`} className="btn-action" title="Modifier">
                          <Edit3 size={14} />
                        </Link>
                        <Link href={`/contributeur/sujets/${subject.id}/stats`} className="btn-action" title="Stats">
                          <BarChart3 size={14} />
                        </Link>
                        <button className="btn-action btn-delete" title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
