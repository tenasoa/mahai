'use client'

/**
 * LinkPopover — petit popover pour ajouter ou modifier un lien.
 *
 * Affiché sous le bouton 🔗 de la toolbar (et plus tard depuis le bubble
 * menu sur sélection). Si du texte est sélectionné, le lien est appliqué
 * dessus ; sinon, on insère le label saisi avec le lien.
 */

import { useEffect, useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'

interface Props {
  editor: Editor | null
  position: { top: number; left: number }
  onClose: () => void
}

export default function LinkPopover({ editor, position, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Pré-remplit avec l'URL existante si curseur dans un lien
  const existingUrl =
    (editor?.getAttributes('link') as { href?: string } | undefined)?.href || ''

  const [url, setUrl] = useState(existingUrl)
  const [label, setLabel] = useState('')

  // Si pas de sélection, on demande aussi un label à insérer
  const hasSelection = editor
    ? !editor.state.selection.empty
    : false

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const apply = () => {
    if (!editor) return onClose()
    const trimmed = url.trim()
    if (!trimmed) {
      // URL vide → on retire le lien si présent
      editor.chain().focus().unsetLink().run()
      onClose()
      return
    }

    // Préfixe automatique si l'utilisateur n'a pas mis http(s):// ni mailto:
    const href = /^(https?:|mailto:)/i.test(trimmed) ? trimmed : `https://${trimmed}`

    if (hasSelection) {
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    } else {
      const text = label.trim() || href
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text,
          marks: [{ type: 'link', attrs: { href } }],
        })
        .run()
    }
    onClose()
  }

  const remove = () => {
    if (!editor) return onClose()
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    onClose()
  }

  return (
    <div
      ref={ref}
      className="ed-link-popover"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 60,
      }}
    >
      <label className="ed-label" htmlFor="ed-link-url">URL</label>
      <input
        id="ed-link-url"
        ref={inputRef}
        className="ed-link-input"
        type="url"
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault()
            apply()
          }
        }}
        placeholder="https://exemple.com"
        autoComplete="url"
      />

      {!hasSelection && (
        <>
          <label className="ed-label" htmlFor="ed-link-label" style={{ marginTop: '0.5rem' }}>
            Texte affiché (optionnel)
          </label>
          <input
            id="ed-link-label"
            className="ed-link-input"
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                apply()
              }
            }}
            placeholder="Si vide, on affiche l'URL"
          />
        </>
      )}

      <div className="ed-link-actions">
        {existingUrl && (
          <button
            type="button"
            className="editor-btn"
            onClick={remove}
            style={{ color: 'var(--ruby, #e05575)' }}
          >
            Retirer
          </button>
        )}
        <button type="button" className="editor-btn" onClick={onClose}>
          Annuler
        </button>
        <button
          type="button"
          className="editor-btn editor-btn--primary"
          onClick={apply}
          disabled={!url.trim() && !existingUrl}
        >
          {existingUrl ? 'Mettre à jour' : 'Insérer'}
        </button>
      </div>
    </div>
  )
}
