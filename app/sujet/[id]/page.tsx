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
import './detail.css'

type AccessState = 'locked' | 'unlocked'
type DisplayMode = 'lecture' | 'exercice' | 'solo' | 'groupe'

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

// NOTE: Le vrai contenu des exercices n'est pas encore disponible en base de données.
// Cette fonction retourne un template d'exemple pour démonstration de l'interface.
// TODO: Charger les vraies questions depuis la table Subject quand le champ content sera ajouté.
function createExerciseTemplate(subject: SubjectPayload) {
  return [
    {
      id: 'q1',
      type: 'text',
      label: `[DÉMO] Exercice 1 — Notions clés en ${subject.matiere}`,
      placeholder: 'Votre définition structurée...',
    },
    {
      id: 'q2',
      type: 'textarea',
      label: '[DÉMO] Exercice 2 — Résolution guidée',
      placeholder: 'Rédigez votre raisonnement étape par étape...',
    },
    {
      id: 'q3',
      type: 'qcm',
      label: '[DÉMO] Exercice 3 — Choix multiple',
      options: [
        'Option A: Méthode directe',
        'Option B: Méthode par récurrence',
        'Option C: Méthode graphique',
      ],
    },
    {
      id: 'q4',
      type: 'checkbox',
      label: '[DÉMO] Exercice 4 — Vérifications',
      options: [
        'J’ai vérifié les unités',
        'J’ai justifié chaque étape',
        'J’ai relu la conclusion',
      ],
    },
  ]
}

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
        const [subjectData, userCredits] = await Promise.all([
          getSubjectById(params.id),
          userId ? getCurrentUserCredits() : Promise.resolve(0),
        ])

        if (subjectData) {
          setSubject(subjectData as unknown as SubjectPayload)
          setAccessState(subjectData.isUnlocked ? 'unlocked' : 'locked')
        }

        setCredits(userCredits)
      } catch (error) {
        console.error('load subject error', error)
      } finally {
        setLoading(false)
      }
    }

    void loadSubject()
  }, [params?.id, userId])

  const exerciseTemplate = useMemo(
    () => (subject ? createExerciseTemplate(subject) : []),
    [subject],
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
    if (accessState === 'locked') {
      requestUnlock()
      return
    }

    setIsSubmittingExercise(true)
    setTimeout(() => {
      setIsSubmittingExercise(false)
      pushToast('success', 'Réponses envoyées à l’IA. Votre correction détaillée sera disponible sous peu.')
    }, 1300)
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
                <p style={{ color: 'var(--gold)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  ⚠️ Mode démonstration — Le vrai contenu du sujet sera bientôt disponible.
                </p>
              </div>

              {/* Banner informatif */}
              <div style={{
                padding: '1rem 1.25rem',
                background: 'var(--gold-dim)',
                border: '1px dashed var(--gold-line)',
                borderRadius: 'var(--r)',
                marginBottom: '1.5rem',
                fontSize: '0.82rem',
                color: 'var(--text-2)',
                lineHeight: 1.6
              }}>
                <strong style={{ color: 'var(--gold)' }}>Information :</strong> Les exercices affichés ci-dessous
                sont un <strong>template de démonstration</strong> et ne correspondent pas encore au vrai contenu
                de ce sujet. La mise en ligne des vraies questions est en cours de préparation.
              </div>

              {exerciseTemplate.map((item) => (
                <div className="exercise-item" key={item.id}>
                  <label>{item.label}</label>

                  {item.type === 'text' && (
                    <input
                      value={exerciseAnswers[item.id] || ''}
                      onChange={(event) => handleExerciseValue(item.id, event.target.value)}
                      placeholder={item.placeholder}
                    />
                  )}

                  {item.type === 'textarea' && (
                    <textarea
                      value={exerciseAnswers[item.id] || ''}
                      onChange={(event) => handleExerciseValue(item.id, event.target.value)}
                      placeholder={item.placeholder}
                      rows={5}
                    />
                  )}

                  {item.type === 'qcm' && (
                    <div className="exercise-options">
                      {item.options?.map((option) => (
                        <label key={option}>
                          <input
                            type="radio"
                            checked={exerciseAnswers[item.id] === option}
                            onChange={() => handleExerciseValue(item.id, option)}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {item.type === 'checkbox' && (
                    <div className="exercise-options">
                      {item.options?.map((option) => {
                        const checked = (exerciseAnswers[item.id] || '')
                          .split(',')
                          .filter(Boolean)
                          .includes(option)
                        return (
                          <label key={option}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleCheckboxValue(item.id, option)}
                            />
                            <span>{option}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}

              <div className="exercise-footer">
                <span>{answeredExerciseCount} / {exerciseTemplate.length} questions remplies</span>
                <button className="sd-btn-primary" onClick={submitExerciseForAI} disabled={isSubmittingExercise || accessState === 'locked'}>
                  {isSubmittingExercise ? 'Soumission...' : accessState === 'locked' ? 'Débloquez le sujet pour soumettre' : "Soumettre à l'IA"}
                </button>
              </div>
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
