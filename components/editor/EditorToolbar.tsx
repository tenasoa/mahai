'use client'

import type { Editor } from '@tiptap/react'

interface Props {
  editor: Editor | null
  onInsertMenu: (e: React.MouseEvent) => void
  onSymbols: (e: React.MouseEvent) => void
  onKaTeX: () => void
}

export default function EditorToolbar({ editor, onInsertMenu, onSymbols, onKaTeX }: Props) {
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
      {btn('B',  () => editor.chain().focus().toggleBold().run(),     editor.isActive('bold'),      'Gras')}
      {btn('I',  () => editor.chain().focus().toggleItalic().run(),   editor.isActive('italic'),    'Italique')}
      {btn('U',  () => editor.chain().focus().toggleUnderline().run(),editor.isActive('underline'), 'Souligné')}
      {btn('S̶', () => editor.chain().focus().toggleStrike().run(),    editor.isActive('strike'),    'Barré')}
      {btn('`',  () => editor.chain().focus().toggleCode().run(),     editor.isActive('code'),      'Code inline')}

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
        title="Formule mathématique"
      >
        ∑ Formule
      </button>

      <button
        className="editor-tb-btn editor-tb-btn--wide"
        onClick={onSymbols}
        title="Symboles mathématiques"
      >
        → Symboles
      </button>

      {sep('s4')}

      <button
        className="editor-tb-btn editor-tb-btn--wide"
        onClick={onInsertMenu}
        title="Insérer un bloc"
        style={{ color: 'var(--gold)', borderColor: 'var(--gold-line)' }}
      >
        ⊕ Insérer
      </button>
    </div>
  )
}
