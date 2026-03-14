'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import './catalogue.css'

interface Subject {
  id: string
  title: string
  exam: string
  year: string
  info: string
  rating: number
  reviews: number
  price: number | 'free'
  badge: 'gold' | 'ai' | 'free' | 'inter'
  glyph: string
}

const SUBJECTS: Subject[] = [
  { id: '1', title: 'Algèbre & Fonctions — Session officielle', exam: 'BAC · Mathématiques', year: '2024', info: '18 pages · 3h · Difficile', rating: 4, reviews: 124, price: 15, badge: 'gold', glyph: '∑' },
  { id: '2', title: 'Mécanique & Électricité', exam: 'BEPC · Physique-Chimie', year: '2023', info: '12 pages · 2h · Moyen', rating: 4, reviews: 87, price: 10, badge: 'ai', glyph: 'φ' },
  { id: '3', title: 'Compréhension & Expression écrite', exam: 'CEPE · Français', year: '2022', info: '8 pages · 2h · Facile', rating: 5, reviews: 212, price: 'free', badge: 'free', glyph: '∂' },
  { id: '4', title: 'Biologie Cellulaire & Génétique', exam: 'BAC · SVT', year: '2023', info: '16 pages · 3h · Difficile', rating: 4, reviews: 65, price: 20, badge: 'inter', glyph: 'Ω' },
  { id: '5', title: 'Géographie de Madagascar', exam: 'BEPC · Histoire-Géo', year: '2022', info: '10 pages · 2h · Moyen', rating: 3, reviews: 43, price: 8, badge: 'ai', glyph: 'π' },
  { id: '6', title: 'Dissertation & Argumentation', exam: 'BAC · Philosophie', year: '2024', info: '6 pages · 4h · Difficile', rating: 5, reviews: 98, price: 25, badge: 'gold', glyph: 'λ' },
]

interface Toast {
  id: number
  type: 'success' | 'error' | 'info' | 'warn'
  title: string
  msg: string
}

export default function CataloguePage() {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeFilters, setActiveFilters] = useState<string[]>(['BAC', 'Français', 'PDF'])
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [wished, setWished] = useState<Set<string>>(new Set())
  const [isDark, setIsDark] = useState(true)

  // États des filtres
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['BAC'])
  const [selectedMatieres, setSelectedMatieres] = useState<string[]>([])
  const [selectedAnnees, setSelectedAnnees] = useState<string[]>([])
  const [selectedDifficultes, setSelectedDifficultes] = useState<string[]>(['Facile', 'Moyen', 'Difficile'])
  const [selectedLangues, setSelectedLangues] = useState<string[]>(['Français'])
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['PDF'])
  const [minRating, setMinRating] = useState<number | null>(null)
  const [maxPrice, setMaxPrice] = useState<number>(200)
  const [yearRange, setYearRange] = useState<number>(2003)

  const toastIdRef = useRef(0)

  // Initialiser le thème au montage
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

  // Gestionnaires des filtres
  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const toggleMatiere = (matiere: string) => {
    setSelectedMatieres(prev => 
      prev.includes(matiere) ? prev.filter(m => m !== matiere) : [...prev, matiere]
    )
  }

  const toggleAnnee = (annee: string) => {
    setSelectedAnnees(prev => 
      prev.includes(annee) ? prev.filter(a => a !== annee) : [...prev, annee]
    )
  }

  const toggleDifficulte = (diff: string) => {
    setSelectedDifficultes(prev => 
      prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff]
    )
  }

  const toggleLangue = (langue: string) => {
    setSelectedLangues(prev => 
      prev.includes(langue) ? prev.filter(l => l !== langue) : [...prev, langue]
    )
  }

  const toggleFormat = (format: string) => {
    setSelectedFormats(prev => 
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    )
  }

  const resetFilters = () => {
    setSelectedTypes([])
    setSelectedMatieres([])
    setSelectedAnnees([])
    setSelectedDifficultes([])
    setSelectedLangues([])
    setSelectedFormats([])
    setMinRating(null)
    setMaxPrice(200)
    setYearRange(2003)
    showToast('info', 'Filtres', 'Tous les filtres réinitialisés')
  }

  // Toast helper
  const showToast = useCallback((type: Toast['type'], title: string, msg: string, duration = 4000) => {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, type, title, msg }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // Filter handlers
  const removeFilter = (filter: string) => {
    setActiveFilters(prev => prev.filter(f => f !== filter))
  }

  // Wishlist handler
  const toggleFav = (id: string) => {
    setWished(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        showToast('success', 'Favori', 'Sujet ajouté à vos favoris')
      }
      return next
    })
  }

  // Modal handlers
  const openPreviewModal = (subject: Subject) => {
    setCurrentSubject(subject)
    setPreviewPage(1)
    setPreviewModalOpen(true)
  }

  const openBuyModal = (subject: Subject) => {
    setCurrentSubject(subject)
    setBuyModalOpen(true)
  }

  const confirmBuy = () => {
    setBuyModalOpen(false)
    if (currentSubject) {
      showToast('success', 'Achat confirmé', `${currentSubject.title} ajouté à votre bibliothèque !`)
    }
  }

  const openBuyFromPreview = () => {
    setPreviewModalOpen(false)
    if (currentSubject) {
      openBuyModal(currentSubject)
    }
  }

  // Preview pagination
  const totalPages = 18
  const prevPage = () => setPreviewPage(p => Math.max(1, p - 1))
  const nextPage = () => setPreviewPage(p => Math.min(totalPages, p + 1))

  // Filtered subjects
  const filteredSubjects = SUBJECTS.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <LuxuryCursor />
      
      {/* Toast Container */}
      <div className="toast-container" id="toastContainer">
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
              onClick={() => removeToast(toast.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

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
                <div 
                  className={`pill ${selectedTypes.includes('BAC') ? 'on-solid' : ''}`}
                  onClick={() => toggleType('BAC')}
                >BAC</div>
                <div 
                  className={`pill ${selectedTypes.includes('BEPC') ? 'on-solid' : ''}`}
                  onClick={() => toggleType('BEPC')}
                >BEPC</div>
                <div 
                  className={`pill ${selectedTypes.includes('CEPE') ? 'on-solid' : ''}`}
                  onClick={() => toggleType('CEPE')}
                >CEPE</div>
              </div>
            </div>

            {/* Matière */}
            <div className="filter-section">
              <div className="fsec-title">Matière</div>
              <select 
                className="select-field"
                value={selectedMatieres[0] || ''}
                onChange={(e) => setSelectedMatieres(e.target.value ? [e.target.value] : [])}
              >
                <option value="">Toutes les matières</option>
                <option>Mathématiques</option>
                <option>Physique-Chimie</option>
                <option>SVT</option>
                <option>Français</option>
                <option>Histoire-Géographie</option>
                <option>Philosophie</option>
              </select>
            </div>

            {/* Difficulté */}
            <div className="filter-section">
              <div className="fsec-title">Difficulté</div>
              <div className="diff-grid">
                <div 
                  className={`diff-btn easy ${selectedDifficultes.includes('Facile') ? 'on' : ''}`}
                  onClick={() => toggleDifficulte('Facile')}
                >Facile</div>
                <div 
                  className={`diff-btn med ${selectedDifficultes.includes('Moyen') ? 'on' : ''}`}
                  onClick={() => toggleDifficulte('Moyen')}
                >Moyen</div>
                <div 
                  className={`diff-btn hard ${selectedDifficultes.includes('Difficile') ? 'on' : ''}`}
                  onClick={() => toggleDifficulte('Difficile')}
                >Difficile</div>
              </div>
            </div>

            {/* Année */}
            <div className="filter-section">
              <div className="fsec-title">
                Année — <span style={{ color: 'var(--gold)' }}>{yearRange} – 2024</span>
              </div>
              <div className="range-wrap">
                <input
                  type="range"
                  className="range-input"
                  min="2003"
                  max="2024"
                  value={yearRange}
                  onChange={(e) => setYearRange(Number(e.target.value))}
                />
              </div>
              <div className="range-labels">
                <span>2003</span>
                <span>2024</span>
              </div>
            </div>

            {/* Langue */}
            <div className="filter-section">
              <div className="fsec-title">Langue</div>
              <div className="pill-row">
                <div 
                  className={`pill ${selectedLangues.includes('Français') ? 'on' : ''}`}
                  onClick={() => toggleLangue('Français')}
                >Français</div>
                <div 
                  className={`pill ${selectedLangues.includes('Malgache') ? 'on' : ''}`}
                  onClick={() => toggleLangue('Malgache')}
                >Malgache</div>
              </div>
            </div>

              {/* Note minimale */}
              <div className="filter-section">
                <div className="fsec-title">Note minimale</div>
                <div className="star-row">
                  <label className="star-opt">
                    <input 
                      type="radio" 
                      name="rating" 
                      value="4"
                      checked={minRating === 4}
                      onChange={() => setMinRating(4)}
                    />
                    <div className="star-label">
                      <div className="stars-mini">
                        <span className="s-filled">★</span>
                        <span className="s-filled">★</span>
                        <span className="s-filled">★</span>
                        <span className="s-filled">★</span>
                        <span className="s-empty">☆</span>
                      </div>
                      et plus
                    </div>
                  </label>
                  <label className="star-opt">
                    <input 
                      type="radio" 
                      name="rating" 
                      value="3"
                      checked={minRating === 3}
                      onChange={() => setMinRating(3)}
                    />
                    <div className="star-label">
                      <div className="stars-mini">
                        <span className="s-filled">★</span>
                        <span className="s-filled">★</span>
                        <span className="s-filled">★</span>
                        <span className="s-empty">☆</span>
                        <span className="s-empty">☆</span>
                      </div>
                      et plus
                    </div>
                  </label>
                </div>
              </div>

              {/* Format */}
              <div className="filter-section">
                <div className="fsec-title">Format</div>
                <div className="pill-row">
                  <div 
                    className={`pill ${selectedFormats.includes('PDF') ? 'on' : ''}`}
                    onClick={() => toggleFormat('PDF')}
                  >PDF</div>
                  <div 
                    className={`pill ${selectedFormats.includes('Interactif') ? 'on' : ''}`}
                    onClick={() => toggleFormat('Interactif')}
                  >Interactif</div>
                  <div 
                    className={`pill ${selectedFormats.includes('Gratuit') ? 'on' : ''}`}
                    onClick={() => toggleFormat('Gratuit')}
                  >Gratuit</div>
                </div>
              </div>

              {/* Prix max */}
              <div className="filter-section">
                <div className="fsec-title">
                  Prix max — <span style={{ color: 'var(--gold)' }}>{maxPrice} cr</span>
                </div>
                <div className="range-wrap">
                  <input
                    type="range"
                    className="range-input"
                    min="0"
                    max="200"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
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

          {/* Active Filters */}
          <div className="active-filters" id="activeFilters">
            {activeFilters.map(filter => (
              <div key={filter} className="af-chip">
                {filter}
                <button className="af-remove" onClick={() => removeFilter(filter)}>✕</button>
              </div>
            ))}
          </div>

          {/* Results Bar */}
          <div className="results-bar">
            <div className="results-count">
              <strong id="resultCount">{filteredSubjects.length}</strong> sujets trouvés
            </div>
            <div className="sort-view">
              <select className="sort-select">
                <option>Pertinence</option>
                <option>Plus récents</option>
                <option>Mieux notés</option>
                <option>Prix croissant</option>
                <option>Prix décroissant</option>
              </select>
              <div className="view-toggle">
                <button 
                  className={`vt-btn ${viewMode === 'grid' ? 'on' : ''}`} 
                  onClick={() => setViewMode('grid')}
                  title="Grille"
                >
                  ⊞
                </button>
                <button 
                  className={`vt-btn ${viewMode === 'list' ? 'on' : ''}`} 
                  onClick={() => setViewMode('list')}
                  title="Liste"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className={`papers-grid ${viewMode === 'list' ? 'list-view' : ''}`} id="papersGrid">
            {filteredSubjects.map((subject) => (
              <div 
                key={subject.id} 
                className="pcard"
                data-title={subject.title}
              >
                <div className="pc-thumb">
                  <div className="pc-thumb-lines"></div>
                  <div className="pc-thumb-glyph">{subject.glyph}</div>
                  <div className={`pc-badge ${subject.badge}`}>
                    {subject.badge === 'gold' ? 'Premium' : subject.badge === 'ai' ? '✦ IA' : subject.badge === 'free' ? 'Gratuit' : 'Interactif'}
                  </div>
                  <button 
                    className="pc-fav" 
                    onClick={() => toggleFav(subject.id)}
                  >
                    {wished.has(subject.id) ? '♥' : '♡'}
                  </button>
                </div>
                <div className="pc-body">
                  <div className="pc-meta-row">
                    <span className="pc-exam">{subject.exam}</span>
                    <span className="pc-year">{subject.year}</span>
                  </div>
                  <div className="pc-title">{subject.title}</div>
                  <div className="pc-info">{subject.info}</div>
                  <div className="pc-rating">
                    <div className="pc-stars">
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i} 
                          className="pc-star"
                          style={{ color: i < subject.rating ? 'var(--gold)' : 'var(--text-4)' }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="pc-review-count">({subject.reviews})</span>
                  </div>
                </div>
                <div className="pc-footer">
                  <div className={`pc-price ${subject.price === 'free' ? 'free-price' : ''}`}>
                    {subject.price === 'free' ? 'Gratuit' : (
                      <>
                        {subject.price} <span className="unit">cr</span>
                      </>
                    )}
                  </div>
                  <div className="pc-actions">
                    <button 
                      className="btn-preview"
                      onClick={() => openPreviewModal(subject)}
                    >
                      Aperçu
                    </button>
                    <button 
                      className="btn-buy"
                      onClick={() => openBuyModal(subject)}
                    >
                      {subject.price === 'free' ? 'Obtenir' : 'Acheter'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button className="pg-btn">‹</button>
            <button className="pg-btn on">1</button>
            <button className="pg-btn">2</button>
            <button className="pg-btn">3</button>
            <span className="pg-dots">…</span>
            <button className="pg-btn">48</button>
            <button className="pg-btn">›</button>
          </div>
        </main>

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
            <div className="fsec-title" style={{ color: 'var(--text-3)', fontFamily: 'var(--mono)', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: '.65rem' }}>
              Type d'examen
            </div>
            <div className="pill-row">
              <div className="pill on-solid">BAC</div>
              <div className="pill">BEPC</div>
              <div className="pill">CEPE</div>
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

      {/* Preview Modal */}
      <div 
        className="modal-overlay" 
        id="previewModal"
        style={{ opacity: previewModalOpen ? 1 : 0, pointerEvents: previewModalOpen ? 'all' : 'none' }}
        onClick={() => setPreviewModalOpen(false)}
      >
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <div className="modal-title">{currentSubject?.title || ''}</div>
              <div className="modal-sub">{currentSubject?.exam} · {currentSubject?.year}</div>
            </div>
            <button className="modal-close" onClick={() => setPreviewModalOpen(false)}>✕</button>
          </div>
          <div className="preview-viewport">
            <div className="preview-paper">
              <div className="pp-line h"></div>
              <div className="pp-line"></div>
              <div className="pp-line m"></div>
              <div className="pp-line s"></div>
              <div className="pp-line"></div>
              <div className="pp-line m"></div>
              <div className="pp-line s"></div>
              <div className="pp-line"></div>
              <div className="pp-line m"></div>
            </div>
            <div 
              className="locked-msg" 
              id="lockedMsg" 
              style={{ display: previewPage > 4 ? 'flex' : 'none' }}
            >
              <div className="locked-icon">🔒</div>
              <div className="locked-text">Achetez pour débloquer</div>
            </div>
          </div>
          <div className="preview-nav" style={{ marginBottom: '1.25rem' }}>
            <button className="prev-nav-btn" onClick={prevPage}>‹</button>
            <span className="pg-indicator" id="pgIndicator">Page {previewPage} / {totalPages}</span>
            <button className="prev-nav-btn" onClick={nextPage}>›</button>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--b3)', borderRadius: 'var(--r)', padding: '.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.65rem' }}>
            <div style={{ fontSize: '.78rem', color: 'var(--text-2)' }}>{currentSubject?.info}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '.75rem', color: 'var(--gold)' }}>
              {currentSubject?.price === 'free' ? 'Gratuit' : `${currentSubject?.price} cr`}
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-modal-buy" onClick={openBuyFromPreview}>
              Acheter — {currentSubject?.price === 'free' ? 'Gratuit' : `${currentSubject?.price} cr`}
            </button>
            <button className="btn-modal-ghost" onClick={() => setPreviewModalOpen(false)}>
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      <div 
        className="modal-overlay" 
        id="buyModal"
        style={{ opacity: buyModalOpen ? 1 : 0, pointerEvents: buyModalOpen ? 'all' : 'none' }}
        onClick={() => setBuyModalOpen(false)}
      >
        <div className="modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <div className="modal-title">Confirmer l'achat</div>
              <div className="modal-sub">{currentSubject?.title || ''}</div>
            </div>
            <button className="modal-close" onClick={() => setBuyModalOpen(false)}>✕</button>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--b1)', borderRadius: 'var(--r)', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.65rem' }}>
              <span style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>Prix du sujet</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '.85rem', color: 'var(--gold)' }}>
                {currentSubject?.price === 'free' ? 'Gratuit' : `${currentSubject?.price} cr`}
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
                {currentSubject?.price === 'free' ? '1 200 cr' : `${1200 - (typeof currentSubject?.price === 'number' ? currentSubject.price : 0)} cr`}
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
    </>
  )
}
