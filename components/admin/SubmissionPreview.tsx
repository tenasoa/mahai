'use client'

import { useEffect, useMemo, useRef } from 'react'
import 'katex/dist/katex.min.css'
import '@/app/contributeur/sujets/editor.css'

interface JSONContent {
  type?: string
  content?: JSONContent[]
  text?: string
  marks?: Array<{
    type: string
    attrs?: Record<string, any>
  }>
  attrs?: Record<string, any>
}

interface SubmissionPreviewProps {
  content: JSONContent | null | undefined
  submission?: {
    title?: string
    matiere?: string
    examType?: string
    anneeScolaire?: string
    serie?: string
    filiere?: string
    duree?: string
    pages?: number
    coefficient?: number
    difficulte?: string
    description?: string
    prix?: number
    authorPrenom?: string
    authorNom?: string
  }
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

function getRomanNumeral(n: number): string {
  if (n >= 1 && n <= ROMAN_NUMERALS.length) return ROMAN_NUMERALS[n - 1]
  return String(n)
}

/**
 * Rend un nœud texte sous forme d'éléments React. Le texte (contenu fourni par
 * un contributeur) n'est JAMAIS interpolé dans du HTML brut : React échappe
 * automatiquement le contenu, ce qui empêche toute injection XSS.
 */
function renderTextNode(node: JSONContent): React.ReactNode {
  if (!node.text) return null
  let element: React.ReactNode = node.text

  if (node.marks) {
    node.marks.forEach(mark => {
      switch (mark.type) {
        case 'bold':
          element = <strong>{element}</strong>
          break
        case 'italic':
          element = <em>{element}</em>
          break
        case 'underline':
          element = <u>{element}</u>
          break
        case 'strike':
          element = <s>{element}</s>
          break
        case 'code':
          element = <code>{element}</code>
          break
        case 'highlight':
          element = <mark>{element}</mark>
          break
        case 'superscript':
          element = <sup>{element}</sup>
          break
        case 'subscript':
          element = <sub>{element}</sub>
          break
        case 'formula':
          element = <span className="formula-latex">{element}</span>
          break
      }
    })
  }

  return element
}

/** Composant KaTeX block — rendu dynamique côté client */
function KaTeXBlock({ latex }: { latex: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    if (!latex) {
      ref.current.innerHTML = '<span style="color:var(--text-4);font-style:italic">Formule vide</span>'
      return
    }
    let cancelled = false
    import('katex').then(katex => {
      if (cancelled || !ref.current) return
      try {
        katex.default.render(latex, ref.current, {
          displayMode: true,
          throwOnError: false,
          output: 'html',
        })
      } catch {
        if (ref.current) {
          ref.current.innerHTML = `<span style="color:var(--ruby)">${latex}</span>`
        }
      }
    })
    return () => { cancelled = true }
  }, [latex])

  return <div ref={ref} className="ed-formula-render" />
}

/** Composant KaTeX inline — rendu dynamique côté client */
function KaTeXInline({ latex }: { latex: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return
    if (!latex) {
      ref.current.innerHTML = '<span style="color:var(--text-4);font-style:italic;font-size:0.85em">∑ vide</span>'
      return
    }
    let cancelled = false
    import('katex').then(katex => {
      if (cancelled || !ref.current) return
      try {
        katex.default.render(latex, ref.current, {
          displayMode: false,
          throwOnError: false,
          output: 'html',
        })
      } catch {
        if (ref.current) {
          ref.current.innerHTML = `<span style="color:var(--ruby);font-family:var(--mono)">$${latex}$</span>`
        }
      }
    })
    return () => { cancelled = true }
  }, [latex])

  return <span ref={ref} className="ed-inline-math-render" style={{ display: 'inline-block' }} />
}

const ANNOTATION_META: Record<string, { icon: string; label: string; colorClass: string }> = {
  note:       { icon: '💡', label: 'Note',                colorClass: 'amber' },
  rappel:     { icon: '📗', label: 'Rappel de cours',     colorClass: 'sage'  },
  info:       { icon: 'ℹ',  label: 'Information',          colorClass: 'blue'  },
  attention:  { icon: '⚠',  label: 'Attention / Piège',   colorClass: 'ruby'  },
  definition: { icon: '📖', label: 'Définition',           colorClass: 'blue'  },
  theoreme:   { icon: '🔷', label: 'Théorème',             colorClass: 'sage'  },
  exemple:    { icon: '✏',  label: 'Exemple résolu',       colorClass: 'neutre'},
  correction: { icon: '✓',  label: 'Correction (masquée)', colorClass: 'sage'  },
  warning:    { icon: '⚠',  label: 'Attention',            colorClass: 'amber' },
  tip:        { icon: '💡', label: 'Conseil',              colorClass: 'sage'  },
  error:      { icon: '❌', label: 'Erreur',               colorClass: 'ruby'  },
}

function renderNode(node: JSONContent, index: number, counters: { partie: number; exercice: number; probleme: number; question: number }): React.ReactElement | null {
  if (!node) return null

  const nodeType = node.type || 'paragraph'

  switch (nodeType) {
    case 'partie': {
      counters.partie++
      counters.exercice = 0
      counters.probleme = 0
      counters.question = 0
      const num = node.attrs?.numero || getRomanNumeral(counters.partie)
      const titre = node.attrs?.titre || 'Partie'

      return (
        <div key={`partie-${index}`} className="ed-partie" data-type="partie">
          <div className="ed-partie-header">
            <span className="ed-partie-label">
              <span className="ed-bloc-num">{num}</span>
              <span className="ed-partie-title">{titre}</span>
            </span>
          </div>
          <div className="ed-partie-content">
            {node.content?.map((child, i) => renderNode(child, i, counters))}
          </div>
        </div>
      )
    }

    case 'exercice': {
      counters.exercice++
      counters.question = 0
      const exNum = node.attrs?.numero || counters.exercice
      const points = node.attrs?.points
      const hasPoints = node.attrs?.hasPoints !== false

      return (
        <div key={`exercice-${index}`} className="ed-exercice" data-type="exercice">
          <div className="ed-exercice-header">
            <span className="ed-exercice-label">
              <span className="ed-bloc-icon">✎</span>
              Exercice {exNum}
            </span>
            {hasPoints && points && (
              <span className="ed-exercice-points">{points} pts</span>
            )}
          </div>
          <div className="ed-exercice-content">
            {node.content?.map((child, i) => renderNode(child, i, counters))}
          </div>
        </div>
      )
    }

    case 'probleme': {
      counters.probleme++
      counters.question = 0
      const pNum = node.attrs?.numero || counters.probleme
      const points = node.attrs?.points
      const hasPoints = node.attrs?.hasPoints !== false

      return (
        <div key={`probleme-${index}`} className="ed-exercice" data-type="probleme" style={{ borderColor: 'var(--ruby)' }}>
          <div className="ed-exercice-header" style={{ borderColor: 'var(--ruby)' }}>
            <span className="ed-exercice-label" style={{ color: 'var(--ruby)' }}>
              <span className="ed-bloc-icon">P</span>
              Problème {pNum}
            </span>
            {hasPoints && points && (
              <span className="ed-exercice-points">{points} pts</span>
            )}
          </div>
          <div className="ed-exercice-content">
            {node.content?.map((child, i) => renderNode(child, i, counters))}
          </div>
        </div>
      )
    }

    case 'question': {
      counters.question++
      const qNum = node.attrs?.numero || counters.question

      return (
        <div key={`question-${index}`} className="ed-question" data-type="question">
          <span className="ed-question-num">{qNum}.</span>
          <div className="ed-question-content">
            {node.content?.map((child, i) => renderNode(child, i, counters))}
          </div>
        </div>
      )
    }

    case 'enonce': {
      return (
        <div key={`enonce-${index}`} className="ed-enonce" data-type="enonce">
          <span className="ed-enonce-label">Énoncé</span>
          <div className="ed-enonce-content">
            {node.content?.map((child, i) => renderNode(child, i, counters))}
          </div>
        </div>
      )
    }

    case 'annotation': {
      const noteType = (node.attrs?.type as string) || 'note'
      const meta = ANNOTATION_META[noteType] || ANNOTATION_META.note

      return (
        <div key={`annotation-${index}`} className={`ed-annotation ed-annotation--${meta.colorClass}`} data-type="annotation">
          <div className="ed-annotation-header">
            <span className="ed-annotation-icon">{meta.icon}</span>
            <span className="ed-annotation-label">{meta.label}</span>
          </div>
          <div className="ed-annotation-content">
            {node.content?.map((child, i) => renderNode(child, i, counters))}
          </div>
        </div>
      )
    }

    case 'formula': {
      const latex = node.attrs?.latex || ''
      return (
        <div key={`formula-${index}`} className="ed-formula" data-type="formula">
          <KaTeXBlock latex={latex} />
        </div>
      )
    }

    case 'inlineMath': {
      const latex = node.attrs?.latex || ''
      return <KaTeXInline key={`imath-${index}`} latex={latex} />
    }

    case 'schema': {
      const url = node.attrs?.url || ''
      const filename = node.attrs?.filename || 'Image'
      if (!url) return null
      return (
        <div key={`schema-${index}`} className="ed-schema" data-type="schema" style={{ textAlign: 'center', padding: '1rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={filename}
            style={{ maxWidth: '100%', maxHeight: '480px', borderRadius: '4px', display: 'block', margin: '0 auto' }}
          />
        </div>
      )
    }

    case 'paragraph': {
      const content = node.content?.map((child, i) => renderNode(child, i, counters))
      return (
        <p key={`p-${index}`}>
          {content?.length ? content : <br />}
        </p>
      )
    }

    case 'text': {
      return <span key={`text-${index}`}>{renderTextNode(node)}</span>
    }

    case 'heading': {
      const level = node.attrs?.level || 1
      const content = node.content?.map((child, i) => renderNode(child, i, counters))
      const headingContent = content?.length ? content : null

      if (level === 1) {
        return <h1 key={`h-${index}`}>{headingContent}</h1>
      } else if (level === 2) {
        return <h2 key={`h-${index}`}>{headingContent}</h2>
      } else if (level === 3) {
        return <h3 key={`h-${index}`}>{headingContent}</h3>
      } else if (level === 4) {
        return <h4 key={`h-${index}`}>{headingContent}</h4>
      } else if (level === 5) {
        return <h5 key={`h-${index}`}>{headingContent}</h5>
      } else {
        return <h6 key={`h-${index}`}>{headingContent}</h6>
      }
    }

    case 'bulletList': {
      return (
        <ul key={`ul-${index}`}>
          {node.content?.map((child, i) => renderNode(child, i, counters))}
        </ul>
      )
    }

    case 'orderedList': {
      return (
        <ol key={`ol-${index}`}>
          {node.content?.map((child, i) => renderNode(child, i, counters))}
        </ol>
      )
    }

    case 'listItem': {
      return (
        <li key={`li-${index}`}>
          {node.content?.map((child, i) => renderNode(child, i, counters))}
        </li>
      )
    }

    case 'blockquote': {
      return (
        <blockquote key={`bq-${index}`}>
          {node.content?.map((child, i) => renderNode(child, i, counters))}
        </blockquote>
      )
    }

    case 'codeBlock': {
      const content = node.content?.map((child) => child.text || '').join('')
      return (
        <pre key={`code-${index}`}>
          <code>{content}</code>
        </pre>
      )
    }

    case 'table': {
      return (
        <table key={`table-${index}`} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {node.content?.map((child, i) => renderNode(child, i, counters))}
          </tbody>
        </table>
      )
    }

    case 'tableRow': {
      return (
        <tr key={`tr-${index}`}>
          {node.content?.map((child, i) => renderNode(child, i, counters))}
        </tr>
      )
    }

    case 'tableHeader': {
      return (
        <th key={`th-${index}`} style={{ border: '1px solid var(--b2)', padding: '0.5rem', textAlign: 'left', fontWeight: 600 }}>
          {node.content?.map((child, i) => renderNode(child, i, counters))}
        </th>
      )
    }

    case 'tableCell': {
      return (
        <td key={`td-${index}`} style={{ border: '1px solid var(--b2)', padding: '0.5rem' }}>
          {node.content?.map((child, i) => renderNode(child, i, counters))}
        </td>
      )
    }

    case 'hardBreak': {
      return <br key={`br-${index}`} />
    }

    case 'horizontalRule': {
      return <hr key={`hr-${index}`} />
    }

    default:
      if (node.content) {
        return (
          <div key={`default-${index}`}>
            {node.content.map((child, i) => renderNode(child, i, counters))}
          </div>
        )
      }
      return null
  }
}

export function SubmissionPreview({ content, submission }: SubmissionPreviewProps) {
  const renderedContent = useMemo(() => {
    if (!content) return null

    const counters = { partie: 0, exercice: 0, probleme: 0, question: 0 }

    if (Array.isArray(content)) {
      return content.map((node, i) => renderNode(node, i, counters))
    }

    if (content.content) {
      return content.content.map((node, i) => renderNode(node, i, counters))
    }

    return renderNode(content, 0, counters)
  }, [content])

  if (!content) {
    return (
      <div className="ed-empty-guide">
        <p className="ed-empty-guide-title">Aucun contenu disponible pour ce sujet.</p>
      </div>
    )
  }

  return (
    <div className="editor-canvas" style={{ minHeight: 'auto', padding: '2rem' }}>
      <div className="ProseMirror">
        {renderedContent}
      </div>
    </div>
  )
}
