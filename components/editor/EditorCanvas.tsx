'use client'

import 'katex/dist/katex.min.css'

import { useImperativeHandle, forwardRef } from 'react'
import type { Schema } from '@tiptap/pm/model'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import {
  PartieExtension,
  ExerciceExtension,
  ProblemeExtension,
  EnonceExtension,
  QuestionExtension,
  AnnotationExtension,
  FormulaExtension,
  SchemaExtension,
} from './extensions'
import { InlineMathExtension } from './inlineMath'
import { OutlineItem } from './types'

/**
 * ProseMirror omet les attrs du JSON quand elles égalent les valeurs par
 * défaut du schéma. Ce post-traitement force leur inclusion pour tous les
 * nœuds qui ont des attrs définis — garantissant que `latex`, `hasPoints`,
 * etc. sont toujours persistés même à leur valeur par défaut.
 */
function withFullAttrs(json: any, schema: Schema): any {
  if (!json || typeof json !== 'object') return json

  function fix(node: any): any {
    if (!node || typeof node !== 'object' || !node.type) return node

    const nodeType = schema.nodes[node.type]
    if (nodeType) {
      const schemaAttrs = nodeType.attrs as Record<string, { default: unknown }>
      const attrNames = Object.keys(schemaAttrs)
      if (attrNames.length > 0) {
        const current = node.attrs || {}
        const full: Record<string, unknown> = {}
        for (const name of attrNames) {
          full[name] = name in current ? current[name] : schemaAttrs[name].default
        }
        node = { ...node, attrs: full }
      }
    }

    if (Array.isArray(node.content)) {
      node = { ...node, content: node.content.map(fix) }
    }

    return node
  }

  return fix(json)
}

const lowlight = createLowlight(common)

export interface EditorCanvasHandle {
  getEditor: () => Editor | null
  getWordCount: () => number
  getJSON: () => object
  getOutline: () => OutlineItem[]
}

interface Props {
  initialContent?: object
  onChange?: (json: object, wordCount: number, outline: OutlineItem[]) => void
  onEditorReady?: (editor: Editor) => void
}

function extractOutline(editor: Editor | null): OutlineItem[] {
  if (!editor) return []
  const items: OutlineItem[] = []
  let partieCount = 0
  let exerciceCount = 0
  let questionCount = 0

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'partie') {
      partieCount++
      exerciceCount = 0
      questionCount = 0
      items.push({
        id: `p-${pos}`,
        type: 'partie',
        label: node.attrs.titre || `Partie ${node.attrs.numero}`,
        numero: node.attrs.numero,
        depth: 1,
      })
    } else if (node.type.name === 'exercice') {
      exerciceCount++
      questionCount = 0
      items.push({
        id: `e-${pos}`,
        type: 'exercice',
        label: `Exercice ${exerciceCount}`,
        numero: exerciceCount,
        depth: 2,
      })
    } else if (node.type.name === 'question') {
      questionCount++
      items.push({
        id: `q-${pos}`,
        type: 'question',
        label: node.textContent || `Question ${questionCount}`,
        numero: questionCount,
        depth: 3,
      })
    }
  })

  return items
}

const EditorCanvas = forwardRef<EditorCanvasHandle, Props>(function EditorCanvas(
  { initialContent, onChange, onEditorReady },
  ref
) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: false }),
      Typography,
      Subscript,
      Superscript,
      Link.configure({
        // Ouverture en nouvel onglet par défaut, autolink = false (on
        // déclenche l'ajout via la toolbar pour éviter les surprises).
        openOnClick: false,
        autolink: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
      }),
      Table.configure({ resizable: true, HTMLAttributes: { class: 'ed-table' } }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: 'Commencez par insérer une Partie avec ⊕ ou tapez directement…',
      }),
      CodeBlockLowlight.configure({ lowlight }),
      PartieExtension,
      ExerciceExtension,
      ProblemeExtension,
      EnonceExtension,
      QuestionExtension,
      AnnotationExtension,
      FormulaExtension,
      SchemaExtension,
      InlineMathExtension,
    ],
    content: initialContent || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = withFullAttrs(editor.getJSON(), editor.schema)
      const wordCount = editor.storage.characterCount?.words() ?? countWords(editor.getText())
      const outline = extractOutline(editor)
      onChange?.(json, wordCount, outline)
    },
    onCreate: ({ editor }) => {
      onEditorReady?.(editor)
    },
  })

  useImperativeHandle(ref, () => ({
    getEditor: () => editor,
    getWordCount: () => editor ? countWords(editor.getText()) : 0,
    getJSON: () => editor ? withFullAttrs(editor.getJSON(), editor.schema) : {},
    getOutline: () => extractOutline(editor),
  }))

  const isEmpty = !editor || editor.isEmpty

  return (
    <div className="editor-canvas">
      {isEmpty && !editor?.isFocused && (
        <div className="ed-empty-guide">
          <p className="ed-empty-guide-title">
            Commencez par insérer une Partie avec ⊕ ou tapez directement…
          </p>
          <div className="ed-guide-cards">
            <button
              className="ed-guide-card"
              onClick={() => editor?.chain().focus().insertContent({
                type: 'partie',
                attrs: { numero: 'I', titre: 'Partie' },
                content: [{ type: 'paragraph' }],
              }).run()}
            >
              📄 Insérer une Partie
            </button>
            <button
              className="ed-guide-card"
              onClick={() => editor?.chain().focus().insertContent({
                type: 'exercice',
                attrs: { numero: 1, points: 10 },
                content: [{ type: 'paragraph' }],
              }).run()}
            >
              ✎ Insérer un Exercice
            </button>
            <button
              className="ed-guide-card"
              onClick={() => editor?.chain().focus().insertContent({
                type: 'question',
                attrs: { numero: 1, points: 2 },
                content: [{ type: 'text', text: 'Votre question ici' }],
              }).run()}
            >
              Q Ajouter une Question
            </button>
          </div>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
})

export default EditorCanvas

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}
