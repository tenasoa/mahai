'use client'

import { useState, useEffect, useRef } from 'react'
import type { Editor } from '@tiptap/react'

interface Props {
  editor: Editor | null
  onClose: () => void
  initialLatex?: string
  onInsert?: (latex: string) => void
}

const TABS = ['Algèbre', 'Analyse', 'Géométrie', 'Physique', 'Chimie']

const TEMPLATES: Record<string, Array<{ name: string; latex: string }>> = {
  'Algèbre': [
    { name: 'Fraction', latex: '\\frac{a}{b}' },
    { name: 'Puissance', latex: 'a^{n}' },
    { name: 'Racine', latex: '\\sqrt{x}' },
    { name: 'Racine n', latex: '\\sqrt[n]{x}' },
    { name: 'Somme', latex: '\\sum_{i=1}^{n} a_i' },
    { name: 'Produit', latex: '\\prod_{i=1}^{n} a_i' },
    { name: 'Matrice', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
    { name: 'Système', latex: '\\begin{cases} ax+by=c \\\\ dx+ey=f \\end{cases}' },
  ],
  'Analyse': [
    { name: 'Limite', latex: '\\lim_{x \\to +\\infty} f(x)' },
    { name: 'Dérivée', latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}" },
    { name: 'Intégrale', latex: '\\int_{a}^{b} f(x)\\,dx' },
    { name: 'Intégrale∞', latex: '\\int_{-\\infty}^{+\\infty} f(x)\\,dx' },
    { name: 'Suite', latex: 'u_{n+1} = f(u_n)' },
    { name: 'Gradient', latex: '\\nabla f = \\frac{\\partial f}{\\partial x}\\vec{i} + \\frac{\\partial f}{\\partial y}\\vec{j}' },
  ],
  'Géométrie': [
    { name: 'Vecteur', latex: '\\overrightarrow{AB}' },
    { name: 'Norme', latex: '\\|\\vec{v}\\|' },
    { name: 'Angle', latex: '\\angle ABC = 45°' },
    { name: 'Aire cercle', latex: 'A = \\pi r^2' },
    { name: 'Pythagore', latex: 'a^2 + b^2 = c^2' },
    { name: 'Volume', latex: 'V = \\frac{4}{3}\\pi r^3' },
  ],
  'Physique': [
    { name: 'Newton 2', latex: '\\vec{F} = m\\vec{a}' },
    { name: 'Énergie', latex: 'E = mc^2' },
    { name: 'Ohm', latex: 'U = R \\cdot I' },
    { name: 'Snell', latex: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2' },
    { name: 'Pendule', latex: 'T = 2\\pi\\sqrt{\\frac{L}{g}}' },
    { name: 'Coulomb', latex: 'F = k\\frac{q_1 q_2}{r^2}' },
  ],
  'Chimie': [
    { name: 'Concentration', latex: 'C = \\frac{n}{V}' },
    { name: 'pH', latex: 'pH = -\\log[H_3O^+]' },
    { name: 'Gaz parfait', latex: 'PV = nRT' },
    { name: 'Avancement', latex: '\\xi = \\frac{n_i - n}{\\nu_i}' },
    { name: 'Constante Ka', latex: 'K_a = \\frac{[A^-][H_3O^+]}{[HA]}' },
  ],
}

const QUICK_SYMBOLS = ['α', 'β', 'γ', 'δ', 'π', 'θ', 'λ', 'μ', 'σ', 'ω', 'Σ', '∞', '±', '≤', '≥', '≠', '≈', '∈', '∫', '∂', '√', '→']

export default function KaTeXModal({ editor, onClose, initialLatex = '', onInsert }: Props) {
  const [activeTab, setActiveTab] = useState('Algèbre')
  const [latex, setLatex] = useState(initialLatex)
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewError, setPreviewError] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!latex.trim()) {
      setPreviewHtml('')
      setPreviewError('')
      return
    }
    import('katex').then(katex => {
      try {
        const html = katex.default.renderToString(latex, {
          displayMode: true,
          throwOnError: true,
          output: 'html',
        })
        setPreviewHtml(html)
        setPreviewError('')
      } catch (err: any) {
        setPreviewHtml('')
        setPreviewError(err.message || 'Erreur KaTeX')
      }
    })
  }, [latex])

  const handleInsert = () => {
    if (!latex.trim()) return
    if (onInsert) {
      onInsert(latex)
    } else if (editor) {
      editor.chain().focus().insertContent({
        type: 'formula',
        attrs: { latex },
      }).run()
    }
    onClose()
  }

  const appendSymbol = (sym: string) => {
    setLatex(prev => prev + sym)
  }

  return (
    <div className="ed-katex-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="ed-katex-modal">
        <div className="ed-katex-modal-header">
          <span className="ed-katex-modal-title">Formule mathématique</span>
          <button className="editor-btn" onClick={onClose}>✕</button>
        </div>

        <div className="ed-katex-body">
          {/* Onglets */}
          <div className="ed-katex-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`ed-katex-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Templates */}
          <div className="ed-katex-templates">
            {(TEMPLATES[activeTab] || []).map(tpl => (
              <button
                key={tpl.name}
                className="ed-katex-tpl-btn"
                onClick={() => setLatex(tpl.latex)}
                title={tpl.latex}
              >
                <span className="ed-katex-tpl-name">{tpl.name}</span>
              </button>
            ))}
          </div>

          {/* Saisie LaTeX */}
          <div className="ed-katex-input-wrap">
            <label className="ed-label" style={{ display: 'block', marginBottom: '0.3rem' }}>LATEX</label>
            <input
              className="ed-katex-input"
              value={latex}
              onChange={e => setLatex(e.target.value)}
              placeholder="\frac{a}{b}"
              autoFocus
            />
          </div>

          {/* Aperçu */}
          <div className={`ed-katex-preview${previewError ? ' ed-katex-preview--error' : ''}`}>
            {previewError ? (
              <span className="ed-katex-preview-error">{previewError}</span>
            ) : previewHtml ? (
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <span style={{ color: 'var(--text-4)', fontStyle: 'italic', fontSize: '0.82rem' }}>
                Aperçu en temps réel
              </span>
            )}
          </div>

          {/* Symboles rapides */}
          <div className="ed-sym-section-label" style={{ marginBottom: '0.35rem' }}>Symboles rapides</div>
          <div className="ed-katex-symbols-grid">
            {QUICK_SYMBOLS.map(sym => (
              <button key={sym} className="ed-katex-sym-btn" onClick={() => appendSymbol(sym)}>
                {sym}
              </button>
            ))}
          </div>
        </div>

        <div className="ed-katex-footer">
          <button className="editor-btn" onClick={onClose}>Annuler</button>
          <button
            className="editor-btn editor-btn--primary"
            onClick={handleInsert}
            disabled={!latex.trim() || !!previewError}
          >
            Insérer
          </button>
        </div>
      </div>
    </div>
  )
}
