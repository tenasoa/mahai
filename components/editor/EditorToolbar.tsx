'use client'

import type { Editor } from '@tiptap/react'

interface Props {
  editor: Editor | null
  onInsertMenu: (e: React.MouseEvent) => void
  onSymbols: (e: React.MouseEvent) => void
  onKaTeX: () => void
  /** Ouvre la modale KaTeX en mode inline (formule au sein d'un paragraphe). */
  onKaTeXInline?: () => void
  /** Ouvre le popover « lien » ancré sur le bouton cliqué. */
  onLink?: (e: React.MouseEvent) => void
  /** Ouvre le menu « ⋯ Plus » ancré sur le bouton cliqué. */
  onMore?: (e: React.MouseEvent) => void
}

export default function EditorToolbar({
  editor,
  onInsertMenu,
  onSymbols,
  onKaTeX,
  onKaTeXInline,
  onLink,
  onMore,
}: Props) {
  if (!editor) return <div className="editor-toolbar" />

  const btn = (
    label: string,
    action: () => void,
    isActive = false,
    title?: string,
    wide = false,
  ) => (
    <button
      key={label}
      className={`editor-tb-btn${isActive ? ' active' : ''}${wide ? ' editor-tb-btn--wide' : ''}`}
      onClick={action}
      title={title || label}
    >
      {label}
    </button>
  )

  const sep = (key: string) => <div key={key} className="editor-toolbar-sep" />

  // Indent / outdent — uniquement dans une liste pour l'instant
  const canIndent = editor.can().sinkListItem('listItem')
  const canOutdent = editor.can().liftListItem('listItem')

  return (
    <div className="editor-toolbar">
      {btn('B',  () => editor.chain().focus().toggleBold().run(),     editor.isActive('bold'),      'Gras (⌘B)')}
      {btn('I',  () => editor.chain().focus().toggleItalic().run(),   editor.isActive('italic'),    'Italique (⌘I)')}
      {btn('U',  () => editor.chain().focus().toggleUnderline().run(),editor.isActive('underline'), 'Souligné (⌘U)')}
      {btn('S̶', () => editor.chain().focus().toggleStrike().run(),    editor.isActive('strike'),    'Barré')}
      {btn('`',  () => editor.chain().focus().toggleCode().run(),     editor.isActive('code'),      'Code inline')}

      {sep('s-script')}

      {btn('X₂', () => editor.chain().focus().toggleSubscript().run(),   editor.isActive('subscript'),   'Indice (⌘,)')}
      {btn('X²', () => editor.chain().focus().toggleSuperscript().run(), editor.isActive('superscript'), 'Exposant (⌘.)')}

      {onLink && (
        <button
          className={`editor-tb-btn${editor.isActive('link') ? ' active' : ''}`}
          onClick={onLink}
          title="Insérer ou modifier un lien (⌘K)"
          aria-label="Insérer un lien"
        >
          🔗
        </button>
      )}

      {sep('s1')}

      {btn('≡L', () => editor.chain().focus().setTextAlign('left').run(),   editor.isActive({ textAlign: 'left'   }), 'Aligner à gauche')}
      {btn('≡C', () => editor.chain().focus().setTextAlign('center').run(), editor.isActive({ textAlign: 'center' }), 'Centrer')}
      {btn('≡R', () => editor.chain().focus().setTextAlign('right').run(),  editor.isActive({ textAlign: 'right'  }), 'Aligner à droite')}

      {sep('s2')}

      {btn('•',  () => editor.chain().focus().toggleBulletList().run(),  editor.isActive('bulletList'),  'Liste à puces')}
      {btn('1.', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), 'Liste numérotée')}

      {/* Indent / Outdent */}
      <button
        className={`editor-tb-btn${!canOutdent ? ' disabled' : ''}`}
        onClick={() => editor.chain().focus().liftListItem('listItem').run()}
        disabled={!canOutdent}
        title="Retrait à gauche (Shift+Tab)"
      >
        ⇤
      </button>
      <button
        className={`editor-tb-btn${!canIndent ? ' disabled' : ''}`}
        onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
        disabled={!canIndent}
        title="Retrait à droite (Tab)"
      >
        ⇥
      </button>

      {sep('s3')}

      <button
        className="editor-tb-btn editor-tb-btn--wide"
        onClick={onKaTeX}
        title="Formule mathématique (bloc centré)"
        aria-label="Insérer une formule en bloc"
      >
        ∑ Formule
      </button>

      {onKaTeXInline && (
        <button
          className="editor-tb-btn editor-tb-btn--wide"
          onClick={onKaTeXInline}
          title="Formule inline ($x^2$ dans le texte) — Mod+M"
          aria-label="Insérer une formule inline"
        >
          $ Inline
        </button>
      )}

      <button
        className="editor-tb-btn editor-tb-btn--wide"
        onClick={onSymbols}
        title="Symboles mathématiques"
        aria-label="Insérer un symbole"
      >
        → Symboles
      </button>

      {sep('s4')}

      <button
        className="editor-tb-btn editor-tb-btn--wide"
        onClick={onInsertMenu}
        title="Insérer un bloc"
        aria-label="Insérer un bloc structuré"
        style={{ color: 'var(--gold)', borderColor: 'var(--gold-line)' }}
      >
        ⊕ Insérer
      </button>

      {onMore && (
        <button
          className="editor-tb-btn"
          onClick={onMore}
          title="Plus d'options : titres, tableau, séparateur, citation, code"
          aria-label="Plus d'options"
          aria-haspopup="menu"
        >
          ⋯
        </button>
      )}
    </div>
  )
}
