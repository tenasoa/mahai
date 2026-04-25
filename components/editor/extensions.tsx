'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import { ROMAN_NUMERALS } from './types'

// ─── Helpers : numérotation automatique par position ───────────────────────

/**
 * Compte combien de nodes de type `nodeName` précèdent `pos` dans le document.
 * Retourne l'index (1-based) de la prochaine occurrence.
 */
function getNodeIndex(editor: any, pos: number, nodeName: string, parentOnly = false): number {
  if (!editor) return 1
  let count = 0
  try {
    editor.state.doc.descendants((node: any, nodePos: number) => {
      if (nodePos >= pos) return false
      if (node.type.name === nodeName) {
        if (parentOnly) {
          // Pour questions, compter celles sous le même exercice/partie parent
          count++
        } else {
          count++
        }
      }
      return true
    })
  } catch {
    return 1
  }
  return count + 1
}

function getRomanNumeral(n: number): string {
  if (n >= 1 && n <= ROMAN_NUMERALS.length) return ROMAN_NUMERALS[n - 1]
  return String(n)
}

// ─── PARTIE ────────────────────────────────────────────────────────────────

function PartieView({ node, updateAttributes, deleteNode, getPos, editor }: any) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titre, setTitre] = useState(node.attrs.titre || '')

  // Numérotation auto
  const pos = typeof getPos === 'function' ? getPos() : 0
  const autoIndex = getNodeIndex(editor, pos, 'partie')
  const autoNum = getRomanNumeral(autoIndex)
  const displayNum = node.attrs.numero && node.attrs.numero !== '?' ? node.attrs.numero : autoNum

  useEffect(() => {
    // Sync numéro auto si l'utilisateur n'a pas forcé
    if (node.attrs.numero === '?' || node.attrs.numero === '') {
      updateAttributes({ numero: autoNum })
    }
  }, [autoIndex])

  const handleTitreBlur = () => {
    setEditingTitle(false)
    updateAttributes({ titre })
  }

  return (
    <NodeViewWrapper>
      <div className="ed-partie" data-type="partie">
        <div className="ed-partie-header">
          <span className="ed-partie-label">
            <span className="ed-bloc-num">{displayNum}</span>
            {editingTitle ? (
              <input
                className="ed-partie-title-input"
                value={titre}
                autoFocus
                onChange={e => setTitre(e.target.value)}
                onBlur={handleTitreBlur}
                onKeyDown={e => e.key === 'Enter' && handleTitreBlur()}
              />
            ) : (
              <span className="ed-partie-title" onClick={() => setEditingTitle(true)}>
                {titre || 'Titre de la partie'}
              </span>
            )}
          </span>
          <div className="ed-bloc-controls">
            <button className="ed-ctrl-btn ed-ctrl-del" onClick={deleteNode} title="Supprimer">✕</button>
          </div>
        </div>
        <NodeViewContent className="ed-partie-content" />
      </div>
    </NodeViewWrapper>
  )
}

export const PartieExtension = Node.create({
  name: 'partie',
  group: 'block',
  content: 'block+',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      numero: { default: '?' },
      titre:  { default: '' },
    }
  },

  parseHTML() { return [{ tag: 'div[data-type="partie"]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'partie' }), 0]
  },
  addNodeView() { return ReactNodeViewRenderer(PartieView) },
})

// ─── EXERCICE ──────────────────────────────────────────────────────────────

function ExerciceView({ node, updateAttributes, deleteNode, getPos, editor }: any) {
  const [points, setPoints] = useState(String(node.attrs.points || 10))

  const pos = typeof getPos === 'function' ? getPos() : 0
  const autoIndex = getNodeIndex(editor, pos, 'exercice')

  useEffect(() => {
    if (!node.attrs.numero || node.attrs.numero === '?') {
      updateAttributes({ numero: autoIndex })
    } else if (typeof node.attrs.numero === 'number' && node.attrs.numero !== autoIndex) {
      // Seulement si on veut la sync forte, on ré-aligne
      updateAttributes({ numero: autoIndex })
    }
  }, [autoIndex])

  const hasPoints = node.attrs.hasPoints !== false
  const togglePoints = () => updateAttributes({ hasPoints: !hasPoints })

  return (
    <NodeViewWrapper>
      <div className="ed-exercice" data-type="exercice">
        <div className="ed-exercice-header">
          <span className="ed-exercice-label">
            <span className="ed-bloc-icon">✎</span>
            Exercice {node.attrs.numero || autoIndex}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className={`ed-ctrl-btn ed-points-toggle${hasPoints ? ' active' : ''}`}
              onClick={togglePoints}
              title={hasPoints ? 'Retirer le barème' : 'Ajouter un barème'}
            >
              {hasPoints ? '⚖ Barème' : '⚖ Sans barème'}
            </button>
            {hasPoints && (
              <>
                <span className="ed-points-label">Points :</span>
                <input
                  className="ed-points-input"
                  type="number"
                  min={0}
                  value={points}
                  onChange={e => setPoints(e.target.value)}
                  onBlur={() => updateAttributes({ points: Number(points) })}
                  style={{ width: '48px' }}
                />
              </>
            )}
            <button className="ed-ctrl-btn ed-ctrl-del" onClick={deleteNode} title="Supprimer">✕</button>
          </div>
        </div>
        <NodeViewContent className="ed-exercice-content" />
      </div>
    </NodeViewWrapper>
  )
}

export const ExerciceExtension = Node.create({
  name: 'exercice',
  group: 'block',
  content: 'block+',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      numero:    { default: '?' },
      points:    { default: 10 },
      hasPoints: { default: true },
    }
  },

  parseHTML() { return [{ tag: 'div[data-type="exercice"]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'exercice' }), 0]
  },
  addNodeView() { return ReactNodeViewRenderer(ExerciceView) },
})

// ─── ENONCE ────────────────────────────────────────────────────────────────

function EnonceView({ deleteNode }: any) {
  return (
    <NodeViewWrapper>
      <div className="ed-enonce" data-type="enonce">
        <span className="ed-enonce-label">¶ Énoncé</span>
        <NodeViewContent className="ed-enonce-content" />
        <button className="ed-ctrl-btn ed-ctrl-del ed-ctrl-abs" onClick={deleteNode}>✕</button>
      </div>
    </NodeViewWrapper>
  )
}

export const EnonceExtension = Node.create({
  name: 'enonce',
  group: 'block',
  content: 'block+',
  defining: true,

  parseHTML() { return [{ tag: 'div[data-type="enonce"]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'enonce' }), 0]
  },
  addNodeView() { return ReactNodeViewRenderer(EnonceView) },
})

// ─── QUESTION ──────────────────────────────────────────────────────────────

function QuestionView({ node, updateAttributes, deleteNode, getPos, editor }: any) {
  const [pts, setPts] = useState(String(node.attrs.points || 2))
  const pos = typeof getPos === 'function' ? getPos() : 0
  const autoIndex = getNodeIndex(editor, pos, 'question')

  useEffect(() => {
    // Sync forte : la numérotation des questions suit toujours leur position
    if (node.attrs.numero !== autoIndex) {
      updateAttributes({ numero: autoIndex })
    }
  }, [autoIndex])

  const hasPoints = node.attrs.hasPoints !== false
  const togglePoints = () => updateAttributes({ hasPoints: !hasPoints })

  return (
    <NodeViewWrapper>
      <div className="ed-question" data-type="question">
        <span className="ed-question-num">{autoIndex}.</span>
        <NodeViewContent className="ed-question-content" />
        <div className="ed-question-meta">
          {hasPoints && (
            <>
              <input
                className="ed-points-input"
                type="number"
                min={0}
                value={pts}
                onChange={e => setPts(e.target.value)}
                onBlur={() => updateAttributes({ points: Number(pts) })}
                style={{ width: '40px' }}
              />
              <span className="ed-points-label">pts</span>
            </>
          )}
          <button
            className="ed-ctrl-btn ed-points-toggle"
            onClick={togglePoints}
            title={hasPoints ? 'Retirer les points' : 'Ajouter des points'}
          >
            {hasPoints ? '×' : '+'}
          </button>
          <button className="ed-ctrl-btn ed-ctrl-del" onClick={deleteNode}>✕</button>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export const QuestionExtension = Node.create({
  name: 'question',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      numero:    { default: 1 },
      points:    { default: 2 },
      hasPoints: { default: false },
    }
  },

  parseHTML() { return [{ tag: 'div[data-type="question"]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'question' }), 0]
  },
  addNodeView() { return ReactNodeViewRenderer(QuestionView) },
})

// ─── ANNOTATION ────────────────────────────────────────────────────────────

const ANNOTATION_META: Record<string, { icon: string; label: string; colorClass: string }> = {
  note:       { icon: '💡', label: 'Note',                colorClass: 'amber' },
  rappel:     { icon: '📗', label: 'Rappel de cours',     colorClass: 'sage'  },
  info:       { icon: 'ℹ',  label: 'Information',          colorClass: 'blue'  },
  attention:  { icon: '⚠',  label: 'Attention / Piège',   colorClass: 'ruby'  },
  definition: { icon: '📖', label: 'Définition',           colorClass: 'blue'  },
  theoreme:   { icon: '🔷', label: 'Théorème',             colorClass: 'sage'  },
  exemple:    { icon: '✏',  label: 'Exemple résolu',       colorClass: 'neutre'},
  correction: { icon: '✓',  label: 'Correction (masquée)', colorClass: 'sage'  },
}

function AnnotationView({ node, deleteNode }: any) {
  const meta = ANNOTATION_META[node.attrs.type] || ANNOTATION_META.note
  const [hidden, setHidden] = useState(node.attrs.type === 'correction')

  return (
    <NodeViewWrapper>
      <div className={`ed-annotation ed-annotation--${meta.colorClass}`} data-type="annotation">
        <div className="ed-annotation-header">
          <span className="ed-annotation-icon">{meta.icon}</span>
          <span className="ed-annotation-label">{meta.label}</span>
          {node.attrs.type === 'correction' && (
            <button className="ed-correction-toggle" onClick={() => setHidden(!hidden)}>
              {hidden ? '[Afficher]' : '[Masquer]'}
            </button>
          )}
          <button className="ed-ctrl-btn ed-ctrl-del" onClick={deleteNode} style={{ marginLeft: 'auto' }}>✕</button>
        </div>
        {!hidden && <NodeViewContent className="ed-annotation-content" />}
      </div>
    </NodeViewWrapper>
  )
}

export const AnnotationExtension = Node.create({
  name: 'annotation',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return { type: { default: 'note' } }
  },

  parseHTML() { return [{ tag: 'div[data-type="annotation"]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'annotation' }), 0]
  },
  addNodeView() { return ReactNodeViewRenderer(AnnotationView) },
})

// ─── FORMULA (KaTeX) ───────────────────────────────────────────────────────

function FormulaView({ node, deleteNode }: any) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const latex = node.attrs.latex || ''
    if (!latex) {
      containerRef.current.innerHTML = '<span style="color:var(--text-4);font-style:italic">Formule vide — cliquez pour éditer</span>'
      return
    }
    import('katex').then(katex => {
      try {
        katex.default.render(latex, containerRef.current!, {
          displayMode: true,
          throwOnError: false,
          output: 'html',
        })
      } catch {
        if (containerRef.current) {
          containerRef.current.innerHTML = `<span style="color:var(--ruby)">${latex}</span>`
        }
      }
    })
  }, [node.attrs.latex])

  return (
    <NodeViewWrapper>
      <div className="ed-formula" data-type="formula">
        <div ref={containerRef} className="ed-formula-render" />
        <button className="ed-ctrl-btn ed-ctrl-del ed-ctrl-abs" onClick={deleteNode}>✕</button>
      </div>
    </NodeViewWrapper>
  )
}

export const FormulaExtension = Node.create({
  name: 'formula',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return { latex: { default: '' } }
  },

  parseHTML() { return [{ tag: 'div[data-type="formula"]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'formula' })]
  },
  addNodeView() { return ReactNodeViewRenderer(FormulaView) },
})

// ─── SCHEMA (image upload via Vercel Blob) ─────────────────────────────────

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

function SchemaView({ node, updateAttributes, deleteNode }: any) {
  const [uploadState, setUploadState] = useState<UploadState>(
    node.attrs.url ? 'done' : 'idle'
  )
  const [errorMsg, setErrorMsg] = useState('')
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setUploadState('uploading')
    setErrorMsg('')
    setProgress(10)

    const formData = new FormData()
    formData.append('file', file)
    const submissionId = typeof window !== 'undefined'
      ? localStorage.getItem('mahai_editor_draft_id')
      : null
    if (submissionId) formData.append('submissionId', submissionId)

    try {
      setProgress(40)
      const res = await fetch('/api/editor/upload-image', {
        method: 'POST',
        body: formData,
      })
      setProgress(80)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload échoué')
      }

      updateAttributes({ url: data.url, filename: data.filename, mimeType: data.mimeType })
      setUploadState('done')
      setProgress(100)
    } catch (err: any) {
      setUploadState('error')
      setErrorMsg(err.message || 'Erreur d\'upload')
      setProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDelete = async () => {
    if (node.attrs.url) {
      try {
        await fetch('/api/editor/upload-image', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: node.attrs.url }),
        })
      } catch { /* silencieux */ }
    }
    deleteNode()
  }

  return (
    <NodeViewWrapper>
      <div
        className="ed-schema"
        data-type="schema"
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        {uploadState === 'done' && node.attrs.url ? (
          <div className="ed-schema-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={node.attrs.url}
              alt={node.attrs.filename || 'Schéma'}
              style={{ maxWidth: '100%', maxHeight: '480px', borderRadius: '4px', display: 'block', margin: '0 auto' }}
            />
            <div className="ed-schema-preview-meta">
              <span style={{ fontSize: '0.7rem', color: 'var(--text-4)', fontFamily: 'var(--mono)' }}>
                {node.attrs.filename || 'image'}
              </span>
              <button
                className="ed-schema-replace-btn"
                onClick={() => { updateAttributes({ url: '', filename: '' }); setUploadState('idle') }}
              >
                Remplacer
              </button>
            </div>
          </div>
        ) : (
          <div
            className="ed-schema-inner"
            onClick={() => uploadState !== 'uploading' && inputRef.current?.click()}
          >
            {uploadState === 'uploading' ? (
              <>
                <span style={{ fontSize: '1.5rem' }}>⏳</span>
                <p style={{ margin: '0.5rem 0 0', color: 'var(--text-3)', fontSize: '0.85rem' }}>
                  Upload en cours…
                </p>
                <div className="ed-upload-progress">
                  <div className="ed-upload-bar" style={{ width: `${progress}%` }} />
                </div>
              </>
            ) : uploadState === 'error' ? (
              <>
                <span style={{ fontSize: '1.5rem' }}>⚠</span>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--ruby)', fontSize: '0.82rem' }}>
                  {errorMsg}
                </p>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-4)', fontSize: '0.72rem' }}>
                  Cliquez pour réessayer
                </p>
              </>
            ) : (
              <>
                <span style={{ fontSize: '2rem' }}>🖼</span>
                <p style={{ margin: '0.5rem 0 0', color: 'var(--text-3)', fontSize: '0.85rem' }}>
                  Cliquez ou glissez une image ici
                </p>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-4)', fontSize: '0.72rem' }}>
                  JPG, PNG, WebP, GIF, SVG — max 10 Mo
                </p>
              </>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />

        <button className="ed-ctrl-btn ed-ctrl-del ed-ctrl-abs" onClick={handleDelete}>✕</button>
      </div>
    </NodeViewWrapper>
  )
}

export const SchemaExtension = Node.create({
  name: 'schema',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      url:      { default: '' },
      filename: { default: '' },
      mimeType: { default: '' },
    }
  },

  parseHTML() { return [{ tag: 'div[data-type="schema"]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'schema' })]
  },
  addNodeView() { return ReactNodeViewRenderer(SchemaView) },
})
