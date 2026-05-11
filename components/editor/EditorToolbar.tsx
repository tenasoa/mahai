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
      // data-tip = tooltip animé géré en CSS (cf. editor.css), title = fallback
      // a11y / mobile (le navigateur affiche un tooltip natif au long-press).
      data-tip={title || label}
      aria-label={title || label}
    >
      {label}
    </button>
  )

  // Headings : valeur sélectionnée d'après l'état courant du curseur.
  const currentHeading = editor.isActive('heading', { level: 1 })
    ? '1'
    : editor.isActive('heading', { level: 2 })
      ? '2'
      : editor.isActive('heading', { level: 3 })
        ? '3'
        : editor.isActive('heading', { level: 4 })
          ? '4'
          : 'p'

  const handleHeadingChange = (value: string) => {
    if (value === 'p') {
      editor.chain().focus().setParagraph().run()
    } else {
      const level = parseInt(value, 10) as 1 | 2 | 3 | 4
      editor.chain().focus().toggleHeading({ level }).run()
    }
  }

  // Couleurs rapides : highlight (mark Highlight de TipTap) + couleur texte.
  // L'extension Color officielle n'est pas installée — on passe par un
  // `<input type="color">` invisible et on utilise editor.chain().setColor()
  // si l'extension est disponible, sinon highlight seulement.
  const applyHighlight = () => {
    if (editor.isActive('highlight')) {
      editor.chain().focus().unsetHighlight().run()
    } else {
      editor.chain().focus().toggleHighlight().run()
    }
  }

  const toggleFocusMode = () => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('editor-focus-mode')
    }
  }

  const toggleFullscreen = () => {
    if (typeof document === 'undefined') return
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }

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
      {/* Style block — Paragraphe / Titres (remplace les 3 boutons H₂/H₃/H₄
          ci-dessous par un select compact, plus proche du mockup luxury). */}
      <select
        className="editor-tb-select"
        value={currentHeading}
        onChange={(e) => handleHeadingChange(e.target.value)}
        aria-label="Style du bloc"
        data-tip="Style"
      >
        <option value="p">Paragraphe</option>
        <option value="1">Titre 1</option>
        <option value="2">Titre 2</option>
        <option value="3">Titre 3</option>
        <option value="4">Titre 4</option>
      </select>

      {sep('s-style')}

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
          aria-label="Insérer un lien"
          data-tip="Insérer ou modifier un lien (⌘K)"
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
        aria-label="Retrait à gauche (Shift+Tab)"
        data-tip="Retrait à gauche (Shift+Tab)"
      >
        ⇤
      </button>
      <button
        className="editor-tb-btn"
        onClick={handleIndent}
        aria-label="Retrait à droite (Tab) ou Espaces"
        data-tip="Retrait à droite (Tab) ou Espaces"
      >
        ⇥
      </button>

      {sep('s3')}

      <button
        className="editor-tb-btn editor-tb-btn--wide"
        onClick={onKaTeX}
        aria-label="Insérer une formule en bloc"
        data-tip="Formule mathématique (bloc centré)"
      >
        ∑ Formule
      </button>

      {onKaTeXInline && (
        <button
          className="editor-tb-btn editor-tb-btn--wide"
          onClick={onKaTeXInline}
          aria-label="Insérer une formule inline"
          data-tip="Formule inline ($x^2$ dans le texte) — Mod+M"
        >
          $ Inline
        </button>
      )}

      <button
        className="editor-tb-btn editor-tb-btn--wide"
        onClick={onSymbols}
        aria-label="Insérer un symbole"
        data-tip="Symboles mathématiques"
      >
        → Symboles
      </button>

      {sep('s4')}

      <button
        className="editor-tb-btn editor-tb-btn--wide"
        onClick={onInsertMenu}
        aria-label="Insérer un bloc structuré"
        data-tip="Insérer un bloc"
        style={{ color: 'var(--gold)', borderColor: 'var(--gold-line)' }}
      >
        ⊕ Insérer
      </button>

      {sep('s5')}

      {btn('🖍', applyHighlight, editor.isActive('highlight'), 'Surligneur (jaune)')}

      {sep('s6')}

      {btn('▭', () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), false, 'Insérer un tableau 3×3')}
      {btn('―', () => editor.chain().focus().setHorizontalRule().run(), false, 'Séparateur horizontal')}
      {btn('«»', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), 'Citation')}
      {btn('</>', () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive('codeBlock'), 'Bloc de code')}

      {sep('s7')}

      {/* Modes de vue : focus (cache distractions) + fullscreen (canvas plein écran).
          Inspirés du mockup widgets/mah-ai-rich-editor.html (boutons en fin de toolbar). */}
      {btn('⊙', toggleFocusMode, false, 'Mode focus (Mod+.)')}
      {btn('⛶', toggleFullscreen, false, 'Plein écran')}
    </div>
  )
}
