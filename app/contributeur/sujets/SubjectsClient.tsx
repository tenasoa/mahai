'use client'

import { useState, useMemo, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  CheckCircle2, AlertCircle, XCircle, File, Edit3, BarChart3, Eye, Trash2,
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { useToast } from '@/lib/hooks/useToast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { requestSubjectDeletion } from './actions'

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

type StatusFilter = 'ALL' | 'PUBLISHED' | 'PENDING' | 'REJECTED' | 'DRAFT'
type SortKey = 'titre' | 'ventes' | 'revenus'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 10

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
  const searchParams = useSearchParams()
  const router = useRouter()
  const toast = useToast()
  const [isPending, startTransition] = useTransition()

  // Lecture du filtre initial depuis URL (deep-link depuis dashboard)
  const initialStatus = (searchParams.get('status') as StatusFilter) || 'ALL'

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Reset page à 1 quand filtre/recherche change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchQuery])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const result = await requestSubjectDeletion(deleteTarget.id)
      if (result.success) {
        toast.success(
          result.immediatelyRemoved ? 'Sujet supprimé' : 'Demande envoyée',
          result.message || 'Opération effectuée'
        )
        setDeleteTarget(null)
        startTransition(() => router.refresh())
      } else {
        toast.error('Erreur', result.error || 'Impossible de supprimer le sujet')
      }
    } catch (e) {
      toast.error('Erreur', 'Une erreur est survenue')
    } finally {
      setDeleting(false)
    }
  }

  // Filtrage + recherche + tri (B2 + U2)
  const processedSubjects = useMemo(() => {
    let list = [...subjects]

    // Filtre statut
    if (statusFilter !== 'ALL') {
      list = list.filter(s => s.status === statusFilter)
    }

    // Recherche (B2)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(s =>
        (s.titre || '').toLowerCase().includes(q) ||
        (s.matiere || '').toLowerCase().includes(q) ||
        (s.series || '').toLowerCase().includes(q) ||
        (s.grade || '').toLowerCase().includes(q)
      )
    }

    // Tri (U2)
    if (sortKey) {
      list.sort((a, b) => {
        let aVal: any = a[sortKey]
        let bVal: any = b[sortKey]
        if (sortKey === 'ventes' || sortKey === 'revenus') {
          aVal = Number(aVal) || 0
          bVal = Number(bVal) || 0
        } else {
          aVal = String(aVal || '').toLowerCase()
          bVal = String(bVal || '').toLowerCase()
        }
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }

    return list
  }, [subjects, statusFilter, searchQuery, sortKey, sortDir])

  // Pagination (U1)
  const totalPages = Math.max(1, Math.ceil(processedSubjects.length / PAGE_SIZE))
  const pagedSubjects = processedSubjects.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const SortIndicator = ({ keyName }: { keyName: SortKey }) => {
    if (sortKey !== keyName) return <ChevronsUpDown size={12} className="sort-indicator" />
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="sort-indicator" />
      : <ChevronDown size={12} className="sort-indicator" />
  }

  const totalSubjects = subjects.length

  const statusTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'ALL', label: 'Tous les sujets', count: totalSubjects },
    { key: 'PUBLISHED', label: 'Publiés', count: stats.published },
    { key: 'PENDING', label: 'En attente', count: stats.pending },
    { key: 'REJECTED', label: 'Rejetés', count: stats.rejected }
  ]

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
            Vous avez publié {stats.published} sujet{stats.published > 1 ? 's' : ''} pour un total de {totalSubjects} création{totalSubjects > 1 ? 's' : ''}.
          </p>
        </div>
        <div className="admin-header-actions">
          <Link href="/contributeur/sujets/nouveau" className="admin-btn admin-btn-primary">
            + Nouveau sujet
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid (U8 - cards cliquables avec feedback actif) */}
      <div className="kpi-grid contrib-animate-in" style={{ marginBottom: '2rem' }}>
        <button
          type="button"
          className={`kpi-card is-clickable ${statusFilter === 'PUBLISHED' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'PUBLISHED' ? 'ALL' : 'PUBLISHED')}
          aria-pressed={statusFilter === 'PUBLISHED'}
          style={{ textAlign: 'left', font: 'inherit', border: '1px solid var(--b2)' }}
        >
          <div className="kpi-header">
            <span className="kpi-title">Publiés</span>
            <div className="kpi-icon" style={{ background: 'var(--sage-dim)', color: 'var(--sage)' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="kpi-value">{stats.published}</div>
          <div className="kpi-trend" style={{ color: 'var(--sage)' }}>En ligne</div>
        </button>

        <button
          type="button"
          className={`kpi-card is-clickable ${statusFilter === 'PENDING' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
          aria-pressed={statusFilter === 'PENDING'}
          style={{ textAlign: 'left', font: 'inherit', border: '1px solid var(--b2)' }}
        >
          <div className="kpi-header">
            <span className="kpi-title">En attente</span>
            <div className="kpi-icon" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="kpi-value">{stats.pending}</div>
          <div className="kpi-trend" style={{ color: 'var(--amber)' }}>En vérification</div>
        </button>

        <button
          type="button"
          className={`kpi-card is-clickable ${statusFilter === 'REJECTED' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'REJECTED' ? 'ALL' : 'REJECTED')}
          aria-pressed={statusFilter === 'REJECTED'}
          style={{ textAlign: 'left', font: 'inherit', border: '1px solid var(--b2)' }}
        >
          <div className="kpi-header">
            <span className="kpi-title">Rejetés</span>
            <div className="kpi-icon" style={{ background: 'var(--ruby-dim)', color: 'var(--ruby)' }}>
              <XCircle size={16} />
            </div>
          </div>
          <div className="kpi-value">{stats.rejected}</div>
          <div className="kpi-trend" style={{ color: 'var(--ruby)' }}>À corriger</div>
        </button>

        <button
          type="button"
          className={`kpi-card is-clickable ${statusFilter === 'DRAFT' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'DRAFT' ? 'ALL' : 'DRAFT')}
          aria-pressed={statusFilter === 'DRAFT'}
          style={{ textAlign: 'left', font: 'inherit', border: '1px solid var(--b2)' }}
        >
          <div className="kpi-header">
            <span className="kpi-title">Brouillons</span>
            <div className="kpi-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-3)' }}>
              <File size={16} />
            </div>
          </div>
          <div className="kpi-value">{stats.draft}</div>
          <div className="kpi-trend">Non publiés</div>
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="admin-tabs">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            className={`admin-tab ${statusFilter === tab.key ? 'admin-tab-active' : ''}`}
            onClick={() => setStatusFilter(tab.key)}
          >
            {tab.label} <span className="admin-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-body" style={{ borderBottom: '1px solid var(--b2)', paddingBottom: '1.5rem' }}>
          <div className="contrib-card-header">
            <h3 className="contrib-card-title">
              Liste de vos créations
              {searchQuery && (
                <span style={{ fontWeight: 400, color: 'var(--text-4)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                  — {processedSubjects.length} résultat{processedSubjects.length > 1 ? 's' : ''}
                </span>
              )}
            </h3>
            <div className="contrib-search-wrap">
              <Search size={14} className="contrib-search-icon" />
              <input
                type="text"
                placeholder="Rechercher un sujet, une matière…"
                className="contrib-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Rechercher un sujet"
              />
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th
                  className={`is-sortable ${sortKey === 'titre' ? 'is-sorted' : ''}`}
                  onClick={() => handleSort('titre')}
                >
                  Sujet
                  <SortIndicator keyName="titre" />
                </th>
                <th>Statut</th>
                <th>Niveau &amp; Année</th>
                <th
                  className={`is-sortable ${sortKey === 'ventes' ? 'is-sorted' : ''}`}
                  onClick={() => handleSort('ventes')}
                >
                  Ventes
                  <SortIndicator keyName="ventes" />
                </th>
                <th
                  className={`is-sortable ${sortKey === 'revenus' ? 'is-sorted' : ''}`}
                  onClick={() => handleSort('revenus')}
                >
                  Gains cumulés
                  <SortIndicator keyName="revenus" />
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedSubjects.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty-state">
                      <File className="admin-empty-state-icon" size={48} />
                      <div className="admin-empty-state-text">
                        {searchQuery
                          ? `Aucun sujet ne correspond à "${searchQuery}".`
                          : statusFilter === 'ALL'
                            ? 'Vous n\'avez pas encore créé de sujet.'
                            : `Aucun sujet ${statusFilter === 'PUBLISHED' ? 'publié' : statusFilter === 'PENDING' ? 'en attente' : statusFilter === 'REJECTED' ? 'rejeté' : 'brouillon'}.`}
                      </div>
                      {statusFilter === 'ALL' && !searchQuery && (
                        <Link href="/contributeur/sujets/nouveau" className="admin-btn admin-btn-primary" style={{ marginTop: '1rem' }}>
                          Créer mon premier sujet
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                pagedSubjects.map((subject: any) => {
                  const status = formatStatus(subject.status)
                  const StatusIcon = status.icon

                  let badgeClass = 'status-gray'
                  if (subject.status === 'PUBLISHED') badgeClass = 'status-green'
                  if (subject.status === 'PENDING') badgeClass = 'status-amber'
                  if (subject.status === 'REJECTED') badgeClass = 'status-ruby'

                  return (
                    <tr key={subject.id}>
                      <td>
                        <div className="contrib-subject-cell">
                          <span className="contrib-subject-title">{subject.titre}</span>
                          <span className="contrib-subject-meta">
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
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.9rem', color: subject.ventes ? 'var(--text)' : 'var(--text-4)' }}>
                          {subject.ventes || '0'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--mono)', fontWeight: 500, color: subject.revenus ? 'var(--gold)' : 'var(--text-4)' }}>
                          {subject.revenus ? `${Number(subject.revenus).toLocaleString('fr-FR')} Ar` : '0 Ar'}
                        </span>
                      </td>
                      <td>
                        <div className="contrib-row-actions">
                          <Link href={`/sujet/${subject.id}`} className="admin-btn admin-btn-outline" title="Voir" aria-label="Voir le sujet">
                            <Eye size={14} />
                          </Link>
                          <Link href={`/contributeur/sujets/${subject.id}/edit`} className="admin-btn admin-btn-outline" title="Modifier" aria-label="Modifier le sujet">
                            <Edit3 size={14} />
                          </Link>
                          <Link href={`/contributeur/sujets/${subject.id}/stats`} className="admin-btn admin-btn-outline" title="Statistiques" aria-label="Voir les statistiques">
                            <BarChart3 size={14} />
                          </Link>
                          <button
                            className="admin-btn admin-btn-outline admin-btn-reject"
                            title="Supprimer"
                            aria-label="Supprimer le sujet"
                            onClick={() => setDeleteTarget({ id: subject.id, title: subject.titre })}
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

        {/* Pagination (U1) */}
        {processedSubjects.length > PAGE_SIZE && (
          <div className="contrib-pagination">
            <span className="contrib-pagination-info">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, processedSubjects.length)} sur {processedSubjects.length}
            </span>
            <div className="contrib-pagination-controls">
              <button
                type="button"
                className="contrib-pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span style={{ color: 'var(--text-4)', padding: '0 4px' }}>…</span>
                    )}
                    <button
                      type="button"
                      className={`contrib-pagination-btn ${currentPage === p ? 'is-active' : ''}`}
                      onClick={() => setCurrentPage(p)}
                      aria-label={`Page ${p}`}
                      aria-current={currentPage === p ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                type="button"
                className="contrib-pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Supprimer "${deleteTarget?.title ?? ''}" ?`}
        description="Si ce sujet n'a pas de ventes, il sera immédiatement retiré. Sinon une demande sera envoyée à l'administration pour préserver les achats existants."
        confirmLabel={deleting ? 'Suppression…' : 'Supprimer définitivement'}
        variant="danger"
      />
    </div>
  )
}
