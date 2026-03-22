'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, XCircle, File, Edit3, BarChart3, Eye, Trash2, TrendingUp } from 'lucide-react'
import { useToast } from '@/lib/hooks/useToast'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { ContributorSidebar } from '@/components/contributeur/ContributorSidebar'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
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

export default function ContributorSubjectsClient({ user, subjects, stats }: ContributorSubjectsClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const toast = useToast()

  // Persistance du sidebar
  useEffect(() => {
    const saved = localStorage.getItem('mahai_sidebar_collapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  // Appliquer le thème dark par défaut
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('mahai_sidebar_collapsed', String(newState))
  }

  const handleDelete = async () => {
    if (!deleteId) return
    // Simulation d'appel API
    toast.success('Succès', 'Demande de suppression envoyée à l\'administration.')
    setDeleteId(null)
  }

  const filteredSubjects = statusFilter === 'ALL'
    ? subjects
    : subjects.filter(s => s.status === statusFilter)

  const totalSubjects = subjects.length
  const displayedSubjects = filteredSubjects.length

  return (
    <div className={`contributor-dashboard-page ${isCollapsed ? 'sidebar-collapsed' : ''}`} data-theme="dark">
      {/* Sidebar Component */}
      <ContributorSidebar 
        user={user} 
        isCollapsed={isCollapsed} 
        onToggle={toggleSidebar}
        stats={{
          earnings: subjects.reduce((sum, s) => sum + (s.revenus || 0), 0),
          monthEarnings: 0,
          totalSubjects: subjects.length
        }}
      />

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
            {/* Action buttons could go here */}
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
                <EmptyState
                  title="Aucun sujet trouvé"
                  description={statusFilter === 'ALL' 
                    ? 'Commencez par publier votre premier sujet'
                    : `Aucun sujet ${statusFilter === 'PUBLISHED' ? 'publié' : statusFilter === 'PENDING' ? 'en attente' : statusFilter === 'REJECTED' ? 'rejeté' : 'brouillon'}`
                  }
                  icon={File}
                  actionLabel={statusFilter === 'ALL' ? "Nouveau sujet" : undefined}
                  actionHref={statusFilter === 'ALL' ? "/contributeur/nouveau" : undefined}
                />
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
                        <button 
                          className="btn-action btn-delete" 
                          title="Supprimer"
                          onClick={() => setDeleteId(subject.id)}
                        >
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
      
      <LuxuryCursor />

      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer ce sujet ?"
        description="Cette action est irréversible. Le sujet sera retiré de la vente et vos gains associés seront gelés."
        confirmLabel="Supprimer définitivement"
        variant="danger"
      />
    </div>
  )
}
