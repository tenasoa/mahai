'use client'

import { useEffect, useRef } from 'react'
import type { Editor } from '@tiptap/react'
import { STRUCTURE_BLOCS, ANNOTATION_TYPES, MEDIA_BLOCS } from './types'

interface Props {
  editor: Editor | null
  position: { top: number; left: number }
  onClose: () => void
  onOpenKaTeX: () => void
}

const COLOR_MAP: Record<string, string> = {
  violet: 'violet',
  gold: 'gold',
  neutre: 'neutre',
  amber: 'amber',
  sage: 'sage',
  ruby: 'ruby',
  blue: 'blue',
}

export default function InsertMenu({ editor, position, onClose, onOpenKaTeX }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const insertStructure = (type: string) => {
    if (!editor) return
    onClose()

    if (type === 'partie') {
      editor.chain().focus().insertContent({
        type: 'partie',
        attrs: { numero: 'I', titre: 'Partie' },
        content: [{ type: 'paragraph' }],
      }).run()
    } else if (type === 'exercice') {
      editor.chain().focus().insertContent({
        type: 'exercice',
        attrs: { numero: 1, points: 10 },
        content: [{ type: 'paragraph' }],
      }).run()
    } else if (type === 'enonce') {
      editor.chain().focus().insertContent({
        type: 'enonce',
        content: [{ type: 'paragraph' }],
      }).run()
    } else if (type === 'question') {
      editor.chain().focus().insertContent({
        type: 'question',
        attrs: { numero: 1, points: 2 },
        content: [{ type: 'text', text: 'Énoncé de la question' }],
      }).run()
    } else if (type === 'bareme') {
      editor.chain().focus().insertContent({
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Question' }] }] },
              { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Critères' }] }] },
              { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Points' }] }] },
            ],
          },
          {
            type: 'tableRow',
            content: [
              { type: 'tableCell', content: [{ type: 'paragraph' }] },
              { type: 'tableCell', content: [{ type: 'paragraph' }] },
              { type: 'tableCell', content: [{ type: 'paragraph' }] },
            ],
          },
        ],
      }).run()
    }
  }

  const insertAnnotation = (type: string) => {
    if (!editor) return
    onClose()
    editor.chain().focus().insertContent({
      type: 'annotation',
      attrs: { type },
      content: [{ type: 'paragraph' }],
    }).run()
  }

  const insertMedia = (type: string) => {
    if (!editor) return
    if (type === 'formula') {
      onClose()
      onOpenKaTeX()
      return
    }
    if (type === 'schema') {
      onClose()
      editor.chain().focus().insertContent({ type: 'schema' }).run()
      return
    }
    if (type === 'tableau') {
      onClose()
      editor.chain().focus().insertContent({
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              { type: 'tableHeader', content: [{ type: 'paragraph' }] },
              { type: 'tableHeader', content: [{ type: 'paragraph' }] },
            ],
          },
          {
            type: 'tableRow',
            content: [
              { type: 'tableCell', content: [{ type: 'paragraph' }] },
              { type: 'tableCell', content: [{ type: 'paragraph' }] },
            ],
          },
        ],
      }).run()
      return
    }
    if (type === 'code') {
      onClose()
      editor.chain().focus().toggleCodeBlock().run()
    }
  }

  const menuHeight = Math.min(520, window.innerHeight - 80)
  const maxTop = window.innerHeight - menuHeight - 16
  const style: React.CSSProperties = {
    top: Math.min(position.top, maxTop),
    left: Math.min(position.left, window.innerWidth - 300),
    maxHeight: `${menuHeight}px`,
    overflowY: 'auto',
  }

  return (
    <div ref={ref} className="ed-insert-menu" style={style}>
      <div className="ed-insert-section-label">Structure du sujet</div>
      {STRUCTURE_BLOCS.map(bloc => (
        <button key={bloc.value} className="ed-insert-item" onClick={() => insertStructure(bloc.value)}>
          <span className={`ed-insert-icon ed-insert-icon--${COLOR_MAP[bloc.color] || 'neutre'}`}>
            {bloc.icon}
          </span>
          <span className="ed-insert-body">
            <span className="ed-insert-item-label">{bloc.label}</span>
            <span className="ed-insert-item-desc">{bloc.desc}</span>
          </span>
        </button>
      ))}

      <div className="ed-insert-section-label">Annotations pédagogiques</div>
      {ANNOTATION_TYPES.map(ann => (
        <button key={ann.value} className="ed-insert-item" onClick={() => insertAnnotation(ann.value)}>
          <span className={`ed-insert-icon ed-insert-icon--${COLOR_MAP[ann.color] || 'neutre'}`}>
            {ann.icon}
          </span>
          <span className="ed-insert-body">
            <span className="ed-insert-item-label">{ann.label}</span>
            <span className="ed-insert-item-desc">{ann.desc}</span>
          </span>
        </button>
      ))}

      <div className="ed-insert-section-label">Médias &amp; Formules</div>
      {MEDIA_BLOCS.map(m => (
        <button key={m.value} className="ed-insert-item" onClick={() => insertMedia(m.value)}>
          <span className="ed-insert-icon ed-insert-icon--neutre">{m.icon}</span>
          <span className="ed-insert-body">
            <span className="ed-insert-item-label">{m.label}</span>
            <span className="ed-insert-item-desc">{m.desc}</span>
          </span>
        </button>
      ))}
    </div>
  )
}
