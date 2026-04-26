'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  BookOpen,
  Download,
  GraduationCap,
  PencilLine,
  Sparkles,
  Timer,
  Users,
  FileText,
  Clock,
  Target,
  BrainCircuit,
} from 'lucide-react'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthModal } from '@/components/ui/AuthModal'
import { getSubjectById } from '@/lib/supabase/subjects'
import { getCurrentUserCredits, purchaseCurrentUserSubject } from '@/actions/user'
import { convertSubjectToExamAction } from '@/actions/examen'
import { SujetDetailSkeleton } from '@/components/ui/PageSkeletons'
import { EmptyState } from '@/components/ui/EmptyState'
import { SubjectRenderer } from '@/components/sujet/SubjectRenderer'
import { AICorrectionView } from '@/components/sujet/AICorrectionView'
import { extractQuestions, type ExtractedQuestion } from '@/lib/ai/extract-questions'
import {
  submitExerciseForCorrection,
  requestDirectAICorrection,
  getLatestAICorrection,
  getAIPrices,
} from '@/actions/ai-correction'
import type { AICorrectionResult } from '@/lib/ai/schemas'
import './detail.css'

type AccessState = 'locked' | 'unlocked'
type DisplayMode = 'lecture' | 'exercice' | 'solo' | 'groupe' | 'correction'

interface SubjectPayload {
  id: string
  titre: string
  type: string
  matiere: string
  annee: string
  serie?: string | null
  pages?: number | null
  credits: number
  difficulte?: string | null
  description?: string | null
  rating?: number | null
  reviews?: number | null
  isUnlocked?: boolean
  hasCorrectionIa?: boolean | null
  authorName?: string | null
  bareme?: number | null
  duree?: string | null
  nbExercices?: number | null
  content?: any
}

interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

// Le vrai contenu vient maintenant de subject.content (TipTap JSON) :
// `extractQuestions(subject.content)` renvoie une question par node `question`
// avec un identifiant stable utilisé comme clé du formulaire et envoyé à l'IA.

export default function SujetDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { userId } = useAuth()

  const [subject, setSubject] = useState<SubjectPayload | null>(null)
  const [accessState, setAccessState] = useState<AccessState>('locked')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('lecture')
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(0)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isConvertingExam, setIsConvertingExam] = useState(false)
  const [isSubmittingExercise, setIsSubmittingExercise] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({})
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [aiCorrection, setAiCorrection] = useState<{
    result: AICorrectionResult
    mode: 'SUBMISSION' | 'DIRECT'
    createdAt: string
  } | null>(null)
  const [isRequestingDirect, setIsRequestingDirect] = useState(false)
  const [showDirectConfirm, setShowDirectConfirm] = useState(false)
  const [aiPrices, setAiPrices] = useState<{ priceSubmission: number; priceDirect: number }>({
    priceSubmission: 3,
    priceDirect: 8,
  })

  const isGuest = !userId

  const pushToast = (type: ToastMessage['type'], message: string) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4200)
  }

  useEffect(() => {
    async function loadSubject() {
      if (!params?.id) return

      setLoading(true)
      try {
        const [subjectData, userCredits, prices, latestCorr] = await Promise.all([
          getSubjectById(params.id),
          userId ? getCurrentUserCredits() : Promise.resolve(0),
          getAIPrices().catch(() => ({ priceSubmission: 3, priceDirect: 8 })),
          userId ? getLatestAICorrection(params.id).catch(() => null) : Promise.resolve(null),
        ])

        if (subjectData) {
          setSubject(subjectData as unknown as SubjectPayload)
          setAccessState(subjectData.isUnlocked ? 'unlocked' : 'locked')
        }

        setCredits(userCredits)
        setAiPrices(prices)

        if (latestCorr && 'success' in latestCorr && latestCorr.success && latestCorr.data) {
          setAiCorrection({
            result: latestCorr.data.result,
            mode: latestCorr.data.mode,
            createdAt: latestCorr.data.createdAt,
          })
        }
      } catch (error) {
        console.error('load subject error', error)
      } finally {
        setLoading(false)
      }
    }

    void loadSubject()
  }, [params?.id, userId])

  const exerciseQuestions: ExtractedQuestion[] = useMemo(
    () => (subject?.content ? extractQuestions(subject.content) : []),
    [subject?.content],
  )

  const answeredExerciseCount = useMemo(
    () =>
      Object.values(exerciseAnswers).filter((value) => {
        if (!value) return false
        return value.split(',').filter(Boolean).length > 0
      }).length,
    [exerciseAnswers],
  )

  const requestUnlock = () => {
    if (isGuest) {
      setShowAuthModal(true)
      return
    }

    if (!subject) return

    if (credits < subject.credits) {
      pushToast('error', `Crédits insuffisants. Il vous manque ${subject.credits - credits} crédits.`)
      return
    }

    setShowPurchaseModal(true)
  }

  const confirmPurchase = async () => {
    if (!subject || !userId) return

    setIsPurchasing(true)
    try {
      const result = await purchaseCurrentUserSubject(subject.id)
      if (!result.success) {
        pushToast('error', result.error || 'Impossible de finaliser l’achat.')
        return
      }

      setAccessState('unlocked')
      setShowPurchaseModal(false)
      const remaining = result.remainingCredits ?? (await getCurrentUserCredits())
      setCredits(remaining)
      pushToast('success', 'Sujet débloqué avec succès. Vous avez maintenant accès complet.')
    } catch (error) {
      console.error('confirm purchase error', error)
      pushToast('error', 'Une erreur est survenue pendant l’achat.')
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleExerciseValue = (key: string, value: string) => {
    setExerciseAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const handleCheckboxValue = (key: string, option: string) => {
    const current = exerciseAnswers[key]?.split(',').filter(Boolean) || []
    const next = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option]
    setExerciseAnswers((prev) => ({ ...prev, [key]: next.join(',') }))
  }

  const submitExerciseForAI = async () => {
    if (!subject) return
    if (accessState === 'locked') {
      requestUnlock()
      return
    }
    if (exerciseQuestions.length === 0) {
      pushToast('error', 'Aucune question détectée dans ce sujet.')
      return
    }

    setIsSubmittingExercise(true)
    try {
      // Map: clé question (stable) → libellé + réponse — pour que l'IA voit
      // l'énoncé et la réponse côte à côte.
      const answersForAI: Record<string, string> = {}
      for (const q of exerciseQuestions) {
        const answer = exerciseAnswers[q.key]?.trim()
        if (answer) answersForAI[q.label] = answer
      }
      if (Object.keys(answersForAI).length === 0) {
        pushToast('error', 'Répondez à au moins une question avant de soumettre.')
        return
      }

      const res = await submitExerciseForCorrection(subject.id, answersForAI)
      if (!res.success) {
        pushToast('error', res.error)
        return
      }

      setAiCorrection({
        result: res.data.result,
        mode: 'SUBMISSION',
        createdAt: new Date().toISOString(),
      })
      setCredits(res.data.creditsRemaining)
      setDisplayMode('correction')
      pushToast('success', `Correction IA prête. ${res.data.creditsCost} crédits débités.`)
    } catch (err) {
      console.error('submit AI correction error:', err)
      pushToast('error', "L'IA n'a pas pu répondre. Réessayez plus tard.")
    } finally {
      setIsSubmittingExercise(false)
    }
  }

  const requestDirectCorrection = async () => {
    if (!subject) return
    if (accessState === 'locked') {
      requestUnlock()
      return
    }
    setIsRequestingDirect(true)
    try {
      const res = await requestDirectAICorrection(subject.id)
      if (!res.success) {
        pushToast('error', res.error)
        return
      }
      setAiCorrection({
        result: res.data.result,
        mode: 'DIRECT',
        createdAt: new Date().toISOString(),
      })
      setCredits(res.data.creditsRemaining)
      setDisplayMode('correction')
      setShowDirectConfirm(false)
      pushToast('success', `Correction IA modèle prête. ${res.data.creditsCost} crédits débités.`)
    } catch (err) {
      console.error('direct AI correction error:', err)
      pushToast('error', "L'IA n'a pas pu produire la correction.")
    } finally {
      setIsRequestingDirect(false)
    }
  }

  const startSoloExam = async () => {
    if (!subject) return

    if (accessState === 'locked') {
      requestUnlock()
      return
    }

    if (!userId) {
      setShowAuthModal(true)
      return
    }

    setIsConvertingExam(true)
    try {
      const result = await convertSubjectToExamAction(subject.id, userId)
      if (!result.success || !result.examId) {
        pushToast('error', result.error || 'Impossible de préparer le mode examen.')
        return
      }
      router.push(`/examens/${result.examId}`)
    } catch (error) {
      console.error('start solo exam error', error)
      pushToast('error', 'Erreur de conversion vers le mode examen.')
    } finally {
      setIsConvertingExam(false)
    }
  }

  const handleDownloadPdf = () => {
    if (accessState === 'locked') {
      requestUnlock()
      return
    }

    // Le téléchargement tracé (filigrane unique) vit sur /consult.
    router.push(`/sujet/${subject?.id}/consult`)
  }

  if (loading) {
    return <SujetDetailSkeleton />
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-6">
        <EmptyState
          title="Sujet introuvable"
          description="Ce sujet n’est pas accessible pour le moment."
          actionLabel="Retour au catalogue"
          actionHref="/catalogue"
        />
      </div>
    )
  }

  return (
    <div className="subject-detail-page">
      <LuxuryCursor />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Authentification requise"
        message="Connectez-vous pour débloquer ce sujet et accéder aux modes avancés."
      />

      {showDirectConfirm && (
        <div className="sd-overlay" onClick={() => !isRequestingDirect && setShowDirectConfirm(false)}>
          <div className="sd-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Demander la correction IA directe</h3>
            <p className="sd-modal-subtitle">{subject.titre}</p>

            <div className="sd-modal-summary">
              <div>
                <span>Coût</span>
                <strong>{aiPrices.priceDirect} crédits</strong>
              </div>
              <div>
                <span>Votre solde actuel</span>
                <strong>{credits} crédits</strong>
              </div>
              <div className="total">
                <span>Solde après débit</span>
                <strong>{credits - aiPrices.priceDirect} crédits</strong>
              </div>
            </div>

            <p className="sd-modal-note">
              L'IA va générer le corrigé complet (toutes les questions résolues, méthodologie incluse).
              Aucun crédit n'est débité si la génération échoue.
            </p>

            <div className="sd-modal-actions">
              <button
                className="sd-btn-secondary"
                onClick={() => setShowDirectConfirm(false)}
                disabled={isRequestingDirect}
              >
                Annuler
              </button>
              <button
                className="sd-btn-primary"
                onClick={requestDirectCorrection}
                disabled={isRequestingDirect || credits < aiPrices.priceDirect}
              >
                {isRequestingDirect
                  ? 'Génération…'
                  : credits < aiPrices.priceDirect
                  ? 'Crédits insuffisants'
                  : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPurchaseModal && (
        <div className="sd-overlay" onClick={() => setShowPurchaseModal(false)}>
          <div className="sd-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Confirmer l'achat</h3>
            <p className="sd-modal-subtitle">{subject.titre}</p>

            <div className="sd-modal-summary">
              <div>
                <span>Prix du sujet</span>
                <strong>{subject.credits} crédits</strong>
              </div>
              <div>
                <span>Votre solde actuel</span>
                <strong>{credits} crédits</strong>
              </div>
              <div className="total">
                <span>Solde après achat</span>
                <strong>{credits - subject.credits} crédits</strong>
              </div>
            </div>

            <p className="sd-modal-note">Accès permanent, mode exercice et mode examen solo inclus.</p>

            <div className="sd-modal-actions">
              <button className="sd-btn-secondary" onClick={() => setShowPurchaseModal(false)}>
                Annuler
              </button>
              <button className="sd-btn-primary" onClick={confirmPurchase} disabled={isPurchasing}>
                {isPurchasing ? 'Traitement...' : 'Confirmer l’achat'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sd-toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className={`sd-toast sd-toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>

      <header className="subject-header">
        <div className="subject-header-inner">
          <nav className="subject-breadcrumbs" aria-label="Fil d'Ariane">
            <ol>
              <li><Link href="/">Accueil</Link></li>
              <li><Link href="/catalogue">Catalogue</Link></li>
              <li aria-current="page">{subject.matiere}</li>
            </ol>
          </nav>

          <div className="subject-tags">
            <span className="tag">{subject.type}</span>
            <span className="tag">{subject.annee}</span>
            <span className="tag">{subject.serie || 'Tronc commun'}</span>
            <span className={`tag ${accessState === 'locked' ? 'tag-locked' : 'tag-unlocked'}`}>
              {accessState === 'locked' ? 'Non débloqué' : 'Débloqué'}
            </span>
          </div>

          <h1>{subject.titre}</h1>
          <p className="subject-subtitle">
            {subject.description ||
              'Sujet officiel avec lecture simple, entraînement interactif et mode examen blanc solo.'}
          </p>

          <div className="subject-meta">
            <span><FileText size={14} /> {subject.pages || 1} pages</span>
            <span><Clock size={14} /> {subject.duree || '3h'}</span>
            <span><Target size={14} /> {subject.nbExercices || 4} exercices</span>
            <span><BrainCircuit size={14} /> Correction IA disponible</span>
          </div>
        </div>
      </header>

      <main id="main-content" className="subject-main">
        <section className="subject-content">
          <div className="mode-switcher">
            <button
              className={displayMode === 'lecture' ? 'active' : ''}
              onClick={() => setDisplayMode('lecture')}
            >
              <BookOpen size={16} /> Lecture simple
            </button>
            <button
              className={displayMode === 'exercice' ? 'active' : ''}
              onClick={() => setDisplayMode('exercice')}
            >
              <PencilLine size={16} /> Mode exercice
            </button>
            <button
              className={displayMode === 'solo' ? 'active' : ''}
              onClick={() => setDisplayMode('solo')}
            >
              <Timer size={16} /> Examen blanc solo
            </button>
            <button
              className={displayMode === 'groupe' ? 'active' : ''}
              onClick={() => setDisplayMode('groupe')}
            >
              <Users size={16} /> Examen groupé
            </button>
          </div>

          {displayMode === 'lecture' && (
            <article className={`lecture-sheet ${accessState === 'locked' ? 'locked' : ''}`}>
              <div className="lecture-head">
                <div>
                  <h2>Lecture du sujet</h2>
                  <p>
                    {accessState === 'locked'
                      ? 'Aperçu : les premières parties sont visibles, débloquez pour la suite.'
                      : 'Version HTML complète, idéale pour lire calmement l’énoncé.'}
                  </p>
                </div>
                <button className="sd-btn-secondary" onClick={handleDownloadPdf}>
                  <Download size={14} /> Télécharger PDF
                </button>
              </div>

              <SubjectRenderer
                content={subject.content}
                lockAfter={accessState === 'locked' ? 2 : undefined}
                lockOverlay={
                  <div className="lecture-paywall">
                    <p>Débloquez le sujet pour accéder à l’intégralité du contenu.</p>
                    <button className="sd-btn-primary" onClick={requestUnlock}>
                      Débloquer pour {subject.credits} crédits
                    </button>
                  </div>
                }
              />
            </article>
          )}

          {displayMode === 'exercice' && (
            <section className="exercise-sheet">
              <div className="exercise-head">
                <h2>Mode exercice interactif</h2>
                <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                  Répondez à chaque question puis envoyez vos réponses à l'IA pour une correction détaillée.
                </p>
              </div>

              {exerciseQuestions.length === 0 ? (
                <div style={{
                  padding: '1.5rem',
                  background: 'var(--surface)',
                  borderRadius: 'var(--r)',
                  textAlign: 'center',
                  color: 'var(--text-3)',
                }}>
                  Ce sujet ne contient pas encore de questions structurées. Utilisez la correction IA directe ci-dessous.
                </div>
              ) : (
                <>
                  {exerciseQuestions.map((q) => (
                    <div className="exercise-item" key={q.key}>
                      <label>
                        <strong style={{ color: 'var(--gold)' }}>{q.label}</strong>
                        {q.points ? <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}> · {q.points} pts</span> : null}
                        <span style={{ display: 'block', marginTop: '0.35rem' }}>{q.text}</span>
                      </label>
                      <textarea
                        value={exerciseAnswers[q.key] || ''}
                        onChange={(event) => handleExerciseValue(q.key, event.target.value)}
                        placeholder="Rédigez votre réponse ici…"
                        rows={4}
                      />
                    </div>
                  ))}

                  <div className="exercise-footer">
                    <span>
                      {answeredExerciseCount} / {exerciseQuestions.length} questions remplies
                      {' '}· <strong style={{ color: 'var(--gold)' }}>{aiPrices.priceSubmission} crédits</strong>
                    </span>
                    <button className="sd-btn-primary" onClick={submitExerciseForAI} disabled={isSubmittingExercise || accessState === 'locked'}>
                      {isSubmittingExercise ? 'Correction en cours…' : accessState === 'locked' ? 'Débloquez pour soumettre' : `Soumettre à l'IA (${aiPrices.priceSubmission} cr.)`}
                    </button>
                  </div>
                </>
              )}

              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(155, 183, 224, 0.06)',
                border: '1px dashed rgba(155, 183, 224, 0.3)',
                borderRadius: 'var(--r)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <p style={{ margin: 0, fontWeight: 500 }}>Correction IA directe</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-3)' }}>
                    Obtenez le corrigé complet sans rédiger vos réponses (coût plus élevé).
                  </p>
                </div>
                <button
                  className="sd-btn-secondary"
                  onClick={() => setShowDirectConfirm(true)}
                  disabled={isRequestingDirect || accessState === 'locked'}
                >
                  <Sparkles size={14} />
                  {isRequestingDirect ? 'Génération…' : `Correction directe (${aiPrices.priceDirect} cr.)`}
                </button>
              </div>
            </section>
          )}

          {displayMode === 'correction' && aiCorrection && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className="sd-btn-secondary"
                  onClick={() => setDisplayMode(aiCorrection.mode === 'SUBMISSION' ? 'exercice' : 'lecture')}
                >
                  ← Retour
                </button>
                <button
                  className="sd-btn-primary"
                  onClick={() => router.push(`/sujet/${subject.id}/consult`)}
                >
                  <Download size={14} /> Télécharger le PDF (sujet + correction)
                </button>
              </div>
              <AICorrectionView
                result={aiCorrection.result}
                mode={aiCorrection.mode}
                createdAt={aiCorrection.createdAt}
              />
            </section>
          )}

          {displayMode === 'solo' && (
            <section className="solo-mode-card">
              <div className="solo-mode-head">
                <h2>Mode examen blanc solo</h2>
                <p>
                  Session chronométrée, anti copie/coller, progression question par question et soumission finale.
                </p>
              </div>

              <div className="solo-mode-badges">
                <span><Timer size={14} /> {subject.duree || '3h'}</span>
                <span><GraduationCap size={14} /> Conditions réelles</span>
                <span><Sparkles size={14} /> Correction IA post-soumission</span>
              </div>

              <button className="sd-btn-primary" onClick={startSoloExam} disabled={isConvertingExam}>
                {isConvertingExam ? 'Préparation de la session...' : 'Lancer le mode examen solo'}
              </button>
            </section>
          )}

          {displayMode === 'groupe' && (
            <section className="group-mode-card">
              <h2>Mode examen groupé</h2>
              <p>
                Ce mode sera disponible lorsqu’un professeur ou un administrateur créera une session d’examen collective.
              </p>
              <p className="group-note">Fonctionnalité planifiée: salles, convocations et suivi multi-candidats.</p>
            </section>
          )}
        </section>

        <aside className="subject-sidebar">
          <div className="price-card">
            <p className="price-label">Prix d’accès</p>
            <div className="price-value">{subject.credits} crédits</div>
            <p className="price-balance">Votre solde: {credits} crédits</p>
            {accessState === 'locked' ? (
              <button className="sd-btn-primary" onClick={requestUnlock}>
                Débloquer ce sujet
              </button>
            ) : (
              <div className="unlocked-badge">Sujet débloqué — accès permanent</div>
            )}
            <button className="sd-btn-secondary" onClick={() => router.push('/recharge')}>
              Recharger mes crédits
            </button>
          </div>

          <div className="side-card">
            <h3>Informations</h3>
            <ul>
              <li><span>Matière</span><strong>{subject.matiere}</strong></li>
              <li><span>Niveau</span><strong>{subject.serie || 'Général'}</strong></li>
              <li><span>Type</span><strong>{subject.type}</strong></li>
              <li><span>Année</span><strong>{subject.annee}</strong></li>
              <li><span>Auteur</span><strong>{subject.authorName || 'Contributeur Mah.AI'}</strong></li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  )
}
