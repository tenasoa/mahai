'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SaveState } from './types'

interface Props {
  saveState: SaveState
  wordCount: number
  canSubmit: boolean
  lastSavedAt?: number | null
  onPreview: () => void
  onSubmit: () => void
  onRetrySave?: () => void
  isNewSubject: boolean
}

export default function EditorNavbar({
  saveState,
  wordCount,
  canSubmit,
  lastSavedAt,
  onPreview,
  onSubmit,
  onRetrySave,
  isNewSubject,
}: Props) {
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
        <SaveBadge state={saveState} lastSavedAt={lastSavedAt} onRetry={onRetrySave} />

        <span className="editor-word-count">{wordCount} mots</span>

        <button className="editor-btn" onClick={onPreview}>
          Prévisualiser
        </button>

        <button
          className="editor-btn editor-btn--primary"
          onClick={onSubmit}
          disabled={!canSubmit}
          title={canSubmit ? 'Soumettre pour vérification' : 'Complétez les champs obligatoires pour soumettre'}
        >
          Soumettre
        </button>
      </div>
    </nav>
  )
}

function SaveBadge({
  state,
  lastSavedAt,
  onRetry,
}: {
  state: SaveState
  lastSavedAt?: number | null
  onRetry?: () => void
}) {
  // Timer live pour "il y a X"
  const [, tick] = useState(0)
  useEffect(() => {
    if (state !== 'saved' || !lastSavedAt) return
    const interval = setInterval(() => tick(t => t + 1), 15_000)
    return () => clearInterval(interval)
  }, [state, lastSavedAt])

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
    return (
      <span className="editor-save-badge editor-save-badge--error">
        ✕ Erreur
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="editor-save-retry"
            title="Réessayer la sauvegarde"
          >
            ↻ Réessayer
          </button>
        )}
      </span>
    )
  }

  const label = lastSavedAt ? `● Sauvegardé ${formatRelative(lastSavedAt)}` : '● Sauvegardé'
  return <span className="editor-save-badge editor-save-badge--saved">{label}</span>
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts
  const s = Math.max(0, Math.floor(diff / 1000))
  if (s < 5)    return "à l'instant"
  if (s < 60)   return `il y a ${s} s`
  const m = Math.floor(s / 60)
  if (m < 60)   return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24)   return `il y a ${h} h`
  return `il y a ${Math.floor(h / 24)} j`
}
