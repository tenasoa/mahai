'use client'

import { Suspense } from 'react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { useCatalogue } from '@/lib/hooks/useCatalogue'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthModal } from '@/components/ui/AuthModal'
import { CataloguePageSkeleton } from '@/components/ui/PageSkeletons'
import type { Difficulte, Badge } from '@/types/catalogue'
import { BADGE_LABELS, DIFFICULTE_LABELS, MATIERE_GLYPHS } from '@/types/catalogue'
import './catalogue.css'

import { purchaseCurrentUserSubject } from '@/actions/user'

function CatalogueContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userId, appUser } = useAuth()
  
  // Détection mode guest (non connecté)
  const isGuest = !userId
  const guestMode = searchParams.get('guest') === 'true' || isGuest

  // États locaux pour pagination
  const [pageSize, setPageSize] = useState(9)

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
    toggleWishlist,
    isWished,
  } = useCatalogue({
    userId,
    pageSize: pageSize,
    initialFilters: {
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
  })

  const userCredits = appUser?.credits ?? 0

  // États locaux UI
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [currentSubject, setCurrentSubject] = useState<any | null>(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const toastIdRef = useRef(0)
  const lastToastTime = useRef<number>(0)

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
  const openPreviewModal = (subject: any) => {
    if (isGuest) {
      setAuthModalOpen(true)
      return
    }
    setCurrentSubject(subject)
    setPreviewPage(1)
    setPreviewModalOpen(true)
  }

  const openBuyModal = (subject: any) => {
    if (isGuest) {
      setAuthModalOpen(true)
      return
    }
    setCurrentSubject(subject)
    setBuyModalOpen(true)
  }

  const handleSubjectClick = (subjectId: string) => {
    if (isGuest) {
      setAuthModalOpen(true)
      return
    }
    router.push(`/sujet/${subjectId}`)
  }

  const confirmBuy = async () => {
    if (!currentSubject || !userId) return
    
    setIsPurchasing(true)
    try {
      const result = await purchaseCurrentUserSubject(currentSubject.id)
      
      if (result.success) {
        showToast('success', 'Achat réussi', `${currentSubject.titre} est maintenant débloqué !`)
        setBuyModalOpen(false)
        router.push(`/sujet/${currentSubject.id}`)
      } else {
        showToast('error', 'Erreur', result.error || 'Impossible de finaliser l\'achat')
      }
    } catch (err) {
      showToast('error', 'Erreur', 'Une erreur inattendue est survenue')
    } finally {
      setIsPurchasing(false)
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

  // Mettre à jour pageSize dans useCatalogue via refresh si nécessaire ou recréer l'hook
  // Ici on simplifie en rechargeant si pageSize change
  useEffect(() => {
    refresh()
  }, [pageSize])

  return (
    <>
      <LuxuryCursor />
      <ToastContainer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Authentification requise"
        message="Connectez-vous ou créez un compte pour accéder à cette fonctionnalité"
      />

      {/* Main Content - No sidebar for logged in users as requested */}
      <main className={`main-area ${guestMode ? 'guest-mode' : 'full-width'}`} style={{ paddingLeft: guestMode ? undefined : '2rem' }}>
        <div className={`main-content-wrapper ${guestMode ? 'guest-mode' : 'full-width'}`} style={{ margin: '0 auto' }}>
          
          {/* Search Bar */}
          <div className="main-search-wrap" style={{ marginBottom: '2rem' }}>
            <div className="nav-search" style={{ maxWidth: '800px', margin: '0' }}>
              <span className="nav-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Chercher un sujet, matière, année, type (BAC, BEPC)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="nav-search-input"
              />
            </div>
          </div>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.85rem', flexWrap: 'wrap', gap: '.65rem' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--display)', fontSize: '1.6rem', fontWeight: 400, letterSpacing: '-.02em', color: 'var(--text)', lineHeight: 1 }}>
                Catalogue <em style={{ fontStyle: 'italic', color: 'var(--text-3)', fontSize: '.7em' }}>des sujets</em>
              </h1>
            </div>
          </div>

          {/* Guest Banner - Simplified (Removed register button as requested) */}
          {guestMode && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--b1)',
              borderRadius: 'var(--r)',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '1.5rem' }}>👋</span>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontFamily: 'var(--body)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.25rem' }}>
                  Vous naviguez en mode visiteur
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
                  Connectez-vous pour acheter des sujets et accéder à toutes les fonctionnalités.
                </div>
              </div>
              <Link
                href="/auth/login"
                style={{
                  fontFamily: 'var(--body)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--r)',
                  background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))',
                  color: 'var(--void)',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                Se connecter
              </Link>
            </div>
          )}

          {/* Results Bar */}
          <div className="results-bar">
            <div className="results-count">
              <strong>{loading ? '...' : pagination.totalItems}</strong> sujets trouvés
            </div>
            <div className="sort-view" style={{ gap: '1rem' }}>
              {/* Items per page selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Afficher :</span>
                <select 
                  className="sort-select" 
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  style={{ width: '70px' }}
                >
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>

              <select className="sort-select" onChange={(e) => setFilters({ sortBy: e.target.value as any })}>
                <option value="createdAt">Plus récents</option>
                <option value="rating">Mieux notés</option>
                <option value="reviewsCount">Plus populaires</option>
                <option value="credits">Prix croissant</option>
              </select>
              
              <div className="view-toggle">
                <button className={`vt-btn ${viewMode === 'grid' ? 'on' : ''}`} onClick={() => setViewMode('grid')}>⊞</button>
                <button className={`vt-btn ${viewMode === 'list' ? 'on' : ''}`} onClick={() => setViewMode('list')}>☰</button>
              </div>
            </div>
          </div>

          {/* Loading / Error / Empty states same as before but adjusting grid layout */}
          {loading && (
            <div className={`papers-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
              {Array.from({ length: pageSize }).map((_, i) => (
                <div key={i} className="pcard skeleton-card">
                  <div className="pc-thumb skeleton"></div>
                  <div className="pc-body"><div className="skeleton" style={{ height: '16px', marginBottom: '8px' }}></div><div className="skeleton" style={{ height: '14px', width: '70%' }}></div></div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div className="empty-icon" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>⚠️</div>
              <div className="empty-title" style={{ fontFamily: 'var(--display)', fontSize: '1.8rem', color: 'var(--text)' }}>Erreur de chargement</div>
              <button className="btn-consult" onClick={refresh}>Réessayer</button>
            </div>
          )}

          {!loading && !error && subjects.length === 0 && (
            <div style={{ padding: '4rem 0', textAlign: 'center' }}>
               <h2 className="empty-title">Aucun sujet trouvé</h2>
               <p className="empty-sub">Essayez d'élargir votre recherche (ex: "BAC Maths", "Physique 2023")</p>
               <button className="btn-consult" onClick={() => { setSearch(''); clearFilters(); }} style={{ marginTop: '1.5rem' }}>Voir tout le catalogue</button>
            </div>
          )}

          {/* Cards Grid */}
          {!loading && !error && subjects.length > 0 && (
            <div className={`papers-grid ${viewMode === 'list' ? 'list-view' : ''}`} style={{ 
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr' 
            }}>
              {subjects.map((subject: any) => (
                <div key={subject.id} className="pcard">
                  <div
                    onClick={(e) => { e.preventDefault(); handleSubjectClick(subject.id); }}
                    className="pc-thumb"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSubjectClick(subject.id); } }}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'none', width: '100%', textAlign: 'left' }}
                  >
                    <div className="pc-thumb-lines"></div>
                    <div className="pc-thumb-glyph">{subject.glyph || MATIERE_GLYPHS[subject.matiere as keyof typeof MATIERE_GLYPHS] || '∑'}</div>
                    <div className={`pc-badge ${subject.badge.toLowerCase()}`}>{BADGE_LABELS[subject.badge as Badge] || subject.badge}</div>
                    <button
                      className={`pc-fav ${isWished(subject.id) ? 'on' : ''}`}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleFav(subject.id); }}
                      title={isWished(subject.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      style={{ pointerEvents: 'auto' }}
                    >
                      {isWished(subject.id) ? '🔖' : '📑'}
                    </button>
                  </div>
                  <div className="pc-body">
                    <div className="pc-meta-row">
                      <span className="pc-exam">{subject.type} · {subject.matiere}</span>
                      <span className="pc-year">{subject.annee}</span>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); handleSubjectClick(subject.id); }}
                      className="pc-title"
                      style={{ textDecoration: 'none', color: 'inherit', background: 'none', border: 'none', padding: 0, cursor: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit', fontSize: 'inherit' }}
                    >
                      {subject.titre}
                    </button>
                    <div className="pc-info">{subject.pages} pages · {DIFFICULTE_LABELS[subject.difficulte as Difficulte] || subject.difficulte}</div>
                    <div className="pc-rating">
                      <div className="pc-stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="pc-star" style={{ color: i < Math.floor(subject.rating) ? 'var(--gold)' : 'var(--text-4)' }}>★</span>
                        ))}
                      </div>
                      <span className="pc-review-count">({subject.reviewsCount})</span>
                    </div>
                  </div>
                  <div className="pc-footer">
                    <div className={`pc-price ${subject.credits === 0 || subject.isUnlocked ? 'free-price' : ''}`}>
                      {subject.isUnlocked ? <span style={{ color: 'var(--sage)', fontSize: '1.2rem' }}>🔓</span> : (subject.credits === 0 ? 'Gratuit' : <>{subject.credits} <span className="unit">cr</span></>)}
                    </div>
                    <div className="pc-actions">
                      {!subject.isUnlocked && <button className="btn-preview" onClick={(e) => { e.stopPropagation(); openPreviewModal(subject); }}>Aperçu</button>}
                      <button
                        className={subject.isUnlocked ? "btn-consult" : "btn-buy"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (subject.isUnlocked) { router.push(`/sujet/${subject.id}`); } else { openBuyModal(subject); }
                        }}
                      >
                        {subject.isUnlocked ? 'Voir' : (subject.credits === 0 ? 'Obtenir' : 'Acheter')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="pagination" style={{ marginTop: '3rem' }}>
              <button className="pg-btn" onClick={() => setPage(currentPage - 1)} disabled={!pagination.hasPrevPage}>‹</button>
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button key={i} className={`pg-btn ${currentPage === i + 1 ? 'on' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button className="pg-btn" onClick={() => setPage(currentPage + 1)} disabled={!pagination.hasNextPage}>›</button>
            </div>
          )}
        </div>
      </main>

      {/* Modals same as before */}
      {previewModalOpen && currentSubject && (
        <div className="modal-overlay open" onClick={() => setPreviewModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div><div className="modal-title">{currentSubject.titre}</div><div className="modal-sub">{currentSubject.type} · {currentSubject.matiere} · {currentSubject.annee}</div></div>
              <button className="modal-close" onClick={() => setPreviewModalOpen(false)}>✕</button>
            </div>
            <div className="preview-viewport">
              <div className="preview-paper"><div className="pp-line h"></div>{[...Array(7)].map((_, i) => (<div key={i} className={`pp-line ${i % 2 === 0 ? 'm' : 's'}`}></div>))}</div>
              <div className="locked-msg" style={{ display: previewPage > 4 ? 'flex' : 'none' }}><div className="locked-icon">🔒</div><div className="locked-text">Achetez pour débloquer</div></div>
            </div>
            <div className="preview-nav" style={{ marginBottom: '1.25rem' }}>
              <button className="prev-nav-btn" onClick={prevPage}>‹</button><span className="pg-indicator">Page {previewPage} / {totalPages}</span><button className="prev-nav-btn" onClick={nextPage}>›</button>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-buy" onClick={() => { setPreviewModalOpen(false); openBuyModal(currentSubject); }}>Acheter — {currentSubject.credits === 0 ? 'Gratuit' : `${currentSubject.credits} cr`}</button>
              <button className="btn-modal-ghost" onClick={() => setPreviewModalOpen(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {buyModalOpen && currentSubject && (
        <div className="modal-overlay open" onClick={() => setBuyModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div><div className="modal-title">Confirmer l'achat</div><div className="modal-sub">{currentSubject.titre}</div></div>
              <button className="modal-close" onClick={() => setBuyModalOpen(false)}>✕</button>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--b1)', borderRadius: 'var(--r)', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.65rem' }}><span style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>Prix</span><span style={{ color: 'var(--gold)' }}>{currentSubject.credits === 0 ? 'Gratuit' : `${currentSubject.credits} cr`}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.65rem' }}><span style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>Votre solde</span><span>{userCredits} cr</span></div>
              <div style={{ height: '1px', background: 'var(--b1)', margin: '.75rem 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '.85rem', fontWeight: 500 }}>Solde après</span><span style={{ color: userCredits - currentSubject.credits >= 0 ? 'var(--gold)' : 'var(--ruby)' }}>{userCredits - currentSubject.credits} cr</span></div>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-buy" onClick={confirmBuy} disabled={userCredits < currentSubject.credits}>{userCredits < currentSubject.credits ? 'Crédits insuffisants' : 'Confirmer l\'achat'}</button>
              <button className="btn-modal-ghost" onClick={() => setBuyModalOpen(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{ id: number; type: string; title: string; msg: string }>>([])
  useEffect(() => {
    const handleToast = (e: any) => setToasts(prev => [...prev, e.detail])
    const handleCloseToast = (e: any) => setToasts(prev => prev.filter(t => t.id !== e.detail.id))
    window.addEventListener('toast' as any, handleToast)
    window.addEventListener('toast-close' as any, handleCloseToast)
    return () => { window.removeEventListener('toast' as any, handleToast); window.removeEventListener('toast-close' as any, handleCloseToast); }
  }, [])
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <div className="toast-icon">{toast.type === 'success' ? '✦' : 'ℹ'}</div>
          <div><div className="toast-title">{toast.title}</div><div className="toast-msg">{toast.msg}</div></div>
          <button className="toast-close" onClick={() => window.dispatchEvent(new CustomEvent('toast-close', { detail: { id: toast.id } }))}>✕</button>
        </div>
      ))}
    </div>
  )
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<CataloguePageSkeleton />}>
      <CatalogueContent />
    </Suspense>
  )
}
