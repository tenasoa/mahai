'use client'

import { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Editor } from '@tiptap/react'

import '../editor.css'

import EditorNavbar from '@/components/editor/EditorNavbar'
import DiscBar from '@/components/editor/DiscBar'
import EditorToolbar from '@/components/editor/EditorToolbar'
import EditorCanvas, { EditorCanvasHandle } from '@/components/editor/EditorCanvas'
import MetadataSidebar from '@/components/editor/MetadataSidebar'
import PricingSidebar from '@/components/editor/PricingSidebar'
import MobileBar from '@/components/editor/MobileBar'
import OnboardingModal from '@/components/editor/OnboardingModal'
import InsertMenu from '@/components/editor/InsertMenu'
import SymbolsDropdown from '@/components/editor/SymbolsDropdown'
import KaTeXModal from '@/components/editor/KaTeXModal'
import PreviewModal from '@/components/editor/PreviewModal'
import MoreMenu from '@/components/editor/MoreMenu'
import LinkPopover from '@/components/editor/LinkPopover'
import TableContextMenu from '@/components/editor/TableContextMenu'
import BubbleToolbar from '@/components/editor/BubbleToolbar'
import ShortcutsModal from '@/components/editor/ShortcutsModal'

import {
  SubjectMetadata,
  SaveState,
  PrixMode,
  Visibilite,
  OutlineItem,
  CustomMeta,
} from '@/components/editor/types'

import {
  createSubjectDraft,
  saveSubjectDraft,
  submitSubject,
} from '../editor-actions'

import { useToast } from '@/lib/hooks/useToast'

interface Props {
  isNewSubject: boolean
  initialDraftId?: string
  initialData?: Partial<SubjectMetadata & { prix: number; prixMode: string; visibilite: string; content: object }>
}

const STORAGE_KEY = 'mahai_editor_draft_id'
const SAVE_DEBOUNCE = 2000

function emptyMeta(initial?: Partial<SubjectMetadata>): SubjectMetadata {
  return {
    title:          initial?.title          || '',
    matiere:        initial?.matiere        || '',
    examType:       initial?.examType       || '',
    bepcOption:     initial?.bepcOption     || '',
    baccType:       initial?.baccType       || '',
    serie:          initial?.serie          || '',
    concoursType:   initial?.concoursType   || '',
    etablissement:  initial?.etablissement  || '',
    semestre:       initial?.semestre       || '',
    filiere:        initial?.filiere        || '',
    anneeScolaire:  initial?.anneeScolaire  || '',
    dateOfficielle: initial?.dateOfficielle || '',
    duree:          initial?.duree          || '',
    coefficient:    initial?.coefficient    || '2',
    contentType:    initial?.contentType    || 'sujet_seul',
    tags:           initial?.tags           || [],
    customMeta:     (initial?.customMeta as CustomMeta[]) || [],
  }
}

export default function EditorClient({ isNewSubject, initialDraftId, initialData }: Props) {
  const router = useRouter()
  const toast = useToast()

  // ── State ──────────────────────────────────────────────────────────
  const [showOnboarding, setShowOnboarding] = useState(isNewSubject)
  const [draftId, setDraftId] = useState<string | null>(initialDraftId || null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [discFilter, setDiscFilter] = useState('Toutes')
  const [outline, setOutline] = useState<OutlineItem[]>([])
  const [activeOutlineId, setActiveOutlineId] = useState<string | undefined>()

  const [meta, setMeta] = useState<SubjectMetadata>(emptyMeta(initialData))
  const [prix, setPrix] = useState<number>(initialData?.prix || 2000)
  const [prixMode, setPrixMode] = useState<PrixMode>((initialData?.prixMode as PrixMode) || 'forfait')
  const [visibilite, setVisibilite] = useState<Visibilite>((initialData?.visibilite as Visibilite) || 'public')

  // Overlays
  const [insertMenuPos, setInsertMenuPos] = useState<{ top: number; left: number } | null>(null)
  const [symbolsPos, setSymbolsPos] = useState<{ top: number; left: number } | null>(null)
  const [showKaTeX, setShowKaTeX] = useState(false)
  const [katexMode, setKatexMode] = useState<'block' | 'inline'>('block')
  const [editingInlineMath, setEditingInlineMath] = useState<{ latex: string; pos: number | null } | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [moreMenuPos, setMoreMenuPos] = useState<{ top: number; left: number } | null>(null)
  const [linkPos, setLinkPos] = useState<{ top: number; left: number } | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)

  const [stats, setStats] = useState({ words: 0, pages: 0, questions: 0, readTime: 0 })

  // ── Refs ───────────────────────────────────────────────────────────
  const editorRef = useRef<EditorCanvasHandle>(null)
  const editorInstance = useRef<Editor | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingContent = useRef<object | null>(null)
  const lastSavedContent = useRef<object | null>(null)
  const lastSavedSnapshot = useRef<string | null>(null)

  // Body class pour masquer le global mobile nav.
  // useLayoutEffect : appliqué AVANT le premier paint pour éviter tout flash
  // de la navbar globale ou du mobile-bottom-nav. Garde SSR via typeof window.
  const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
  useIsoLayoutEffect(() => {
    document.body.classList.add('editor-active')
    return () => document.body.classList.remove('editor-active')
  }, [])

  // ── Restore draft depuis localStorage (uniquement si isNewSubject sans URL draft) ──
  useEffect(() => {
    if (isNewSubject && !draftId) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        // On ne redirige pas automatiquement — on laisse l'utilisateur soit compléter l'onboarding,
        // soit on utilise ce draft existant en arrière-plan si l'onboarding est complété
        setDraftId(stored)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Listener inlineMath : ouvre la modale en mode inline ────────────
  // Émis par l'extension inlineMath au clic sur un node existant ou via Mod-M.
  useEffect(() => {
    function handleInlineMathEdit(e: Event) {
      const detail = (e as CustomEvent<{ latex: string; pos: number | null }>).detail
      if (detail && detail.latex) {
        // Édition d'un node existant
        setEditingInlineMath({ latex: detail.latex, pos: detail.pos })
      } else {
        // Insertion : ouvre la modale en mode inline, pas en édition
        setEditingInlineMath(null)
      }
      setKatexMode('inline')
      setShowKaTeX(true)
    }
    window.addEventListener('mahai:inline-math:edit', handleInlineMathEdit)
    return () => window.removeEventListener('mahai:inline-math:edit', handleInlineMathEdit)
  }, [])

  // ── Onboarding complete ────────────────────────────────────────────
  const handleOnboardingComplete = async (
    data: SubjectMetadata & { prix: number; prixMode: string }
  ) => {
    const newMeta: SubjectMetadata = { ...data }
    setMeta(newMeta)
    setPrix(data.prix)
    setPrixMode(data.prixMode as PrixMode)
    setShowOnboarding(false)

    const result = await createSubjectDraft({
      title:          data.title,
      matiere:        data.matiere,
      examType:       data.examType,
      bepcOption:     data.bepcOption,
      baccType:       data.baccType,
      serie:          data.serie,
      concoursType:   data.concoursType,
      etablissement:  data.etablissement,
      semestre:       data.semestre,
      filiere:        data.filiere,
      anneeScolaire:  data.anneeScolaire,
      dateOfficielle: data.dateOfficielle,
      duree:          data.duree,
      coefficient:    data.coefficient ? Number(data.coefficient) : undefined,
      contentType:    data.contentType,
      customMeta:     data.customMeta,
      prix:           data.prix,
      prixMode:       data.prixMode,
    })

    if (result.success) {
      setDraftId(result.id)
      localStorage.setItem(STORAGE_KEY, result.id)
      setSaveState('saved')
      toast.success('Brouillon créé', 'Votre sujet est en cours de sauvegarde automatique.')
      router.replace(`/contributeur/sujets/${result.id}/edit`)
    } else {
      toast.error('Erreur', result.error || 'Impossible de créer le brouillon.')
    }
  }

  // ── Auto-save ──────────────────────────────────────────────────────
  const doSave = useCallback(async (contentOverride?: object) => {
    if (!draftId) return
    const contentToSave = contentOverride ?? pendingContent.current ?? editorRef.current?.getJSON() ?? {}
    pendingContent.current = contentToSave

    // Skip si rien n'a changé depuis le dernier save réussi
    const serializedNow = JSON.stringify({
      content: contentToSave, meta, prix, prixMode, visibilite,
    })
    if (serializedNow === lastSavedSnapshot.current && saveState !== 'error') {
      return { success: true as const }
    }

    setSaveState('saving')

    const result = await saveSubjectDraft(draftId, {
      title:          meta.title,
      matiere:        meta.matiere,
      examType:       meta.examType,
      bepcOption:     meta.bepcOption,
      baccType:       meta.baccType,
      serie:          meta.serie,
      concoursType:   meta.concoursType,
      etablissement:  meta.etablissement,
      semestre:       meta.semestre,
      filiere:        meta.filiere,
      anneeScolaire:  meta.anneeScolaire,
      dateOfficielle: meta.dateOfficielle,
      duree:          meta.duree,
      coefficient:    meta.coefficient ? Number(meta.coefficient) : null,
      contentType:    meta.contentType,
      tags:           meta.tags,
      customMeta:     meta.customMeta,
      content:        contentToSave,
      prix,
      prixMode,
      visibilite,
    })

    if (result.success) {
      setSaveState('saved')
      setLastSavedAt(Date.now())
      lastSavedContent.current = contentToSave
      lastSavedSnapshot.current = serializedNow
    } else {
      setSaveState('error')
      toast.error('Erreur de sauvegarde', (result as any).error || 'Réessayez ou vérifiez votre connexion.')
    }
    return result
  }, [draftId, meta, prix, prixMode, visibilite, saveState, toast])

  const triggerSave = useCallback((content?: object) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    if (content) pendingContent.current = content
    saveTimer.current = setTimeout(() => { doSave() }, SAVE_DEBOUNCE)
  }, [doSave])

  // Sauvegarde manuelle (bouton Retry ou Cmd+S)
  const forceSave = useCallback(() => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null }
    doSave(editorRef.current?.getJSON())
  }, [doSave])

  // Re-trigger save quand meta / prix / visibilité changent
  useEffect(() => {
    if (draftId && !showOnboarding) {
      triggerSave()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta, prix, prixMode, visibilite])

  // Sauvegarde avant fermeture de la page + avertissement navigateur si save en cours
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      // Flush timer : tente une dernière sauvegarde (async, best-effort)
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
        saveTimer.current = null
        doSave()
      }
      // Bloque la fermeture si une sauvegarde est en cours ou en erreur
      if (saveState === 'saving' || saveState === 'error') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [doSave, saveState])

  // Raccourci Cmd/Ctrl + S pour sauvegarde manuelle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        forceSave()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [forceSave])

  // ── Content change handler ─────────────────────────────────────────
  const handleContentChange = useCallback((json: object, words: number, newOutline: OutlineItem[]) => {
    setWordCount(words)
    setOutline(newOutline)
    setStats({
      words,
      pages:     Math.max(1, Math.ceil(words / 250)),
      questions: newOutline.filter(i => i.type === 'question').length,
      readTime:  Math.max(1, Math.ceil(words / 200)),
    })
    triggerSave(json)
  }, [triggerSave])

  // ── Meta change handler ────────────────────────────────────────────
  const handleMetaChange = <K extends keyof SubjectMetadata>(field: K, value: SubjectMetadata[K]) => {
    setMeta(prev => ({ ...prev, [field]: value }))
  }

  // ── Submit handler ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!draftId) {
      toast.error('Erreur', 'Aucun brouillon actif. Créez d\'abord un brouillon via l\'onboarding.')
      return
    }
    const errors: string[] = []
    if (!meta.title.trim())    errors.push('Titre requis')
    if (!meta.matiere.trim())  errors.push('Matière requise')
    if (!meta.examType)        errors.push('Type d\'examen requis')
    if (!meta.anneeScolaire)   errors.push('Année requise')
    if (prix <= 0)             errors.push('Prix requis (> 0 Ar)')
    if (wordCount === 0)       errors.push('Le contenu ne peut pas être vide')

    if (errors.length > 0) {
      toast.warning('Validation', errors.join(' · '))
      return
    }

    // Force-save avant soumission
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null }
    const saveResult = await doSave(editorRef.current?.getJSON())
    if (!saveResult || !saveResult.success) {
      toast.error('Erreur', 'Impossible de sauvegarder avant soumission.')
      return
    }

    const result = await submitSubject(draftId)
    if (result.success) {
      localStorage.removeItem(STORAGE_KEY)
      toast.success('Soumis !', 'Votre sujet a été soumis pour vérification.')
      setTimeout(() => router.push('/contributeur/sujets'), 1500)
    } else {
      const msg = 'errors' in result ? result.errors?.join(' · ') : (result as any).error
      toast.error('Soumission refusée', msg || 'Vérifiez les champs obligatoires.')
    }
  }

  // ── Validation badge navbar ─────────────────────────────────────────
  const canSubmit = !!(meta.title && meta.matiere && meta.examType && meta.anneeScolaire && prix > 0 && wordCount > 0 && draftId)

  // ── Raccourci ⌘/ pour la modale raccourcis ────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShowShortcuts(prev => !prev)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Overlays ────────────────────────────────────────────────────────
  const handleInsertMenu = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setInsertMenuPos({ top: rect.bottom + 4, left: rect.left })
    setSymbolsPos(null)
    setMoreMenuPos(null)
    setLinkPos(null)
  }
  const handleSymbols = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setSymbolsPos({ top: rect.bottom + 4, left: rect.left })
    setInsertMenuPos(null)
    setMoreMenuPos(null)
    setLinkPos(null)
  }
  const handleMore = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setMoreMenuPos({ top: rect.bottom + 4, left: rect.left })
    setInsertMenuPos(null)
    setSymbolsPos(null)
    setLinkPos(null)
  }
  const handleLink = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setLinkPos({ top: rect.bottom + 4, left: rect.left })
    setInsertMenuPos(null)
    setSymbolsPos(null)
    setMoreMenuPos(null)
  }
  const handleLinkFromBubble = () => {
    // Depuis le bubble menu, on positionne le popover au centre du viewport
    setLinkPos({ top: 120, left: Math.max(8, window.innerWidth / 2 - 160) })
    setInsertMenuPos(null)
    setSymbolsPos(null)
    setMoreMenuPos(null)
  }

  const handlePreview = () => {
    if (!editorInstance.current) {
      toast.info('Aperçu', 'Éditeur en cours de chargement, patientez un instant…')
      return
    }
    setShowPreview(true)
  }

  return (
    <div className="editor-page">
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      <EditorNavbar
        saveState={saveState}
        wordCount={wordCount}
        canSubmit={canSubmit}
        lastSavedAt={lastSavedAt}
        onPreview={handlePreview}
        onSubmit={handleSubmit}
        onRetrySave={forceSave}
        isNewSubject={isNewSubject}
      />

      <DiscBar active={discFilter} onChange={setDiscFilter} />

      <EditorToolbar
        editor={editorInstance.current}
        onInsertMenu={handleInsertMenu}
        onSymbols={handleSymbols}
        onKaTeX={() => { setKatexMode('block'); setEditingInlineMath(null); setShowKaTeX(true) }}
        onKaTeXInline={() => { setKatexMode('inline'); setEditingInlineMath(null); setShowKaTeX(true) }}
        onLink={handleLink}
        onMore={handleMore}
      />

      {insertMenuPos && (
        <InsertMenu
          editor={editorInstance.current}
          position={insertMenuPos}
          onClose={() => setInsertMenuPos(null)}
          onOpenKaTeX={() => { setInsertMenuPos(null); setShowKaTeX(true) }}
        />
      )}

      {symbolsPos && (
        <SymbolsDropdown
          editor={editorInstance.current}
          position={symbolsPos}
          onClose={() => setSymbolsPos(null)}
        />
      )}

      {showKaTeX && (
        <KaTeXModal
          editor={editorInstance.current}
          onClose={() => { setShowKaTeX(false); setEditingInlineMath(null) }}
          defaultMode={katexMode}
          editingInlineMath={editingInlineMath}
        />
      )}

      {moreMenuPos && (
        <MoreMenu
          editor={editorInstance.current}
          position={moreMenuPos}
          onClose={() => setMoreMenuPos(null)}
        />
      )}

      {linkPos && (
        <LinkPopover
          editor={editorInstance.current}
          position={linkPos}
          onClose={() => setLinkPos(null)}
        />
      )}

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}

      {showPreview && (
        <PreviewModal
          content={editorRef.current?.getJSON() || {}}
          meta={meta}
          prix={prix}
          onClose={() => setShowPreview(false)}
        />
      )}

      <div className="editor-body">
        <aside className="editor-sidebar-left">
          <MetadataSidebar
            meta={meta}
            onChange={handleMetaChange}
            outline={outline}
            onOutlineClick={id => setActiveOutlineId(id)}
            activeOutlineId={activeOutlineId}
          />
        </aside>

        <main className="editor-canvas-wrap">
          <EditorCanvas
            ref={editorRef}
            initialContent={initialData?.content}
            onChange={handleContentChange}
            onEditorReady={editor => { editorInstance.current = editor }}
          />
          <BubbleToolbar
            editor={editorInstance.current}
            onLink={handleLinkFromBubble}
            onKaTeXInline={() => { setKatexMode('inline'); setEditingInlineMath(null); setShowKaTeX(true) }}
          />
          <TableContextMenu editor={editorInstance.current} />
        </main>

        <aside className="editor-sidebar-right">
          <PricingSidebar
            prix={prix}
            prixMode={prixMode}
            visibilite={visibilite}
            stats={stats}
            onPrixChange={setPrix}
            onPrixModeChange={setPrixMode}
            onVisibiliteChange={setVisibilite}
          />
        </aside>
      </div>

      <MobileBar
        editor={editorInstance.current}
        meta={meta}
        onMetaChange={handleMetaChange}
        prix={prix}
        prixMode={prixMode}
        visibilite={visibilite}
        stats={stats}
        onPrixChange={setPrix}
        onPrixModeChange={setPrixMode}
        onVisibiliteChange={setVisibilite}
        outline={outline}
        onOutlineClick={id => setActiveOutlineId(id)}
        onOpenKaTeX={() => setShowKaTeX(true)}
        onInsertMenu={handleInsertMenu}
      />
    </div>
  )
}
