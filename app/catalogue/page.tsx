'use client'

import { useState, useEffect, useRef } from 'react'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { useCatalogue } from '@/lib/hooks/useCatalogue'
import { useAuth } from '@/lib/hooks/useAuth'
import type { CatalogueQueryParams, ExamenType, Difficulte, Langue, Format, Badge } from '@/types/catalogue'
import { BADGE_LABELS, DIFFICULTE_LABELS, DIFFICULTE_COLORS, MATIERE_GLYPHS } from '@/types/catalogue'
import './catalogue.css'

export default function CataloguePage() {
  const { userId } = useAuth()
  
  const {
    subjects,
    loading,
    error,
    pagination,
    currentPage,
    setPage,
    setFilters,
    clearFilters,
    refresh,
    wishedIds,
    toggleWishlist,
    isWished,
    activeFilters,
  } = useCatalogue({
    userId,
    pageSize: 9,
    initialFilters: {
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
  })

  // États locaux pour les filtres UI
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [currentSubject, setCurrentSubject] = useState<typeof subjects[0] | null>(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)

  // Filtres UI
  const [selectedTypes, setSelectedTypes] = useState<ExamenType[]>([])
  const [selectedMatieres, setSelectedMatieres] = useState<string[]>([])
  const [selectedDifficultes, setSelectedDifficultes] = useState<Difficulte[]>([])
  const [selectedLangues, setSelectedLangues] = useState<Langue[]>([])
  const [selectedFormats, setSelectedFormats] = useState<Format[]>([])
  const [maxCredits, setMaxCredits] = useState<number>(200)

  const toastIdRef = useRef(0)
  const lastToastTime = useRef<number>(0)

  // Initialiser le thème
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setIsDark(savedTheme === 'dark')
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  // Toggle thème
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  // Toast helper
  const showToast = (type: 'success' | 'error' | 'info', title: string, msg: string, duration = 4000) => {
    const id = ++toastIdRef.current
    const event = new CustomEvent('toast', { detail: { id, type, title, msg } })
    window.dispatchEvent(event)
    setTimeout(() => {
      const closeEvent = new CustomEvent('toast-close', { detail: { id } })
      window.dispatchEvent(closeEvent)
    }, duration)
  }

  // Gestionnaires des filtres
  const toggleType = (type: ExamenType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type]
    setSelectedTypes(newTypes)
    setFilters({ types: newTypes.length > 0 ? newTypes : undefined })
  }

  const toggleMatiere = (matiere: string) => {
    const newMatieres = selectedMatieres.includes(matiere)
      ? selectedMatieres.filter(m => m !== matiere)
      : [...selectedMatieres, matiere]
    setSelectedMatieres(newMatieres)
    setFilters({ matieres: newMatieres.length > 0 ? newMatieres : undefined })
  }

  const toggleDifficulte = (diff: Difficulte) => {
    const newDiff = selectedDifficultes.includes(diff)
      ? selectedDifficultes.filter(d => d !== diff)
      : [...selectedDifficultes, diff]
    setSelectedDifficultes(newDiff)
    setFilters({ difficultes: newDiff.length > 0 ? newDiff : undefined })
  }

  const toggleLangue = (langue: Langue) => {
    const newLangues = selectedLangues.includes(langue)
      ? selectedLangues.filter(l => l !== langue)
      : [...selectedLangues, langue]
    setSelectedLangues(newLangues)
    setFilters({ langues: newLangues.length > 0 ? newLangues : undefined })
  }

  const toggleFormat = (format: Format) => {
    const newFormats = selectedFormats.includes(format)
      ? selectedFormats.filter(f => f !== format)
      : [...selectedFormats, format]
    setSelectedFormats(newFormats)
    setFilters({ formats: newFormats.length > 0 ? newFormats : undefined })
  }

  const handleMaxCreditsChange = (value: number) => {
    setMaxCredits(value)
    setFilters({ maxCredits: value < 200 ? value : undefined })
  }

  const resetFilters = () => {
    setSelectedTypes([])
    setSelectedMatieres([])
    setSelectedDifficultes([])
    setSelectedLangues([])
    setSelectedFormats([])
    setMaxCredits(200)
    clearFilters()
    showToast('info', 'Filtres', 'Tous les filtres réinitialisés')
  }

  // Wishlist handler
  const handleToggleFav = async (id: string) => {
    const now = Date.now()
    if (now - lastToastTime.current < 500) return

    const wasInWish = isWished(id)
    await toggleWishlist(id)

    if (!wasInWish) {
      lastToastTime.current = now
      showToast('success', 'Favori', 'Sujet ajouté à vos favoris')
      setTimeout(() => { lastToastTime.current = 0 }, 600)
    }
  }

  // Modal handlers
  const openPreviewModal = (subject: typeof subjects[0]) => {
    setCurrentSubject(subject)
    setPreviewPage(1)
    setPreviewModalOpen(true)
  }

  const openBuyModal = (subject: typeof subjects[0]) => {
    setCurrentSubject(subject)
    setBuyModalOpen(true)
  }

  const confirmBuy = () => {
    setBuyModalOpen(false)
    if (currentSubject) {
      showToast('success', 'Achat confirmé', `${currentSubject.titre} ajouté à votre bibliothèque !`)
    }
  }

  // Preview pagination
  const totalPages = 18
  const prevPage = () => setPreviewPage(p => Math.max(1, p - 1))
  const nextPage = () => setPreviewPage(p => Math.min(totalPages, p + 1))

  // Recherche (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        setFilters({ search: search.trim() })
      } else {
        setFilters({ search: undefined })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [search, setFilters])

  return (
    <>
      <LuxuryCursor />
      
      {/* Toast Container */}
      <ToastContainer />

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="logo">
            Mah<span className="logo-gem"></span>AI
          </a>
          <div className="nav-search">
            <span className="nav-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Chercher un sujet, matière, année…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="nav-search-input"
            />
          </div>
          <div className="nav-right">
            <div className="credit-badge">
              <span className="credit-icon">◆</span>1 200 cr
            </div>
            <button
              className="btn-sm btn-ghost"
              onClick={() => showToast('info', 'MVola', 'Rechargez vos crédits via MVola')}
            >
              + Recharger
            </button>
            <button
              className="btn-sm btn-ghost"
              onClick={toggleTheme}
              title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              style={{ width: '34px', height: '34px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <div className="avatar">A</div>
          </div>
        </div>
      </nav>

      {/* Sidebar Fixed */}
      <aside className="sidebar" id="sidebar">
        <div className="filter-panel">
          <div className="filter-head">
            <div className="filter-label">
              <div className="filter-label-dot"></div>
              Filtres
            </div>
            <button className="filter-reset" onClick={resetFilters}>
              Réinitialiser
            </button>
          </div>
          <div className="filter-body">
            {/* Type d'examen */}
            <div className="filter-section">
              <div className="fsec-title">Type d'examen</div>
              <div className="pill-row">
                {(['BAC', 'BEPC', 'CEPE'] as ExamenType[]).map(type => (
                  <div
                    key={type}
                    className={`pill ${selectedTypes.includes(type) ? 'on-solid' : ''}`}
                    onClick={() => toggleType(type)}
                  >{type}</div>
                ))}
              </div>
            </div>

            {/* Difficulté */}
            <div className="filter-section">
              <div className="fsec-title">Difficulté</div>
              <div className="diff-grid">
                {(['FACILE', 'MOYEN', 'DIFFICILE'] as Difficulte[]).map(diff => (
                  <div
                    key={diff}
                    className={`diff-btn ${diff.toLowerCase()} ${selectedDifficultes.includes(diff) ? 'on' : ''}`}
                    onClick={() => toggleDifficulte(diff)}
                  >{DIFFICULTE_LABELS[diff]}</div>
                ))}
              </div>
            </div>

            {/* Prix max */}
            <div className="filter-section">
              <div className="fsec-title">
                Prix max — <span style={{ color: 'var(--gold)' }}>{maxCredits} cr</span>
              </div>
              <div className="range-wrap">
                <input
                  type="range"
                  className="range-input"
                  min="0"
                  max="200"
                  value={maxCredits}
                  onChange={(e) => handleMaxCreditsChange(Number(e.target.value))}
                />
              </div>
              <div className="range-labels">
                <span>Gratuit</span>
                <span>200 cr</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-area">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.85rem', flexWrap: 'wrap', gap: '.65rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontSize: '1.6rem', fontWeight: 400, letterSpacing: '-.02em', color: 'var(--text)', lineHeight: 1 }}>
              Catalogue <em style={{ fontStyle: 'italic', color: 'var(--text-3)', fontSize: '.7em' }}>des sujets</em>
            </h1>
          </div>
          <button className="filter-toggle-btn" onClick={() => setDrawerOpen(true)}>
            ⚙ Filtres
          </button>
        </div>

        {/* Results Bar */}
        <div className="results-bar">
          <div className="results-count">
            <strong>{loading ? '...' : pagination.totalItems}</strong> sujets trouvés
          </div>
          <div className="sort-view">
            <select className="sort-select" onChange={(e) => setFilters({ sortBy: e.target.value as any })}>
              <option value="createdAt">Plus récents</option>
              <option value="rating">Mieux notés</option>
              <option value="reviewsCount">Plus populaires</option>
              <option value="credits">Prix croissant</option>
            </select>
            <div className="view-toggle">
              <button
                className={`vt-btn ${viewMode === 'grid' ? 'on' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                ⊞
              </button>
              <button
                className={`vt-btn ${viewMode === 'list' ? 'on' : ''}`}
                onClick={() => setViewMode('list')}
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={`papers-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="pcard skeleton-card">
                <div className="pc-thumb skeleton"></div>
                <div className="pc-body">
                  <div className="skeleton" style={{ height: '16px', marginBottom: '8px' }}></div>
                  <div className="skeleton" style={{ height: '14px', width: '70%' }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <div className="empty-title">Erreur de chargement</div>
            <div className="empty-sub">{error.message}</div>
            <button className="btn-consult" onClick={refresh}>Réessayer</button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && subjects.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">Aucun sujet trouvé</div>
            <div className="empty-sub">Essayez d'élargir vos filtres ou de changer votre recherche.</div>
            <button className="btn-consult" onClick={resetFilters}>Réinitialiser les filtres</button>
          </div>
        )}

        {/* Cards Grid */}
        {!loading && !error && subjects.length > 0 && (
          <div className={`papers-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {subjects.map((subject) => (
              <div key={subject.id} className="pcard">
                <div className="pc-thumb">
                  <div className="pc-thumb-lines"></div>
                  <div className="pc-thumb-glyph">
                    {subject.glyph || MATIERE_GLYPHS[subject.matiere] || '∑'}
                  </div>
                  <div className={`pc-badge ${subject.badge.toLowerCase()}`}>
                    {BADGE_LABELS[subject.badge as Badge] || subject.badge}
                  </div>
                  <button
                    className="pc-fav"
                    onClick={() => handleToggleFav(subject.id)}
                    title={isWished(subject.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    {isWished(subject.id) ? '🔖' : '📑'}
                  </button>
                </div>
                <div className="pc-body">
                  <div className="pc-meta-row">
                    <span className="pc-exam">{subject.type} · {subject.matiere}</span>
                    <span className="pc-year">{subject.annee}</span>
                  </div>
                  <div className="pc-title">{subject.titre}</div>
                  <div className="pc-info">
                    {subject.pages} pages · {subject.difficulte === 'FACILE' ? 'Facile' : subject.difficulte === 'MOYEN' ? 'Moyen' : 'Difficile'}
                  </div>
                  <div className="pc-rating">
                    <div className="pc-stars">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className="pc-star"
                          style={{ color: i < Math.floor(subject.rating) ? 'var(--gold)' : 'var(--text-4)' }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="pc-review-count">({subject.reviewsCount})</span>
                  </div>
                </div>
                <div className="pc-footer">
                  <div className={`pc-price ${subject.credits === 0 ? 'free-price' : ''}`}>
                    {subject.credits === 0 ? 'Gratuit' : (
                      <>
                        {subject.credits} <span className="unit">cr</span>
                      </>
                    )}
                  </div>
                  <div className="pc-actions">
                    <button className="btn-preview" onClick={() => openPreviewModal(subject)}>
                      Aperçu
                    </button>
                    <button className="btn-buy" onClick={() => openBuyModal(subject)}>
                      {subject.credits === 0 ? 'Obtenir' : 'Acheter'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="pg-btn"
              onClick={() => setPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              ‹
            </button>
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                className={`pg-btn ${currentPage === i + 1 ? 'on' : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="pg-btn"
              onClick={() => setPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              ›
            </button>
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {previewModalOpen && currentSubject && (
        <div
          className="modal-overlay open"
          onClick={() => setPreviewModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="modal-title">{currentSubject.titre}</div>
                <div className="modal-sub">{currentSubject.type} · {currentSubject.matiere} · {currentSubject.annee}</div>
              </div>
              <button className="modal-close" onClick={() => setPreviewModalOpen(false)}>✕</button>
            </div>
            <div className="preview-viewport">
              <div className="preview-paper">
                <div className="pp-line h"></div>
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`pp-line ${i % 2 === 0 ? 'm' : 's'}`}></div>
                ))}
              </div>
              <div
                className="locked-msg"
                style={{ display: previewPage > 4 ? 'flex' : 'none' }}
              >
                <div className="locked-icon">🔒</div>
                <div className="locked-text">Achetez pour débloquer</div>
              </div>
            </div>
            <div className="preview-nav" style={{ marginBottom: '1.25rem' }}>
              <button className="prev-nav-btn" onClick={prevPage}>‹</button>
              <span className="pg-indicator">Page {previewPage} / {totalPages}</span>
              <button className="prev-nav-btn" onClick={nextPage}>›</button>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--b3)', borderRadius: 'var(--r)', padding: '.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.65rem' }}>
              <div style={{ fontSize: '.78rem', color: 'var(--text-2)' }}>
                {currentSubject.pages} pages · {currentSubject.difficulte}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '.75rem', color: 'var(--gold)' }}>
                {currentSubject.credits === 0 ? 'Gratuit' : `${currentSubject.credits} cr`}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-buy" onClick={() => { setPreviewModalOpen(false); openBuyModal(currentSubject); }}>
                Acheter — {currentSubject.credits === 0 ? 'Gratuit' : `${currentSubject.credits} cr`}
              </button>
              <button className="btn-modal-ghost" onClick={() => setPreviewModalOpen(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {buyModalOpen && currentSubject && (
        <div
          className="modal-overlay open"
          onClick={() => setBuyModalOpen(false)}
        >
          <div className="modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="modal-title">Confirmer l'achat</div>
                <div className="modal-sub">{currentSubject.titre}</div>
              </div>
              <button className="modal-close" onClick={() => setBuyModalOpen(false)}>✕</button>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--b1)', borderRadius: 'var(--r)', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.65rem' }}>
                <span style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>Prix du sujet</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '.85rem', color: 'var(--gold)' }}>
                  {currentSubject.credits === 0 ? 'Gratuit' : `${currentSubject.credits} cr`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.65rem' }}>
                <span style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>Votre solde actuel</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '.85rem', color: 'var(--text)' }}>1 200 cr</span>
              </div>
              <div style={{ height: '1px', background: 'var(--b1)', margin: '.75rem 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '.85rem', fontWeight: 500, color: 'var(--text)' }}>Solde après achat</span>
                <span style={{ fontFamily: 'var(--display)', fontSize: '1.25rem', color: 'var(--gold)' }}>
                  {currentSubject.credits === 0 ? '1 200 cr' : `${1200 - currentSubject.credits} cr`}
                </span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-buy" onClick={confirmBuy}>
                Confirmer l'achat
              </button>
              <button className="btn-modal-ghost" onClick={() => setBuyModalOpen(false)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Drawer */}
      <div
        className="drawer-overlay"
        id="drawerOverlay"
        onClick={() => setDrawerOpen(false)}
        style={{ opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? 'all' : 'none' }}
      ></div>
      <div
        className="filter-drawer"
        id="filterDrawer"
        style={{ transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
        <div style={{ marginTop: '2rem' }}>
          <div className="filter-section">
            <div className="fsec-title">Type d'examen</div>
            <div className="pill-row">
              {(['BAC', 'BEPC', 'CEPE'] as ExamenType[]).map(type => (
                <div
                  key={type}
                  className={`pill ${selectedTypes.includes(type) ? 'on-solid' : ''}`}
                  onClick={() => {
                    toggleType(type)
                    setDrawerOpen(false)
                  }}
                >{type}</div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <button
              onClick={() => setDrawerOpen(false)}
              style={{ width: '100%', background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))', color: 'var(--void)', border: 'none', borderRadius: 'var(--r)', padding: '.75rem', fontFamily: 'var(--body)', fontSize: '.85rem', fontWeight: 500, cursor: 'none' }}
            >
              Appliquer les filtres
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// Toast Component
function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{ id: number; type: string; title: string; msg: string }>>([])

  useEffect(() => {
    const handleToast = (e: CustomEvent) => {
      setToasts(prev => [...prev, e.detail])
    }
    const handleCloseToast = (e: CustomEvent) => {
      setToasts(prev => prev.filter(t => t.id !== e.detail.id))
    }

    window.addEventListener('toast' as any, handleToast as any)
    window.addEventListener('toast-close' as any, handleCloseToast as any)

    return () => {
      window.removeEventListener('toast' as any, handleToast as any)
      window.removeEventListener('toast-close' as any, handleCloseToast as any)
    }
  }, [])

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? '✦' : toast.type === 'error' ? '✕' : toast.type === 'info' ? 'ℹ' : '⚠'}
          </div>
          <div>
            <div className="toast-title">{toast.title}</div>
            <div className="toast-msg">{toast.msg}</div>
          </div>
          <button
            className="toast-close"
            onClick={() => {
              const event = new CustomEvent('toast-close', { detail: { id: toast.id } })
              window.dispatchEvent(event)
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
