'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
  Calendar,
  Hash,
  User,
  Gauge,
  Tag,
} from 'lucide-react'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthModal } from '@/components/ui/AuthModal'
import { getSubjectById } from '@/lib/supabase/subjects'
import { getCurrentUserBalanceAr, purchaseCurrentUserSubject } from '@/actions/user'
import { convertSubjectToExamAction } from '@/actions/examen'
import { recordSubjectDownload } from '@/actions/subject-download'
import { SujetDetailSkeleton } from '@/components/ui/PageSkeletons'
import { EmptyState } from '@/components/ui/EmptyState'
import { SubjectRenderer } from '@/components/sujet/SubjectRenderer'
import { AICorrectionView } from '@/components/sujet/AICorrectionView'
import { extractQuestions, type ExtractedQuestion } from '@/lib/ai/extract-questions'
import {
  submitExerciseForCorrection,
  requestDirectAICorrection,
  getAICorrectionHistory,
  getAIPrices,
} from '@/actions/ai-correction'
import type { AICorrectionHistoryItem } from '@/lib/ai-correction-history'
import { AIProcessingOverlay, PDFGeneratingOverlay } from '@/components/ui/AIProcessingLoading'
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
  prix: number
  /** @deprecated Alias historique de prix. */
  credits?: number
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
  examType?: string | null
  baccType?: string | null
  bepcOption?: string | null
  concoursType?: string | null
  etablissement?: string | null
  filiere?: string | null
  semestre?: string | null
  anneeScolaire?: string | null
  dateOfficielle?: string | null
  coefficient?: number | string | null
  tags?: string[] | null
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
  const [aiCorrection, setAiCorrection] = useState<AICorrectionHistoryItem | null>(null)
  const [correctionHistory, setCorrectionHistory] = useState<AICorrectionHistoryItem[]>([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const subjectContentRef = useRef<HTMLDivElement | null>(null)
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

  const goToCorrectionPage = () => {
    const href = `/sujet/${subject?.id ?? params.id}/consult?view=correction`
    router.push(href)

    window.setTimeout(() => {
      if (window.location.pathname + window.location.search !== href) {
        window.location.assign(href)
      }
    }, 300)
  }

  useEffect(() => {
    async function loadSubject() {
      if (!params?.id) return

      setLoading(true)
      try {
        const [subjectData, userCredits, prices, historyRes] = await Promise.all([
          getSubjectById(params.id),
          userId ? getCurrentUserBalanceAr() : Promise.resolve(0),
          getAIPrices().catch(() => ({ priceSubmission: 3, priceDirect: 8 })),
          userId ? getAICorrectionHistory(params.id).catch(() => null) : Promise.resolve(null),
        ])

        if (subjectData) {
          setSubject(subjectData as unknown as SubjectPayload)
          setAccessState(subjectData.isUnlocked ? 'unlocked' : 'locked')
        }

        setCredits(userCredits)
        setAiPrices(prices)

        if (historyRes && 'success' in historyRes && historyRes.success) {
          setCorrectionHistory(historyRes.data)
          setAiCorrection(historyRes.data[0] || null)
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

    const subjectPrix = subject.prix ?? subject.credits ?? 0
    if (credits < subjectPrix) {
      pushToast('error', `Solde insuffisant. Il vous manque ${(subjectPrix - credits).toLocaleString('fr-FR')} Ar.`)
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
      const remaining = (result as any).remainingBalance ?? (result as any).remainingCredits ?? (await getCurrentUserBalanceAr())
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
        correctionId: res.data.correctionId,
        result: res.data.result,
        mode: 'SUBMISSION',
        createdAt: new Date().toISOString(),
        costAr: res.data.costAr,
        model: null,
        fromCache: Boolean(res.data.fromCache),
      })
      setCorrectionHistory((prev) => [
        {
          correctionId: res.data.correctionId,
          result: res.data.result,
          mode: 'SUBMISSION',
          createdAt: new Date().toISOString(),
          costAr: res.data.costAr,
          model: null,
          fromCache: Boolean(res.data.fromCache),
        },
        ...prev,
      ])
      setCredits(res.data.balanceArRemaining)
      pushToast('success', `Correction IA prête. ${res.data.costAr.toLocaleString('fr-FR')} Ar débités.`)
      goToCorrectionPage()
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
        correctionId: res.data.correctionId,
        result: res.data.result,
        mode: 'DIRECT',
        createdAt: new Date().toISOString(),
        costAr: res.data.costAr,
        model: null,
        fromCache: Boolean(res.data.fromCache),
      })
      setCorrectionHistory((prev) => [
        {
          correctionId: res.data.correctionId,
          result: res.data.result,
          mode: 'DIRECT',
          createdAt: new Date().toISOString(),
          costAr: res.data.costAr,
          model: null,
          fromCache: Boolean(res.data.fromCache),
        },
        ...prev,
      ])
      setCredits(res.data.balanceArRemaining)
      setShowDirectConfirm(false)
      pushToast('success', `Correction IA modèle prête. ${res.data.costAr.toLocaleString('fr-FR')} Ar débités.`)
      goToCorrectionPage()
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

  const handleDownloadPdf = async () => {
    if (accessState === 'locked') {
      requestUnlock()
      return
    }
    if (!subject || isDownloading) return
    setDownloadError(null)
    setIsDownloading(true)
    try {
      const trace = await recordSubjectDownload(subject.id)
      if (!trace.success) {
        setDownloadError(trace.error || 'Téléchargement refusé.')
        return
      }

      if (!subjectContentRef.current) throw new Error('Contenu du sujet introuvable.')

      const { htmlElementToPDFPages } = await import('@/lib/html-to-pdf')

      const pdfTrace = {
        code: trace.data.watermarkCode,
        userName: trace.data.userName,
        userEmail: trace.data.userEmail,
        downloadedAt: trace.data.downloadedAt,
      }

      // En-tête du sujet
      const header = document.createElement('div')
      header.style.cssText = 'font-family:ui-sans-serif,system-ui,sans-serif;padding:0 0 20px;margin-bottom:24px;border-bottom:1.5px solid #C9A84C;'
      const brand = document.createElement('div')
      brand.style.cssText = 'font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;margin-bottom:10px;font-weight:600;'
      brand.textContent = 'Mah.AI · Annales Madagascar'
      const titleEl = document.createElement('h1')
      titleEl.style.cssText = 'font-size:20px;font-weight:700;color:#0c0c0e;margin:0 0 14px;line-height:1.3;font-family:inherit;'
      titleEl.textContent = subject.titre
      const chips = document.createElement('div')
      chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px 18px;'
      const addChip = (label: string, value: string | null | undefined) => {
        if (!value) return
        const chip = document.createElement('span')
        chip.style.cssText = 'font-size:12px;color:#555;'
        chip.innerHTML = '<span style="color:#999;margin-right:3px;">' + label + ' :</span><span style="color:#0c0c0e;font-weight:600;">' + value + '</span>'
        chips.appendChild(chip)
      }
      addChip('Matière', subject.matiere)
      const examLabel = [subject.examType || subject.type, subject.serie].filter(Boolean).join(' · ')
      if (examLabel) addChip('Examen', examLabel)
      addChip('Année', subject.anneeScolaire || subject.annee)
      if (subject.etablissement) addChip('Établissement', subject.etablissement)
      if (subject.duree) addChip('Durée', subject.duree)
      if (subject.coefficient) addChip('Coefficient', String(subject.coefficient))
      header.appendChild(brand)
      header.appendChild(titleEl)
      header.appendChild(chips)

      const wrap = document.createElement('div')
      wrap.style.cssText = [
        'position:fixed', 'left:-9999px', 'top:0',
        'width:780px', 'padding:32px 36px 40px',
        'background:#ffffff', 'box-sizing:border-box',
      ].join(';')
      wrap.appendChild(header)
      wrap.appendChild(subjectContentRef.current.cloneNode(true) as HTMLElement)
      document.body.appendChild(wrap)

      await new Promise(r => setTimeout(r, 200))

      const pdfBytes = await htmlElementToPDFPages(wrap, {
        scale: 3,
        marginMm: 14,
        trace: pdfTrace,
        sectionLabel: subject.matiere || 'Sujet',
      })

      try { document.body.removeChild(wrap) } catch { /* déjà retiré */ }

      const slugify = (s: string) =>
        s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/(^-|-$)/g, '').toLowerCase().slice(0, 60)

      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mahai-${slugify(subject.titre)}-${trace.data.watermarkCode}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (err) {
      console.error('PDF download error:', err)
      setDownloadError('Erreur lors de la génération du PDF.')
    } finally {
      setIsDownloading(false)
    }
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

      {/* Overlays de chargement */}
      <AIProcessingOverlay
        isOpen={isSubmittingExercise}
        title="Correction en cours"
        steps={['Lecture de vos réponses', 'Analyse sémantique', 'Évaluation des résultats', 'Génération du rapport']}
      />
      <AIProcessingOverlay
        isOpen={isRequestingDirect}
        title="Correction directe"
        steps={['Analyse du sujet', 'Résolution des questions', 'Rédaction du corrigé', 'Mise en forme finale']}
      />
      <PDFGeneratingOverlay isOpen={isDownloading} />

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
                <strong>{aiPrices.priceDirect} Ar</strong>
              </div>
              <div>
                <span>Votre solde actuel</span>
                <strong>{credits.toLocaleString('fr-FR')} Ar</strong>
              </div>
              <div className="total">
                <span>Solde après débit</span>
                <strong>{credits - aiPrices.priceDirect} Ar</strong>
              </div>
            </div>

            <p className="sd-modal-note">
              L'IA va générer le corrigé complet (toutes les questions résolues, méthodologie incluse).
              Aucun montant n'est débité si la génération échoue.
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
                {isRequestingDirect ? (
                  <><span className="sd-spinner" aria-hidden="true" />Génération…</>
                ) : credits < aiPrices.priceDirect ? (
                  'Solde insuffisant'
                ) : (
                  'Confirmer'
                )}
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
                <strong>{(subject.prix ?? 0).toLocaleString('fr-FR')} Ar</strong>
              </div>
              <div>
                <span>Votre solde actuel</span>
                <strong>{credits.toLocaleString('fr-FR')} Ar</strong>
              </div>
              <div className="total">
                <span>Solde après achat</span>
                <strong>{(credits - (subject.prix ?? 0)).toLocaleString('fr-FR')} Ar</strong>
              </div>
            </div>

            <p className="sd-modal-note">Accès permanent, mode exercice et mode examen solo inclus.</p>

            <div className="sd-modal-actions">
              <button className="sd-btn-secondary" onClick={() => setShowPurchaseModal(false)}>
                Annuler
              </button>
              <button className="sd-btn-primary" onClick={confirmPurchase} disabled={isPurchasing}>
                {isPurchasing ? (
                  <><span className="sd-spinner" aria-hidden="true" />Traitement…</>
                ) : "Confirmer l’achat"}
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
            {(subject.examType || subject.type) && (
              <span className="tag tag-exam">{subject.examType || subject.type}</span>
            )}
            {subject.baccType && (
              <span className="tag">{subject.baccType === 'General' ? 'Général' : 'Technique'}</span>
            )}
            {subject.bepcOption && (
              <span className="tag">Option {subject.bepcOption}</span>
            )}
            {subject.concoursType && (
              <span className="tag">{subject.concoursType}</span>
            )}
            {subject.serie && (
              <span className="tag">Série {subject.serie}</span>
            )}
            {subject.filiere && (
              <span className="tag">{subject.filiere}</span>
            )}
            {subject.semestre && (
              <span className="tag">{subject.semestre === 'S1' ? 'Semestre 1' : 'Final'}</span>
            )}
            {(subject.anneeScolaire || subject.annee) && (
              <span className="tag">{subject.anneeScolaire || subject.annee}</span>
            )}
            <span className={`tag ${accessState === 'locked' ? 'tag-locked' : 'tag-unlocked'}`}>
              {accessState === 'locked' ? 'Non débloqué' : 'Débloqué'}
            </span>
          </div>

          <h1>{subject.titre}</h1>

          {subject.etablissement && (
            <p className="subject-etablissement">{subject.etablissement}</p>
          )}

          <p className="subject-subtitle">
            {subject.description ||
              'Sujet officiel avec lecture simple, entraînement interactif et mode examen blanc solo.'}
          </p>

          {subject.dateOfficielle && (
            <p className="subject-date-off">
              <Calendar size={12} /> {subject.dateOfficielle}
            </p>
          )}

          <div className="subject-meta">
            {(subject.pages) && (
              <span><FileText size={14} /> {subject.pages} page{subject.pages > 1 ? 's' : ''}</span>
            )}
            {subject.duree && (
              <span><Clock size={14} /> {subject.duree}</span>
            )}
            {subject.nbExercices ? (
              <span><Target size={14} /> {subject.nbExercices} exercice{subject.nbExercices > 1 ? 's' : ''}</span>
            ) : null}
            {(subject.coefficient || subject.bareme) && (
              <span><Hash size={14} /> Coef.&nbsp;{subject.coefficient || subject.bareme}</span>
            )}
            {subject.difficulte && (
              <span><Gauge size={14} /> {subject.difficulte}</span>
            )}
            {subject.authorName && (
              <span><User size={14} /> {subject.authorName}</span>
            )}
            {subject.hasCorrectionIa && (
              <span><BrainCircuit size={14} /> Correction IA</span>
            )}
          </div>

          {Array.isArray(subject.tags) && subject.tags.length > 0 && (
            <div className="subject-editor-tags">
              <Tag size={11} />
              {subject.tags.map((t: string) => (
                <span key={t} className="subject-editor-tag">{t}</span>
              ))}
            </div>
          )}
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
              className="mode-disabled"
              onClick={() => pushToast('info', 'Mode exercice — bientôt disponible. Cette fonctionnalité est en cours de développement.')}
              disabled
            >
              <PencilLine size={16} /> Mode exercice
              <span className="mode-coming-soon">Bientôt</span>
            </button>
            <button
              className="mode-disabled"
              onClick={() => pushToast('info', 'Examen blanc solo — bientôt disponible. Cette fonctionnalité est en cours de développement.')}
              disabled
            >
              <Timer size={16} /> Examen blanc solo
              <span className="mode-coming-soon">Bientôt</span>
            </button>
            <button
              className="mode-disabled"
              onClick={() => pushToast('info', 'Examen groupé — bientôt disponible. Cette fonctionnalité est en cours de développement.')}
              disabled
            >
              <Users size={16} /> Examen groupé
              <span className="mode-coming-soon">Bientôt</span>
            </button>
            <button
              className="mode-correction-ia"
              onClick={() => setShowDirectConfirm(true)}
            >
              <Sparkles size={16} /> Correction IA complète
            </button>
          </div>

          {accessState === 'unlocked' && correctionHistory.length > 0 && (
            <section style={{
              marginBottom: '1rem',
              padding: '1rem',
              border: '1px solid var(--b1)',
              borderRadius: 'var(--r)',
              background: 'var(--card)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '0.85rem',
              }}>
                <div>
                  <p style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    margin: 0,
                    color: 'var(--gold)',
                    fontSize: '0.7rem',
                    letterSpacing: '1.3px',
                    textTransform: 'uppercase',
                  }}>
                    <Sparkles size={12} /> Déjà payé
                  </p>
                  <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.05rem' }}>
                    Historique de vos corrections IA
                  </h2>
                </div>
                <Link
                  href={`/sujet/${subject.id}/consult?view=correction`}
                  className="sd-btn-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  Voir en page complète
                </Link>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '0.65rem',
              }}>
                {correctionHistory.map((item, index) => {
                  const isActive = aiCorrection?.correctionId === item.correctionId && displayMode === 'correction'
                  return (
                    <button
                      key={item.correctionId}
                      type="button"
                      onClick={() => {
                        setAiCorrection(item)
                        setDisplayMode('correction')
                        pushToast('info', 'Correction IA chargée depuis votre historique, sans nouveau débit.')
                      }}
                      style={{
                        minHeight: 74,
                        padding: '0.75rem',
                        border: `1px solid ${isActive ? 'var(--gold-line)' : 'var(--b1)'}`,
                        borderRadius: 'calc(var(--r) - 2px)',
                        background: isActive ? 'var(--gold-dim)' : 'var(--surface)',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      aria-pressed={isActive}
                    >
                      <span style={{ display: 'block', fontWeight: 600, fontSize: '0.84rem' }}>
                        {index === 0 ? 'Dernière correction' : `Correction ${correctionHistory.length - index}`}
                      </span>
                      <span style={{ display: 'block', marginTop: '0.25rem', color: 'var(--text-3)', fontSize: '0.73rem', lineHeight: 1.35 }}>
                        {item.mode === 'SUBMISSION' ? 'Réponses étudiant' : 'Correction directe'}
                        {' · '}
                        {new Date(item.createdAt).toLocaleString('fr-FR', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                      <span style={{ display: 'block', marginTop: '0.25rem', color: 'var(--gold)', fontSize: '0.72rem' }}>
                        Déjà débité : {item.costAr.toLocaleString('fr-FR')} Ar
                        {item.fromCache ? ' · correction mutualisée' : ''}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

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
                <button className="sd-btn-secondary" onClick={handleDownloadPdf} disabled={isDownloading}>
                  {isDownloading ? (
                    <><span className="sd-spinner" aria-hidden="true" />Préparation…</>
                  ) : (
                    <><Download size={14} />Télécharger PDF</>
                  )}
                </button>
              </div>
              {downloadError && (
                <p style={{ color: 'var(--ruby)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{downloadError}</p>
              )}

              <div ref={subjectContentRef}>
                <SubjectRenderer
                  content={subject.content}
                  lockAfter={accessState === "locked" ? 2 : undefined}
                  lockOverlay={
                    <div className="lecture-paywall">
                      <p>Débloquez le sujet pour accéder à l’intégralité du contenu.</p>
                      <button className="sd-btn-primary" onClick={requestUnlock}>
                        Débloquer pour {(subject.prix ?? 0).toLocaleString("fr-FR")} Ar
                      </button>
                    </div>
                  }
                />
              </div>
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
                      {' '}· <strong style={{ color: 'var(--gold)' }}>{aiPrices.priceSubmission} Ar</strong>
                    </span>
                    <button className="sd-btn-primary" onClick={submitExerciseForAI} disabled={isSubmittingExercise || accessState === 'locked'}>
                      {isSubmittingExercise ? (
                        <><span className="sd-spinner" aria-hidden="true" />Correction en cours…</>
                      ) : accessState === 'locked' ? (
                        'Débloquez pour soumettre'
                      ) : (
                        `Soumettre à l'IA (${aiPrices.priceSubmission} Ar)`
                      )}
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
                  {isRequestingDirect ? (
                    <><span className="sd-spinner" aria-hidden="true" />Génération…</>
                  ) : (
                    <><Sparkles size={14} />Correction directe ({aiPrices.priceDirect} Ar)</>
                  )}
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
                {isConvertingExam ? (
                  <><span className="sd-spinner" aria-hidden="true" />Préparation de la session…</>
                ) : (
                  'Lancer le mode examen solo'
                )}
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
            <div className="price-value">{(subject.prix ?? 0).toLocaleString('fr-FR')} Ar</div>
            <p className="price-balance">Votre solde: {credits.toLocaleString('fr-FR')} Ar</p>
            {accessState === 'locked' ? (
              <button className="sd-btn-primary" onClick={requestUnlock}>
                Débloquer ce sujet
              </button>
            ) : (
              <div className="unlocked-badge">Sujet débloqué — accès permanent</div>
            )}
            <button className="sd-btn-secondary" onClick={() => router.push('/recharge')}>
              Recharger mon solde
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