'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { useAuth } from '@/lib/hooks/useAuth'
import { getSubjectById } from '@/actions/subjects'
import { getUserCredits, purchaseSubject } from '@/actions/user'
import './detail.css'

// Types
type SubjectState = 'locked' | 'unlocked' | 'pending'

interface Subject {
  id: string
  titre: string
  type: string
  matiere: string
  annee: string
  serie?: string
  difficulte: string
  langue: string
  credits: number
  rating: number
  reviews: number
  pages: number
  description: string
  glyph: string
  hasCorrectionIa: boolean
  hasCorrectionProf: boolean
  authorName: string
  createdAt: string
  coefficient?: number
  bareme?: number
  duree?: string
  nbExercices?: number
  authentifie?: boolean
  ecole?: string
}

// Mock data (à remplacer par Supabase)
const MOCK_SUBJECT: Subject = {
  id: '1',
  titre: 'Mathématiques — BAC Série C Épreuve officielle 2024',
  type: 'BAC Officiel',
  matiere: 'Mathématiques',
  annee: '2024',
  serie: 'Série C',
  difficulte: 'Difficile',
  langue: 'Français',
  credits: 15,
  rating: 4.9,
  reviews: 142,
  pages: 18,
  description: 'Sujet officiel du Baccalauréat Série C session 2024 — épreuve de mathématiques. Ce sujet couvre l\'intégralité du programme de Terminale Série C : équations différentielles, calcul intégral, géométrie dans l\'espace, étude de fonctions et probabilités.',
  glyph: '∫',
  hasCorrectionIa: true,
  hasCorrectionProf: false,
  authorName: 'Rabe Andry',
  createdAt: '2024-03-01',
  coefficient: 7,
  bareme: 20,
  duree: '3 heures',
  nbExercices: 5,
  authentifie: true,
  ecole: 'République de Madagascar · Ministère de l\'Éducation Nationale'
}

export default function SujetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userId } = useAuth()
  
  // États
  const [subject, setSubject] = useState<any | null>(null)
  const [state, setState] = useState<SubjectState>('locked')
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(0)
  const [activeTab, setActiveTab] = useState<'apercu' | 'avis' | 'similaires'>('apercu')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState(0)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: string; type: string; title: string; msg: string }>>([])
  const [countdown, setCountdown] = useState(90)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  
  // Chargement des données
  useEffect(() => {
    async function loadData() {
      if (!params.id) return
      
      setLoading(true)
      try {
        // Charger le sujet et les crédits en parallèle
        const [subjectData, userCredits] = await Promise.all([
          getSubjectById(params.id as string, userId || undefined),
          userId ? getUserCredits(userId) : 0
        ])
        
        if (subjectData) {
          setSubject(subjectData)
          if (subjectData.isUnlocked) {
            setState('unlocked')
          }
        }
        
        setCredits(userCredits)
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [params.id, userId])

  // Timer pour le mode pending
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (state === 'pending' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [state, countdown])

  const showToast = (type: string, title: string, msg: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, type, title, msg }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4500)
  }

  const unlockSubject = async () => {
    if (!subject || !userId) {
      if (!userId) showToast('error', 'Connexion requise', 'Veuillez vous connecter pour débloquer ce sujet.')
      return
    }
    
    // Vérifier les crédits avant d'afficher la modale
    if (credits < subject.credits) {
      showToast('error', 'Crédits insuffisants', `Il vous manque ${subject.credits - credits} crédits pour acheter ce sujet.`)
      return
    }
    
    setShowPurchaseModal(true)
  }

  const confirmPurchase = async () => {
    if (!subject || !userId) return
    
    setIsPurchasing(true)
    setShowPurchaseModal(false)
    try {
      const result = await purchaseSubject(subject.id, userId)
      if (result.success) {
        showToast('success', 'Débloqué !', `Accès permanent accordé — ${subject.credits} crédits débités`)
        // Mettre à jour les crédits depuis la base de données
        const updatedCredits = await getUserCredits(userId)
        setCredits(updatedCredits)
        setState('unlocked')
      } else {
        showToast('error', 'Erreur', result.error || 'Transaction impossible')
      }
    } catch (err) {
      showToast('error', 'Erreur', 'Une erreur est survenue lors de l\'achat')
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleAnswerChange = (id: string, value: string) => {
    const newAnswers = { ...answers, [id]: value }
    setAnswers(newAnswers)
    const answeredCount = Object.values(newAnswers).filter(v => v.trim().length > 0).length
    setProgress(answeredCount)
  }

  const submitAnswers = () => {
    showToast('success', 'Soumis !', 'Correction IA en cours — notification dans ~2 min')
    setTimeout(() => setState('pending'), 600)
  }

  const toggleMode = () => {
    setIsReadOnly(!isReadOnly)
  }

  if (!subject) return null

  return (
    <div className="detail-page-container">
      <LuxuryCursor />
      
      {/* MODALE D'ACHAT */}
      {showPurchaseModal && subject && (
        <div className="modal-overlay" onClick={() => setShowPurchaseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmer l'achat</h3>
              <button className="modal-close" onClick={() => setShowPurchaseModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="purchase-summary">
                <div className="subject-info">
                  <h4>{subject.titre}</h4>
                  <p>{subject.matiere} • {subject.annee} • {subject.type}</p>
                </div>
                <div className="price-info">
                  <div className="price-row">
                    <span>Prix du sujet:</span>
                    <span className="price-amount">{subject.credits} crédits</span>
                  </div>
                  <div className="price-row">
                    <span>Vos crédits:</span>
                    <span className="credits-amount">{credits} crédits</span>
                  </div>
                  <div className="price-row total">
                    <span>Crédits après achat:</span>
                    <span className="credits-remaining">{credits - subject.credits} crédits</span>
                  </div>
                </div>
              </div>
              <div className="purchase-benefits">
                <h5>Ce que vous obtenez:</h5>
                <ul>
                  <li>✅ Accès permanent au sujet complet</li>
                  <li>✅ Correction IA détaillée</li>
                  <li>✅ Téléchargement PDF</li>
                  <li>✅ Suivi de progression</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowPurchaseModal(false)}>Annuler</button>
              <button className="btn-confirm" onClick={confirmPurchase} disabled={isPurchasing}>
                {isPurchasing ? 'Achat en cours...' : `Confirmer l'achat • ${subject.credits} crédits`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOASTS */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: t.type === 'success' ? 'var(--gold)' : t.type === 'error' ? 'var(--ruby)' : '#3A6EA8'
            }}></div>
            <div>
              <div className="toast-title">{t.title}</div>
              <div className="toast-msg">{t.msg}</div>
            </div>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}>✕</button>
          </div>
        ))}
      </div>


      {/* HERO */}
      <div className="hero">
        <div className="hero-inner">
          <div className="nav-crumbs" style={{ marginBottom: '1.5rem', opacity: 0.8 }}>
            <Link href="/catalogue" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--text-3)', textDecoration: 'none' }}>
              <span>←</span>
              <span>Retour au catalogue</span>
            </Link>
            <span className="nav-sep">/</span>
            <span className="nav-crumb-cur">{subject.matiere} {subject.annee}</span>
          </div>
          
          <div className="hero-tags">
            <span className="tag tag-exam">{subject.type}</span>
            <span className="tag tag-official">✓ Authentifié</span>
            <span className="tag tag-ai">✦ Correction IA</span>
            {state === 'locked' && <span className="tag tag-locked">🔒 Non débloqué</span>}
            {state === 'unlocked' && <span className="tag tag-unlocked">🔓 Débloqué</span>}
            {state === 'pending' && <span className="tag tag-pending">⏳ Correction en cours</span>}
          </div>
          <h1 className="hero-title">
            {subject.matiere} {subject.serie ? <span>— <em>{subject.serie}</em></span> : ''}<br />Épreuve officielle {subject.annee}
          </h1>
          <div className="hero-meta">
            <span className="meta-item">🎓 {subject.type} · {subject.serie || 'Tronc commun'}</span>
            <span className="meta-item">📅 {subject.annee} · Session principale</span>
            <span className="meta-item">⏱ Durée : {subject.duree}</span>
            <span className="meta-item">📄 {subject.nbExercices} exercices · {subject.bareme} pts</span>
            <span className="meta-item">
              <span className="stars">★★★★★</span>
              <span className="rating-num" style={{ marginLeft: '.35rem' }}>{subject.rating}</span>
              <span className="rating-count">({subject.reviews} avis)</span>
            </span>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        {/* LEFT */}
        <div>
          <div className="tabs">
            <button className={`tab ${activeTab === 'apercu' ? 'active' : ''}`} onClick={() => setActiveTab('apercu')}>Aperçu</button>
            <button className={`tab ${activeTab === 'avis' ? 'active' : ''}`} onClick={() => setActiveTab('avis')}>Avis ({subject.reviews})</button>
            <button className={`tab ${activeTab === 'similaires' ? 'active' : ''}`} onClick={() => setActiveTab('similaires')}>Sujets similaires</button>
          </div>

          {/* ══ APERÇU PANEL ══ */}
          <div className={`tab-panel ${activeTab === 'apercu' ? 'active' : ''}`}>
            
            {/* ── STATE: LOCKED ── */}
            {state === 'locked' && (
              <div id="state-locked">
                <div className="sec-label">Aperçu du sujet</div>
                <div className="preview-grid">
                  <div className="pg-thumb pg-free">
                    <div className="pg-img"><span className="pg-symbol">∫</span></div>
                    <div className="pg-foot"><span className="pg-lbl">Exercice 1</span><span className="pg-status" style={{ color: '#8ECAAC' }}>👁 Visible</span></div>
                  </div>
                  <div className="pg-thumb pg-free">
                    <div className="pg-img"><span className="pg-symbol">Σ</span></div>
                    <div className="pg-foot"><span className="pg-lbl">Exercice 2</span><span className="pg-status" style={{ color: '#8ECAAC' }}>👁 Visible</span></div>
                  </div>
                  <div className="pg-thumb">
                    <div className="pg-img">
                      <span className="pg-symbol">π</span>
                      <div className="pg-blur-overlay"><span className="pg-blur-icon">🔒</span></div>
                    </div>
                    <div className="pg-foot"><span className="pg-lbl">Exercice 3</span><span className="pg-status">🔒</span></div>
                  </div>
                  <div className="pg-thumb">
                    <div className="pg-img">
                      <span className="pg-symbol">∞</span>
                      <div className="pg-blur-overlay"><span className="pg-blur-icon">🔒</span></div>
                    </div>
                    <div className="pg-foot"><span className="pg-lbl">Exercice 4</span><span className="pg-status">🔒</span></div>
                  </div>
                  <div className="pg-thumb">
                    <div className="pg-img">
                      <span className="pg-symbol">∂</span>
                      <div className="pg-blur-overlay"><span className="pg-blur-icon">🔒</span></div>
                    </div>
                    <div className="pg-foot"><span className="pg-lbl">Exercice 5</span><span className="pg-status">🔒</span></div>
                  </div>
                  <div className="pg-thumb">
                    <div className="pg-img">
                      <span className="pg-symbol">⊗</span>
                      <div className="pg-blur-overlay"><span className="pg-blur-icon">🔒</span></div>
                    </div>
                    <div className="pg-foot"><span className="pg-lbl">Barème</span><span className="pg-status">🔒</span></div>
                  </div>
                </div>

                <div className="excerpt-wrap">
                  <div className="sec-label">Questions accessibles gratuitement</div>
                  <div className="excerpt-content">
                    <div className="excerpt-q">
                      <div className="excerpt-q-num">Exercice 1 · Équations différentielles (6 pts)</div>
                      <div className="excerpt-q-text">1. Résoudre l'équation différentielle y'' − 3y' + 2y = eˣ avec les conditions initiales y(0) = 1 et y'(0) = 0.<br /><br />2. En déduire la solution particulière vérifiant y(0) = 2.</div>
                    </div>
                    <div className="excerpt-q">
                      <div className="excerpt-q-num">Exercice 2 · Intégrales (5 pts)</div>
                      <div className="excerpt-q-text">Calculer les intégrales suivantes :<br />a) ∫₀^π x·sin(x) dx<br />b) ∫₁^e ln(x)/x dx<br /><br />Interpréter géométriquement chaque résultat.</div>
                    </div>
                    <div className="excerpt-q blurred">
                      <div className="excerpt-q-num">Exercice 3 · Géométrie dans l'espace (4 pts)</div>
                      <div className="excerpt-q-text">Dans un repère orthonormé (O, i, j, k), on donne les points A(1,2,3), B(0,−1,2) et C(3,1,0). Déterminer l'équation du plan (ABC) et la distance du point D(2,2,2) à ce plan.</div>
                    </div>
                  </div>
                </div>

                <div className="locked-banner">
                  <div className="lb-icon">🔒</div>
                  <div className="lb-title">Accès complet requis</div>
                  <div className="lb-sub">Débloquez ce sujet pour accéder à l'intégralité des exercices, soumettre vos réponses et obtenir une correction détaillée par IA.</div>
                  <div className="lb-price-row">
                    <span className="lb-price">{subject.credits}</span>
                    <div><span className="lb-price-lbl">crédits</span><div style={{ fontFamily: 'var(--mono)', fontSize: '.58rem', color: 'var(--text-4)' }}>≈ 750 Ar</div></div>
                  </div>
                  <button className="btn-unlock" onClick={unlockSubject}>Débloquer pour {subject.credits} crédits →</button>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.58rem', color: 'var(--text-4)', marginTop: '.85rem' }}>Accès permanent · Correction IA incluse · Téléchargement PDF</div>
                </div>

                <div className="sec-label" style={{ marginTop: '1.75rem' }}>Description du sujet</div>
                <p style={{ fontSize: '.87rem', color: 'var(--text-2)', lineHeight: '1.85', marginBottom: '1rem' }}>{subject.description}</p>
                <div className="sec-label">Thèmes couverts</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '.58rem', textTransform: 'uppercase', letterSpacing: '.08em', padding: '.2rem .6rem', border: '1px solid var(--b1)', borderRadius: '2px', color: 'var(--text-3)' }}>Équations différentielles</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '.58rem', textTransform: 'uppercase', letterSpacing: '.08em', padding: '.2rem .6rem', border: '1px solid var(--b1)', borderRadius: '2px', color: 'var(--text-3)' }}>Intégrales</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '.58rem', textTransform: 'uppercase', letterSpacing: '.08em', padding: '.2rem .6rem', border: '1px solid var(--b1)', borderRadius: '2px', color: 'var(--text-3)' }}>Géométrie 3D</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '.58rem', textTransform: 'uppercase', letterSpacing: '.08em', padding: '.2rem .6rem', border: '1px solid var(--b1)', borderRadius: '2px', color: 'var(--text-3)' }}>Fonctions</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '.58rem', textTransform: 'uppercase', letterSpacing: '.08em', padding: '.2rem .6rem', border: '1px solid var(--b1)', borderRadius: '2px', color: 'var(--text-3)' }}>Probabilités</span>
                </div>
              </div>
            )}

            {/* ── STATE: UNLOCKED ── */}
            {state === 'unlocked' && (
              <div id="state-unlocked">
                <div className="reader-toolbar">
                  <span className="rt-label">Mode lecture</span>
                  <button className={`rt-btn ${!isReadOnly ? 'active' : ''}`} onClick={toggleMode}>{!isReadOnly ? '✎ Mode réponse' : '👁 Mode lecture'}</button>
                  <button className="rt-btn" onClick={() => showToast('info', 'PDF', 'Génération du PDF en cours…')}>⬇ PDF</button>
                  <button className="rt-btn" onClick={() => showToast('info', 'Plein écran', 'Mode plein écran activé')}>⛶ Plein écran</button>
                  <button className="rt-btn" onClick={() => showToast('info', 'Signet', 'Sujet mis en favori')}>♡ Favori</button>
                </div>
                <div className="subject-doc" id="subjectDoc">
                  <div className="doc-header">
                    <div className="doc-school">{subject.ecole}</div>
                    <div className="doc-exam-title">{subject.type} — {subject.serie} · Session {subject.annee}</div>
                    <div style={{ fontFamily: 'var(--display)', fontSize: '1.1rem', color: 'var(--gold)', margin: '.2rem 0' }}>Épreuve de {subject.matiere}</div>
                    <div className="doc-meta-line">
                      <span>Durée : {subject.duree}</span>
                      <span>Coefficient : {subject.coefficient}</span>
                      <span>Barème : {subject.bareme} points</span>
                      <span>Calculatrice autorisée</span>
                    </div>
                  </div>
                  <div className="doc-body">
                    <div className="doc-part">
                      <div className="doc-part-title">Exercice 1 — Équations différentielles <span className="doc-part-pts">6 pts</span></div>
                      <div className="doc-q">
                        <span className="doc-q-num">Q.1</span>
                        <div className="doc-q-content">
                          <div className="doc-q-pts">3 points</div>
                          <div className="doc-q-text">Résoudre l'équation différentielle y'' − 3y' + 2y = eˣ avec les conditions initiales y(0) = 1 et y'(0) = 0.</div>
                          {!isReadOnly && <textarea className="doc-q-answer" placeholder="Votre réponse…" value={answers['a1'] || ''} onChange={(e) => handleAnswerChange('a1', e.target.value)}></textarea>}
                        </div>
                      </div>
                      <div className="doc-q">
                        <span className="doc-q-num">Q.2</span>
                        <div className="doc-q-content">
                          <div className="doc-q-pts">3 points</div>
                          <div className="doc-q-text">En déduire la solution particulière vérifiant y(0) = 2, puis tracer l'allure de la courbe sur [0, 2].</div>
                          {!isReadOnly && <textarea className="doc-q-answer" placeholder="Votre réponse…" value={answers['a2'] || ''} onChange={(e) => handleAnswerChange('a2', e.target.value)}></textarea>}
                        </div>
                      </div>
                    </div>
                    <div className="doc-part">
                      <div className="doc-part-title">Exercice 2 — Calcul intégral <span className="doc-part-pts">5 pts</span></div>
                      <div className="doc-q">
                        <span className="doc-q-num">Q.3</span>
                        <div className="doc-q-content">
                          <div className="doc-q-pts">2 points</div>
                          <div className="doc-q-text">Calculer ∫₀^π x·sin(x) dx par intégration par parties. Interpréter géométriquement.</div>
                          {!isReadOnly && <textarea className="doc-q-answer" placeholder="Votre réponse…" value={answers['a3'] || ''} onChange={(e) => handleAnswerChange('a3', e.target.value)}></textarea>}
                        </div>
                      </div>
                      <div className="doc-q">
                        <span className="doc-q-num">Q.4</span>
                        <div className="doc-q-content">
                          <div className="doc-q-pts">3 points</div>
                          <div className="doc-q-text">Calculer ∫₁^e ln(x)/x dx. En déduire l'aire de la région délimitée par la courbe y = ln(x)/x, l'axe des abscisses et les droites x = 1 et x = e.</div>
                          {!isReadOnly && <textarea className="doc-q-answer" placeholder="Votre réponse…" value={answers['a4'] || ''} onChange={(e) => handleAnswerChange('a4', e.target.value)}></textarea>}
                        </div>
                      </div>
                    </div>
                    <div className="doc-part">
                      <div className="doc-part-title">Exercice 3 — Géométrie dans l'espace <span className="doc-part-pts">4 pts</span></div>
                      <div className="doc-q">
                        <span className="doc-q-num">Q.5</span>
                        <div className="doc-q-content">
                          <div className="doc-q-pts">4 points</div>
                          <div className="doc-q-text">Dans un repère orthonormé (O, i, j, k), soient A(1,2,3), B(2,0,1) et C(0,1,4). Déterminer l'équation du plan (ABC) puis la distance du point D(2,2,2) à ce plan.</div>
                          {!isReadOnly && <textarea className="doc-q-answer" placeholder="Votre réponse…" value={answers['a5'] || ''} onChange={(e) => handleAnswerChange('a5', e.target.value)}></textarea>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="submit-bar">
                  <div className="sb-info">
                    <div className="sb-title">Prêt·e à soumettre ?</div>
                    <div className="sb-sub">{progress} / 5 questions répondues</div>
                  </div>
                  <button className="btn-submit" onClick={submitAnswers}>Soumettre pour correction IA →</button>
                </div>
              </div>
            )}

            {/* ── STATE: PENDING ── */}
            {state === 'pending' && (
              <div id="state-pending">
                <div className="pending-hero">
                  <div className="spinner-wrap">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring spinner-ring2"></div>
                    <div className="spinner-icon">🤖</div>
                  </div>
                  <div className="pending-title">Correction <em>en cours</em>…</div>
                  <div className="pending-sub">L'IA Mah.AI analyse vos réponses. Une notification vous sera envoyée dès que la correction est prête, généralement en moins de 2 minutes.</div>
                  <div className="pending-progress">
                    <div className="pp-label"><span>Analyse en cours</span><span>~65%</span></div>
                    <div className="pp-track"><div className="pp-fill"></div></div>
                  </div>
                  <div className="pending-eta">
                    <span className="eta-dot"></span>
                    Résultat estimé dans <strong style={{ margin: '0 .3rem', color: 'var(--text)' }}>
                      {Math.floor(countdown / 60)} min {countdown % 60} s
                    </strong>
                  </div>
                </div>
                <div className="answers-recap">
                  <div className="ar-head">
                    <div className="sec-label" style={{ marginBottom: 0 }}>Vos réponses soumises</div>
                    <div className="ar-stats">
                      <span className="ar-stat"><strong>{progress}</strong>répondues</span>
                      <span className="ar-stat"><strong>{5 - progress}</strong>vides</span>
                    </div>
                  </div>
                  <div id="arList" style={{ marginTop: '.85rem' }}>
                    {['a1', 'a2', 'a3', 'a4', 'a5'].map((id, i) => (
                      <div key={id} className="ar-item">
                        <span className="ar-num">Q.{String(i + 1).padStart(2, '0')}</span>
                        <span className="ar-text">
                          {answers[id] ? (
                            answers[id].length > 120 ? answers[id].substring(0, 120) + '…' : answers[id]
                          ) : (
                            <span className="ar-empty">Non répondue</span>
                          )}
                        </span>
                        <span className="ar-len">{answers[id] ? answers[id].length + ' car.' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.65rem', color: 'var(--text-3)', marginBottom: '.85rem', textTransform: 'uppercase', letterSpacing: '.1em' }}>Simulation : voir la correction maintenant</div>
                  <button className="btn-unlock" onClick={() => router.push(`/sujet/${params.id}/correction`)} style={{ padding: '.65rem 1.75rem', fontSize: '.85rem' }}>Voir la correction IA →</button>
                </div>
              </div>
            )}
          </div>

          {/* ══ AVIS PANEL ══ */}
          <div className={`tab-panel ${activeTab === 'avis' ? 'active' : ''}`}>
            <div className="rev-sum">
              <div className="rev-big">{subject.rating}</div>
              <div>
                <div style={{ fontSize: '.65rem', color: 'var(--gold)', letterSpacing: '.05em', marginBottom: '.35rem' }}>★★★★★</div>
                <div className="rev-bars">
                  <div className="rb-row"><span className="rb-lbl">5</span><div className="rb-track"><div className="rb-fill" style={{ width: '88%' }}></div></div><span className="rb-pct">88%</span></div>
                  <div className="rb-row"><span className="rb-lbl">4</span><div className="rb-track"><div className="rb-fill" style={{ width: '9%' }}></div></div><span className="rb-pct">9%</span></div>
                  <div className="rb-row"><span className="rb-lbl">3</span><div className="rb-track"><div className="rb-fill" style={{ width: '3%' }}></div></div><span className="rb-pct">3%</span></div>
                  <div className="rb-row"><span className="rb-lbl">2</span><div className="rb-track"><div className="rb-fill" style={{ width: '0%' }}></div></div><span className="rb-pct">0%</span></div>
                  <div className="rb-row"><span className="rb-lbl">1</span><div className="rb-track"><div className="rb-fill" style={{ width: '0%' }}></div></div><span className="rb-pct">0%</span></div>
                </div>
              </div>
            </div>
            <div className="rev-item"><div className="rev-head"><div className="rev-av">H</div><span className="rev-name">Herizo R.</span><span style={{ fontFamily: 'var(--mono)', fontSize: '.58rem', color: 'var(--text-4)' }}>Il y a 2j</span><span className="rev-stars">★★★★★</span></div><div className="rev-text">Exactement le sujet officiel, aucune faute. La correction IA était très précise, elle m'a aidé à comprendre mes erreurs en géométrie vectorielle.</div></div>
            <div className="rev-item"><div className="rev-head"><div className="rev-av">M</div><span className="rev-name">Mirana T.</span><span style={{ fontFamily: 'var(--mono)', fontSize: '.58rem', color: 'var(--text-4)' }}>Il y a 5j</span><span className="rev-stars">★★★★★</span></div><div className="rev-text">Super sujet bien structuré. Idéal pour préparer l'examen. Le contributeur a aussi posté le sujet de rattrapage, je recommande ses publications.</div></div>
            <div className="rev-item"><div className="rev-head"><div className="rev-av">J</div><span className="rev-name">Jean-Claude R.</span><span style={{ fontFamily: 'var(--mono)', fontSize: '.58rem', color: 'var(--text-4)' }}>Il y a 1 sem.</span><span className="rev-stars">★★★★☆</span></div><div className="rev-text">Très bon sujet. Petite déduction car la mise en page est légèrement différente de l'original. Mais le contenu est complet et la correction IA excellente.</div></div>
          </div>

          {/* ══ SIMILAIRES PANEL ══ */}
          <div className={`tab-panel ${activeTab === 'similaires' ? 'active' : ''}`}>
            <div style={{ display: 'grid', gap: '.75rem' }}>
              <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '.85rem', cursor: 'pointer', transition: 'all .2s' }} onClick={() => router.push('/sujet/1')}>
                <div style={{ width: '44px', height: '52px', background: 'var(--surface)', border: '1px solid var(--b2)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: '1.2rem', color: 'var(--gold-lo)', flexShrink: 0 }}>Σ</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: '.85rem', fontWeight: 500, color: 'var(--text)', marginBottom: '.2rem' }}>BAC Maths Série C — 2023</div><div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--text-3)' }}>BAC · Série C · 2023</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontFamily: 'var(--display)', fontSize: '1.1rem', color: 'var(--gold)' }}>12 cr</div><div style={{ fontSize: '.6rem', color: 'var(--gold)', marginTop: '.1rem' }}>★★★★☆</div></div>
              </div>
              <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '.85rem', cursor: 'pointer', transition: 'all .2s' }} onClick={() => router.push('/sujet/1')}>
                <div style={{ width: '44px', height: '52px', background: 'var(--surface)', border: '1px solid var(--b2)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: '1.2rem', color: 'var(--gold-lo)', flexShrink: 0 }}>π</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: '.85rem', fontWeight: 500, color: 'var(--text)', marginBottom: '.2rem' }}>Rattrapage BAC Maths C — 2024</div><div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--text-3)' }}>Rattrapage · Série C · 2024</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontFamily: 'var(--display)', fontSize: '1.1rem', color: '#8ECAAC' }}>Gratuit</div><div style={{ fontSize: '.6rem', color: 'var(--gold)', marginTop: '.1rem' }}>★★★★★</div></div>
              </div>
              <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '.85rem', cursor: 'pointer', transition: 'all .2s' }} onClick={() => router.push('/sujet/1')}>
                <div style={{ width: '44px', height: '52px', background: 'var(--surface)', border: '1px solid var(--b2)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: '1.2rem', color: 'var(--gold-lo)', flexShrink: 0 }}>∞</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: '.85rem', fontWeight: 500, color: 'var(--text)', marginBottom: '.2rem' }}>DS Analyse — Lycée Andohalo 2024</div><div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--text-3)' }}>DS · Terminale C · 2024</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontFamily: 'var(--display)', fontSize: '1.1rem', color: 'var(--gold)' }}>8 cr</div><div style={{ fontSize: '.6rem', color: 'var(--gold)', marginTop: '.1rem' }}>★★★★★</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside id="sidebar">
          {/* Price card — changes per state */}
          {state === 'locked' && (
            <div id="pc-locked">
              <div className="price-card">
                <div className="pc-label">Prix d'accès</div>
                <div className="pc-price">{subject.credits}</div>
                <div className="pc-unit">crédits · accès permanent</div>
                <div className="pc-balance">Votre solde : <span className="pc-balance-val">{credits} cr</span></div>
                <button className="btn-buy" onClick={unlockSubject}>🔓 Débloquer ce sujet</button>
                <div className="pc-note">Accès permanent après achat · Correction IA incluse · PDF téléchargeable</div>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <button 
                  style={{ background: 'none', border: 'none', fontFamily: 'var(--mono)', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-3)', cursor: 'pointer', transition: 'color .2s', display: 'flex', alignItems: 'center', gap: '.45rem', margin: '0 auto' }}
                  onClick={() => router.push('/credits')}
                >
                  + Recharger mes crédits →
                </button>
              </div>
            </div>
          )}

          {state === 'unlocked' && (
            <div id="pc-unlocked">
              <div className="price-card unlocked-card">
                <div className="unlocked-icon">🔓</div>
                <div className="unlocked-label">Accès débloqué</div>
                <div className="unlocked-sub">Vous avez accès à ce sujet. Répondez aux questions puis soumettez pour une correction IA détaillée.</div>
                <button className="btn-buy" style={{ background: 'linear-gradient(135deg,var(--sage),#6AAB8A)' }} onClick={submitAnswers}>Soumettre mes réponses →</button>
              </div>
            </div>
          )}

          {state === 'pending' && (
            <div id="pc-pending">
              <div className="price-card pending-card">
                <div style={{ fontSize: '1.8rem', marginBottom: '.5rem' }}>⏳</div>
                <div className="unlocked-label">Correction en cours</div>
                <div className="unlocked-sub">L'IA analyse vos réponses. Résultat disponible dans environ 2 min.</div>
                <button className="btn-buy" style={{ background: 'linear-gradient(135deg,var(--amber),#E8A060)' }} onClick={() => router.push(`/sujet/${params.id}/correction`)}>Voir la correction →</button>
              </div>
            </div>
          )}

          {/* Contributor */}
          <div className="panel">
            <div className="p-head"><span className="p-label"><span className="p-dot"></span>Contributeur</span></div>
            <div className="p-body">
              <div className="contrib-row">
                <div className="contrib-av">
                  {subject.author?.prenom?.charAt(0) || subject.authorName?.charAt(0) || 'A'}
                </div>
                <div className="contrib-info">
                  <div className="contrib-name">
                    {subject.author ? `${subject.author.prenom} ${subject.author.nom || ''}` : (subject.authorName || 'Contributeur Mah.AI')}
                  </div>
                  <div className="contrib-meta">84 sujets · 4.8★ · Antananarivo</div>
                </div>
                <span className="contrib-badge">Elite</span>
              </div>
              <button 
                style={{ width: '100%', marginTop: '.75rem', padding: '.5rem', background: 'transparent', border: '1px solid var(--b1)', borderRadius: 'var(--r)', fontFamily: 'var(--mono)', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-3)', cursor: 'pointer', transition: 'all .2s' }}
                onClick={() => router.push('/profil/1')}
              >
                Voir son profil →
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="panel">
            <div className="p-head"><span className="p-label"><span className="p-dot"></span>Informations</span></div>
            <div className="p-body">
              <div className="info-row"><span className="ir-key">Matière</span><span className="ir-val">{subject.matiere}</span></div>
              <div className="info-row"><span className="ir-key">Niveau</span><span className="ir-val">Terminale {subject.serie}</span></div>
              <div className="info-row"><span className="ir-key">Type</span><span className="ir-val">{subject.type}</span></div>
              <div className="info-row"><span className="ir-key">Année</span><span className="ir-val gold">{subject.annee}</span></div>
              <div className="info-row"><span className="ir-key">Durée</span><span className="ir-val">{subject.duree}</span></div>
              <div className="info-row"><span className="ir-key">Exercices</span><span className="ir-val">{subject.nbExercices} exercices</span></div>
              <div className="info-row"><span className="ir-key">Barème</span><span className="ir-val">{subject.bareme} points</span></div>
              <div className="info-row"><span className="ir-key">Téléchargements</span><span className="ir-val">1 284</span></div>
              <div className="info-row"><span className="ir-key">Authentifié</span><span className="ir-val gold">✓ Officiel</span></div>
            </div>
          </div>

        </aside>
      </div>

      {/* STATE DEMO SWITCHER - Uncomment for development/testing only */}
      {/* 
      <div className="state-demo">
        <button className={`sdemo-btn ${state === 'locked' ? 'on' : ''}`} onClick={() => setState('locked')}>🔒 Verrouillé</button>
        <button className={`sdemo-btn ${state === 'unlocked' ? 'on' : ''}`} onClick={() => setState('unlocked')}>🔓 Débloqué</button>
        <button className={`sdemo-btn ${state === 'pending' ? 'on' : ''}`} onClick={() => setState('pending')}>⏳ En attente</button>
      </div>
      */}
    </div>
  )
}
