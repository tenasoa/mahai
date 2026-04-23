'use client'

import { useEffect, useRef } from 'react'
import type { Editor } from '@tiptap/react'

interface Props {
  editor: Editor | null
  position: { top: number; left: number }
  onClose: () => void
}

const SYMBOLS = {
  'Lettres grecques': ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Λ', 'Μ', 'Π', 'Σ', 'Φ', 'Ψ', 'Ω'],
  'Opérateurs': ['∑', '∏', '∫', '∂', '∇', '∞', '±', '×', '÷', '≠', '≤', '≥', '≈', '∈', '∉', '⊂', '⊃', '∪', '∩', '√', '∝', '∀', '∃'],
  'Physique / Chimie': ['→', '⇌', '⇒', '⊕', '⊗', '°', '℃', 'Ω', 'μ', 'ħ', 'ℏ', '⟶', '⟵', '⟷', '⁺', '⁻', '²', '³'],
}

export default function SymbolsDropdown({ editor, position, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const insertSymbol = (sym: string) => {
    if (!editor) return
    editor.chain().focus().insertContent(sym).run()
  }

  const style: React.CSSProperties = {
    top: position.top,
    left: Math.min(position.left, window.innerWidth - 340),
  }

  return (
    <div ref={ref} className="ed-symbols-dropdown" style={style}>
      {Object.entries(SYMBOLS).map(([section, syms]) => (
        <div key={section}>
          <div className="ed-sym-section-label">{section}</div>
          <div className="ed-sym-grid">
            {syms.map(sym => (
              <button
                key={sym}
                className="ed-sym-btn"
                onClick={() => insertSymbol(sym)}
                title={sym}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
