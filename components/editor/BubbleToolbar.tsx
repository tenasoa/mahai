'use client'

/**
 * BubbleToolbar — barre flottante apparaissant sur toute sélection de texte.
 *
 * Contient les marks contextuels les plus fréquents : B / I / U / S,
 * indice/exposant, lien, formule inline.
 * Les nodes-atom (formula, inlineMath, schema…) et les sélections vides
 * ne déclenchent pas l'affichage.
 */

import { type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'

interface Props {
  editor: Editor | null
  onLink: () => void
  onKaTeXInline: () => void
}

export default function BubbleToolbar({ editor, onLink, onKaTeXInline }: Props) {
  if (!editor) return null

  const btn = (
    label: string,
    action: () => void,
    active: boolean,
    title: string,
  ) => (
    <button
      key={label}
      className={`ed-bubble-btn${active ? ' active' : ''}`}
      onClick={action}
      title={title}
      aria-label={title}
      aria-pressed={active}
      type="button"
    >
      {label}
    </button>
  )

  const sep = <div className="ed-bubble-sep" />

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: 'top' }}
      shouldShow={(props: any) => {
        const { editor: ed, state } = props
        const { selection } = state
        // Pas de sélection vide
        if (selection.empty) return false
        // Pas si on est dans un node atom ou dans un block spécifique
        if (
          ed.isActive('inlineMath') ||
          ed.isActive('formula') ||
          ed.isActive('schema')
        ) return false
        return true
      }}
    >
      <div className="ed-bubble-toolbar" role="toolbar" aria-label="Mise en forme">
        {btn('B',  () => editor.chain().focus().toggleBold().run(),      editor.isActive('bold'),      'Gras (⌘B)')}
        {btn('I',  () => editor.chain().focus().toggleItalic().run(),    editor.isActive('italic'),    'Italique (⌘I)')}
        {btn('U',  () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'), 'Souligné (⌘U)')}
        {btn('S̶', () => editor.chain().focus().toggleStrike().run(),    editor.isActive('strike'),    'Barré')}

        {sep}

        {btn('X₂', () => editor.chain().focus().toggleSubscript().run(),   editor.isActive('subscript'),   'Indice')}
        {btn('X²', () => editor.chain().focus().toggleSuperscript().run(), editor.isActive('superscript'), 'Exposant')}

        {sep}

        <button
          className={`ed-bubble-btn${editor.isActive('link') ? ' active' : ''}`}
          onClick={onLink}
          title="Lien (⌘K)"
          aria-label="Insérer ou modifier un lien"
          type="button"
        >
          🔗
        </button>

        <button
          className="ed-bubble-btn"
          onClick={onKaTeXInline}
          title="Formule inline (⌘M)"
          aria-label="Insérer une formule inline"
          type="button"
        >
          $∑
        </button>
      </div>
    </BubbleMenu>
  )
}
