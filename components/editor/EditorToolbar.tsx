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
  // onMore n'est plus utilisé car on affiche tout inline
}

export default function EditorToolbar({
  editor,
  onInsertMenu,
  onSymbols,
  onKaTeX,
  onKaTeXInline,
  onLink,
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

  const canIndentList = editor.can().sinkListItem('listItem')
  const canOutdentList = editor.can().liftListItem('listItem')

  const handleIndent = () => {
    if (canIndentList) {
      editor.chain().focus().sinkListItem('listItem').run()
    } else {
      editor.chain().focus().insertContent('    ').run()
    }
  }

  const handleOutdent = () => {
    if (canOutdentList) {
      editor.chain().focus().liftListItem('listItem').run()
    }
  }

  return (
    <div className="editor-toolbar" style={{ flexWrap: 'wrap', gap: '4px' }}>
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
        className={`editor-tb-btn${!canOutdentList && !editor.isActive('paragraph') ? ' disabled' : ''}`}
        onClick={handleOutdent}
        title="Retrait à gauche (Shift+Tab)"
      >
        ⇤
      </button>
      <button
        className="editor-tb-btn"
        onClick={handleIndent}
        title="Retrait à droite (Tab) ou Espaces"
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

      {sep('s5')}

      {btn('H₂', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), 'Titre 2 (⌘⇧2)')}
      {btn('H₃', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }), 'Titre 3 (⌘⇧3)')}
      {btn('H₄', () => editor.chain().focus().toggleHeading({ level: 4 }).run(), editor.isActive('heading', { level: 4 }), 'Titre 4 (⌘⇧4)')}

      {sep('s6')}

      {btn('▭', () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), false, 'Insérer un tableau 3×3')}
      {btn('―', () => editor.chain().focus().setHorizontalRule().run(), false, 'Séparateur horizontal')}
      {btn('«»', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), 'Citation')}
      {btn('</>', () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive('codeBlock'), 'Bloc de code')}
    </div>
  )
}
