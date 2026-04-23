'use client'

import Link from 'next/link'
import { SaveState } from './types'

interface Props {
  saveState: SaveState
  wordCount: number
  canSubmit: boolean
  onPreview: () => void
  onSubmit: () => void
  isNewSubject: boolean
}

export default function EditorNavbar({ saveState, wordCount, canSubmit, onPreview, onSubmit, isNewSubject }: Props) {
  return (
    <nav className="editor-navbar">
      <Link href="/contributeur" className="editor-nav-logo">
        Mah<span className="editor-nav-gem" />AI
      </Link>

      <div className="editor-nav-breadcrumb">
        <Link href="/contributeur/sujets">Mes sujets</Link>
        <span>›</span>
        {isNewSubject ? 'Nouveau sujet' : 'Modifier le sujet'}
      </div>

      <div className="editor-nav-center" />

      <div className="editor-nav-right">
        <SaveBadge state={saveState} />

        <span className="editor-word-count">{wordCount} mots</span>

        <button className="editor-btn" onClick={onPreview}>
          Prévisualiser
        </button>

        <button
          className="editor-btn editor-btn--primary"
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          Soumettre
        </button>
      </div>
    </nav>
  )
}

function SaveBadge({ state }: { state: SaveState }) {
  if (state === 'idle') return null

  if (state === 'saving') {
    return (
      <span className="editor-save-badge editor-save-badge--saving">
        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>◌</span>
        Sauvegarde…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </span>
    )
  }

  if (state === 'error') {
    return <span className="editor-save-badge editor-save-badge--error">✕ Erreur</span>
  }

  return <span className="editor-save-badge editor-save-badge--saved">● Sauvegardé</span>
}
