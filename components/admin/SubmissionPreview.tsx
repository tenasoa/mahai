'use client'

import { useMemo } from 'react'
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

function renderText(node: JSONContent): string {
  if (!node.text) return ''
  let text = node.text

  if (node.marks) {
    node.marks.forEach(mark => {
      switch (mark.type) {
        case 'bold':
          text = `<strong>${text}</strong>`
          break
        case 'italic':
          text = `<em>${text}</em>`
          break
        case 'underline':
          text = `<u>${text}</u>`
          break
        case 'strike':
          text = `<s>${text}</s>`
          break
        case 'code':
          text = `<code>${text}</code>`
          break
        case 'highlight':
          text = `<mark>${text}</mark>`
          break
        case 'superscript':
          text = `<sup>${text}</sup>`
          break
        case 'subscript':
          text = `<sub>${text}</sub>`
          break
        case 'formula':
          text = `<span class="formula-latex">${text}</span>`
          break
      }
    })
  }

  return text
}

function renderNode(node: JSONContent, index: number, counters: { partie: number; exercice: number; question: number }): React.ReactElement | null {
  if (!node) return null

  const nodeType = node.type || 'paragraph'

  switch (nodeType) {
    case 'partie': {
      counters.partie++
      counters.exercice = 0
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
      const noteType = (node.attrs?.type as string) || 'info'
      const noteLabel = node.attrs?.label || 'Note'
      const typeClassMap: Record<string, string> = {
        'info': 'ed-annotation--blue',
        'warning': 'ed-annotation--amber',
        'tip': 'ed-annotation--sage',
        'error': 'ed-annotation--ruby',
        'neutre': 'ed-annotation--neutre'
      }
      const typeClass = typeClassMap[noteType] || 'ed-annotation--neutre'

      return (
        <div key={`annotation-${index}`} className={`ed-annotation ${typeClass}`} data-type="annotation">
          <div className="ed-annotation-header">
            <span className="ed-annotation-label">{noteLabel}</span>
          </div>
          <div className="ed-annotation-content">
            {node.content?.map((child, i) => renderNode(child, i, counters))}
          </div>
        </div>
      )
    }

    case 'formula': {
      return (
        <div key={`formula-${index}`} className="ed-formula" data-type="formula">
          <div className="ed-formula-render">
            {node.content?.map((child, i) => renderNode(child, i, counters))}
          </div>
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
      const html = renderText(node)
      return <span key={`text-${index}`} dangerouslySetInnerHTML={{ __html: html }} />
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

    const counters = { partie: 0, exercice: 0, question: 0 }

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
