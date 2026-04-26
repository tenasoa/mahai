'use client'

/**
 * MoreMenu — dropdown « Plus… » de la toolbar de l'éditeur.
 *
 * Regroupe les actions secondaires pour ne pas surcharger la barre
 * principale : titres (H2/H3/H4), tableau, séparateur horizontal,
 * citation, bloc de code.
 *
 * Position : ancré sous le bouton « ⋯ Plus » (passe par la prop `position`
 * comme `InsertMenu` / `SymbolsDropdown`).
 */

import { useEffect, useRef } from 'react'
import type { Editor } from '@tiptap/react'

interface Props {
  editor: Editor | null
  position: { top: number; left: number }
  onClose: () => void
}

export default function MoreMenu({ editor, position, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Click outside / Escape pour fermer
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

  if (!editor) return null

  // Petit helper pour exécuter une action puis fermer le menu
  const run = (fn: () => void) => () => {
    fn()
    onClose()
  }

  const insertTable = () =>
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()

  return (
    <div
      ref={ref}
      className="ed-more-menu"
      role="menu"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 60,
      }}
    >
      <div className="ed-more-menu-section">
        <div className="ed-more-menu-section-label">Titres</div>
        <button
          role="menuitem"
          className={`ed-more-menu-item${editor.isActive('heading', { level: 2 }) ? ' active' : ''}`}
          onClick={run(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        >
          <span className="ed-more-menu-icon">H₂</span>
          <span>Titre 2</span>
          <span className="ed-more-menu-kbd">⌘⇧2</span>
        </button>
        <button
          role="menuitem"
          className={`ed-more-menu-item${editor.isActive('heading', { level: 3 }) ? ' active' : ''}`}
          onClick={run(() => editor.chain().focus().toggleHeading({ level: 3 }).run())}
        >
          <span className="ed-more-menu-icon">H₃</span>
          <span>Titre 3</span>
          <span className="ed-more-menu-kbd">⌘⇧3</span>
        </button>
        <button
          role="menuitem"
          className={`ed-more-menu-item${editor.isActive('heading', { level: 4 }) ? ' active' : ''}`}
          onClick={run(() => editor.chain().focus().toggleHeading({ level: 4 }).run())}
        >
          <span className="ed-more-menu-icon">H₄</span>
          <span>Titre 4</span>
          <span className="ed-more-menu-kbd">⌘⇧4</span>
        </button>
      </div>

      <div className="ed-more-menu-sep" />

      <div className="ed-more-menu-section">
        <div className="ed-more-menu-section-label">Blocs</div>
        <button
          role="menuitem"
          className="ed-more-menu-item"
          onClick={run(insertTable)}
          title="Insérer un tableau 3×3"
        >
          <span className="ed-more-menu-icon">▭</span>
          <span>Tableau 3×3</span>
        </button>
        <button
          role="menuitem"
          className="ed-more-menu-item"
          onClick={run(() => editor.chain().focus().setHorizontalRule().run())}
          title="Séparateur horizontal"
        >
          <span className="ed-more-menu-icon">―</span>
          <span>Séparateur</span>
        </button>
        <button
          role="menuitem"
          className={`ed-more-menu-item${editor.isActive('blockquote') ? ' active' : ''}`}
          onClick={run(() => editor.chain().focus().toggleBlockquote().run())}
          title="Citation"
        >
          <span className="ed-more-menu-icon">&laquo;&nbsp;&raquo;</span>
          <span>Citation</span>
        </button>
        <button
          role="menuitem"
          className={`ed-more-menu-item${editor.isActive('codeBlock') ? ' active' : ''}`}
          onClick={run(() => editor.chain().focus().toggleCodeBlock().run())}
          title="Bloc de code"
        >
          <span className="ed-more-menu-icon">{'</>'}</span>
          <span>Bloc de code</span>
        </button>
      </div>
    </div>
  )
}
