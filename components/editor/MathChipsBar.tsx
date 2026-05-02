'use client'

/**
 * MathChipsBar — barre de chips de formules rapides positionnée juste sous
 * la toolbar principale. Inspiré de widgets/mah-ai-rich-editor.html (`.math-toolbar`).
 *
 * Chaque chip insère un node `inlineMath` avec le LaTeX correspondant
 * (réutilise la commande `setInlineMath` de l'extension). Le chip "Bloc"
 * ouvre la modale KaTeX en mode bloc (formula classique).
 */

import type { Editor } from '@tiptap/react'

interface Props {
  editor: Editor | null
  /** Ouvre la KaTeXModal en mode bloc (équivaut au bouton ∑ Formule). */
  onOpenBlockModal?: () => void
}

const QUICK_FORMULAS: Array<{ label: string; latex: string; tip: string }> = [
  { label: 'a/b',          latex: '\\frac{a}{b}',                tip: 'Fraction' },
  { label: '√x',           latex: '\\sqrt{x}',                   tip: 'Racine carrée' },
  { label: 'x²',           latex: 'x^{2}',                       tip: 'Puissance' },
  { label: '∫ dx',         latex: '\\int_{a}^{b} f(x)\\,dx',     tip: 'Intégrale définie' },
  { label: 'Σ',            latex: '\\sum_{i=1}^{n} x_{i}',       tip: 'Somme' },
  { label: 'lim',          latex: '\\lim_{x \\to \\infty}',       tip: 'Limite' },
  { label: '→AB',          latex: '\\overrightarrow{AB}',        tip: 'Vecteur' },
  { label: 'Δ = b²−4ac',   latex: '\\Delta = b^{2} - 4ac',       tip: 'Discriminant' },
  { label: 'f′(x)',        latex: "f'(x)",                       tip: 'Dérivée' },
]

export default function MathChipsBar({ editor, onOpenBlockModal }: Props) {
  if (!editor) return null

  const insert = (latex: string) => {
    editor.chain().focus().setInlineMath(latex).run()
  }

  return (
    <div className="editor-math-bar" role="toolbar" aria-label="Formules mathématiques rapides">
      <span className="editor-math-bar-label">∑ Formules</span>
      {QUICK_FORMULAS.map((f) => (
        <button
          key={f.label}
          type="button"
          className="editor-math-chip"
          onClick={() => insert(f.latex)}
          title={f.tip}
          data-tip={f.tip}
        >
          {f.label}
        </button>
      ))}
      {onOpenBlockModal && (
        <button
          type="button"
          className="editor-math-chip editor-math-chip--block"
          onClick={onOpenBlockModal}
          title="Insérer une formule en bloc centré"
          data-tip="Bloc formule"
        >
          Bloc formule +
        </button>
      )}
    </div>
  )
}
