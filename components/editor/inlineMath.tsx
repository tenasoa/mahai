'use client'

/**
 * InlineMathExtension — formules KaTeX dans une phrase / un paragraphe.
 *
 * Type : node atom inline (group: 'inline', atom: true). Pas un mark, car un
 * mark ne peut pas remplacer le rendu — on a besoin d'un NodeView qui rend
 * KaTeX au lieu du texte source.
 *
 * Saisie :
 *   - taper `$x^2$` puis n'importe quel caractère → InputRule transforme
 *     en node `inlineMath{ latex: 'x^2' }`
 *   - coller du Markdown contenant `$...$` → PasteRule fait pareil
 *   - Mod-M ouvre la modale KaTeX en mode inline (insert ou édition)
 *   - cliquer sur un node existant → événement `mahai:inline-math:edit`
 *     écouté par l'EditorClient pour ouvrir la modale en édition
 *
 * Sérialisation HTML : `<span data-inline-math data-latex="x^2">$x^2$</span>`.
 * Le texte `$latex$` à l'intérieur permet le copy-paste vers d'autres outils
 * sans perdre la formule.
 */

import { Node, mergeAttributes, InputRule, PasteRule } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { useEffect, useRef } from 'react'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineMath: {
      setInlineMath: (latex: string) => ReturnType
      updateInlineMathLatex: (latex: string) => ReturnType
    }
  }
}

/** Émet un événement custom : l'EditorClient ouvre la modale inline. */
function emitEdit(detail: { latex: string; pos: number | null }) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('mahai:inline-math:edit', { detail }))
}

function InlineMathView({ node, selected, getPos }: any) {
  const ref = useRef<HTMLSpanElement>(null)
  const latex = node.attrs.latex || ''

  useEffect(() => {
    if (!ref.current) return
    if (!latex.trim()) {
      ref.current.innerHTML =
        '<span style="color:var(--text-4);font-style:italic;font-family:var(--mono,monospace);font-size:0.85em">∑ vide</span>'
      return
    }
    let cancelled = false
    import('katex').then((katex) => {
      if (cancelled || !ref.current) return
      try {
        katex.default.render(latex, ref.current, {
          displayMode: false,
          throwOnError: false,
          output: 'html',
          // KaTeX ajoute par défaut un wrapper .katex en inline-block ; OK pour nous.
        })
      } catch {
        if (ref.current) {
          ref.current.innerHTML = `<span style="color:var(--ruby,#e05575);font-family:var(--mono,monospace)">$${latex}$</span>`
        }
      }
    })
    return () => {
      cancelled = true
    }
  }, [latex])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const pos = typeof getPos === 'function' ? getPos() : null
    emitEdit({ latex, pos })
  }

  return (
    <NodeViewWrapper
      as="span"
      className={`ed-inline-math${selected ? ' ed-inline-math-selected' : ''}`}
      data-type="inline-math"
      onClick={handleClick}
      title="Cliquer pour modifier la formule"
    >
      <span ref={ref} className="ed-inline-math-render" />
    </NodeViewWrapper>
  )
}

export const InlineMathExtension = Node.create({
  name: 'inlineMath',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      latex: { default: '' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-inline-math]',
        getAttrs: (el) => ({
          latex:
            (el as HTMLElement).getAttribute('data-latex') ||
            ((el as HTMLElement).textContent || '').replace(/^\$|\$$/g, ''),
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const latex = node.attrs.latex || ''
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-inline-math': '',
        'data-latex': latex,
      }),
      `$${latex}$`,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineMathView)
  },

  // Saisie en direct : `$...$<char>` → node. Le `?` rend le quantificateur
  // non-greedy pour éviter de capturer trop loin sur `$a$ et $b$`.
  addInputRules() {
    return [
      new InputRule({
        find: /\$([^$\n]+?)\$$/,
        handler: ({ range, match, chain }) => {
          const latex = (match[1] || '').trim()
          if (!latex) return null
          chain()
            .deleteRange(range)
            .insertContent({ type: 'inlineMath', attrs: { latex } })
            .run()
        },
      }),
    ]
  },

  // Coller depuis Markdown : on transforme tous les `$...$` en nodes inline.
  // /g pour matcher tous les passages dans le texte collé.
  addPasteRules() {
    return [
      new PasteRule({
        find: /\$([^$\n]+?)\$/g,
        handler: ({ range, match, chain }) => {
          const latex = (match[1] || '').trim()
          if (!latex) return null
          chain()
            .deleteRange(range)
            .insertContent({ type: 'inlineMath', attrs: { latex } })
            .run()
        },
      }),
    ]
  },

  addCommands() {
    return {
      setInlineMath:
        (latex: string) =>
        ({ chain }) => {
          if (!latex.trim()) return false
          return chain()
            .insertContent({ type: 'inlineMath', attrs: { latex } })
            .run()
        },
      updateInlineMathLatex:
        (latex: string) =>
        ({ commands }) => {
          if (!latex.trim()) return false
          return commands.updateAttributes('inlineMath', { latex })
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-m': () => {
        // Ouvre la modale en mode inline pour insérer (ou éditer si la
        // sélection est sur un node inlineMath).
        emitEdit({ latex: '', pos: null })
        return true
      },
    }
  },
})
