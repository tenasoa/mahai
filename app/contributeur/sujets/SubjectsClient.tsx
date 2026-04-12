'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, XCircle, File, Edit3, BarChart3, Eye, Trash2 } from 'lucide-react'
import { useToast } from '@/lib/hooks/useToast'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

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
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const toast = useToast()

  const handleDelete = async () => {
    if (!deleteId) return
    toast.success('Succès', 'Demande de suppression envoyée à l\'administration.')
    setDeleteId(null)
  }

  const filteredSubjects = statusFilter === 'ALL'
    ? subjects
    : subjects.filter(s => s.status === statusFilter)

  const totalSubjects = subjects.length
  const displayedSubjects = filteredSubjects.length

  return (
    <div className="admin-page-content">
      {/* Header Section */}
      <div className="admin-header">
        <div>
          <div className="admin-header-badge">
            <File size={12} />
            Gestion du contenu
          </div>
          <h1 className="admin-title">Mes sujets</h1>
          <p className="admin-subtitle">
            Vous avez publié {stats.published} sujets pour un total de {totalSubjects} créations.
          </p>
        </div>
        <div className="admin-header-actions">
          <Link href="/contributeur/nouveau" className="admin-btn admin-btn-primary">
            + Nouveau sujet
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="kpi-card" onClick={() => setStatusFilter('PUBLISHED')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Publiés</span>
            <div className="kpi-icon" style={{ background: 'var(--sage-dim)', color: 'var(--sage)' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="kpi-value">{stats.published}</div>
          <div className="kpi-trend" style={{ color: 'var(--sage)' }}>En ligne</div>
        </div>

        <div className="kpi-card" onClick={() => setStatusFilter('PENDING')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">En attente</span>
            <div className="kpi-icon" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="kpi-value">{stats.pending}</div>
          <div className="kpi-trend" style={{ color: 'var(--amber)' }}>En vérification</div>
        </div>

        <div className="kpi-card" onClick={() => setStatusFilter('REJECTED')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Rejetés</span>
            <div className="kpi-icon" style={{ background: 'var(--ruby-dim)', color: 'var(--ruby)' }}>
              <XCircle size={16} />
            </div>
          </div>
          <div className="kpi-value">{stats.rejected}</div>
          <div className="kpi-trend" style={{ color: 'var(--ruby)' }}>À corriger</div>
        </div>

        <div className="kpi-card" onClick={() => setStatusFilter('DRAFT')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Brouillons</span>
            <div className="kpi-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-3)' }}>
              <File size={16} />
            </div>
          </div>
          <div className="kpi-value">{stats.draft}</div>
          <div className="kpi-trend">Non publiés</div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${statusFilter === 'ALL' ? 'admin-tab-active' : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          Tous les sujets <span className="admin-tab-count">{totalSubjects}</span>
        </button>
        <button 
          className={`admin-tab ${statusFilter === 'PUBLISHED' ? 'admin-tab-active' : ''}`}
          onClick={() => setStatusFilter('PUBLISHED')}
        >
          Publiés <span className="admin-tab-count">{stats.published}</span>
        </button>
        <button 
          className={`admin-tab ${statusFilter === 'PENDING' ? 'admin-tab-active' : ''}`}
          onClick={() => setStatusFilter('PENDING')}
        >
          En attente <span className="admin-tab-count">{stats.pending}</span>
        </button>
        <button 
          className={`admin-tab ${statusFilter === 'REJECTED' ? 'admin-tab-active' : ''}`}
          onClick={() => setStatusFilter('REJECTED')}
        >
          Rejetés <span className="admin-tab-count">{stats.rejected}</span>
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-body" style={{ borderBottom: '1px solid var(--b2)', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Liste de vos créations</h3>
            <div style={{ position: 'relative', width: '300px' }}>
              <input 
                type="text" 
                placeholder="Rechercher un sujet..." 
                className="admin-input"
                style={{ height: '36px', paddingLeft: '2.5rem', fontSize: '0.85rem' }}
              />
              <File size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)' }} />
            </div>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sujet</th>
                <th>Statut</th>
                <th>Niveau & Année</th>
                <th>Ventes</th>
                <th>Gains cumulés</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedSubjects === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty-state">
                      <File className="admin-empty-state-icon" size={48} />
                      <div className="admin-empty-state-text">
                        {statusFilter === 'ALL' 
                          ? 'Vous n\'avez pas encore créé de sujet.'
                          : `Aucun sujet ${statusFilter === 'PUBLISHED' ? 'publié' : statusFilter === 'PENDING' ? 'en attente' : statusFilter === 'REJECTED' ? 'rejeté' : 'brouillon'}`}
                      </div>
                      {statusFilter === 'ALL' && (
                        <Link href="/contributeur/nouveau" className="admin-btn admin-btn-primary" style={{ marginTop: '1rem' }}>
                          Créer mon premier sujet
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject: any) => {
                  const status = formatStatus(subject.status)
                  const StatusIcon = status.icon
                  
                  // Déterminer la classe de statut pour le Luxury System
                  let badgeClass = 'status-gray'
                  if (subject.status === 'PUBLISHED') badgeClass = 'status-green'
                  if (subject.status === 'PENDING') badgeClass = 'status-amber'
                  if (subject.status === 'REJECTED') badgeClass = 'status-ruby'

                  return (
                    <tr key={subject.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 500, color: 'var(--text)', fontSize: '0.95rem' }}>{subject.titre}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>
                            {subject.matiere || 'Matière N/A'} · {subject.series || 'Toutes séries'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${badgeClass}`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span className="status-badge status-blue" style={{ fontSize: '0.7rem' }}>{subject.grade || 'N/A'}</span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--text-3)' }}>{subject.year || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.9rem', color: subject.ventes ? 'var(--text)' : 'var(--text-4)' }}>
                          {subject.ventes || '0'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'var(--mono)', fontWeight: 500, color: subject.revenus ? 'var(--gold)' : 'var(--text-4)' }}>
                          {subject.revenus ? `${subject.revenus.toLocaleString('fr-FR')} Ar` : '0 Ar'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <Link href={`/sujet/${subject.id}`} className="admin-btn admin-btn-outline" style={{ padding: '0.4rem' }} title="Voir">
                            <Eye size={14} />
                          </Link>
                          <Link href={`/contributeur/nouveau?id=${subject.id}`} className="admin-btn admin-btn-outline" style={{ padding: '0.4rem' }} title="Modifier">
                            <Edit3 size={14} />
                          </Link>
                          <Link href={`/contributeur/sujets/${subject.id}/stats`} className="admin-btn admin-btn-outline" style={{ padding: '0.4rem' }} title="Statistiques">
                            <BarChart3 size={14} />
                          </Link>
                          <button 
                            className="admin-btn admin-btn-outline admin-btn-reject" 
                            style={{ padding: '0.4rem' }}
                            title="Supprimer"
                            onClick={() => setDeleteId(subject.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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