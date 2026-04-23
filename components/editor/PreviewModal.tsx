'use client'

import 'katex/dist/katex.min.css'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'

import {
  PartieExtension,
  ExerciceExtension,
  EnonceExtension,
  QuestionExtension,
  AnnotationExtension,
  FormulaExtension,
  SchemaExtension,
} from './extensions'

import { SubjectMetadata } from './types'

const lowlight = createLowlight(common)

interface Props {
  content: object
  meta: SubjectMetadata
  prix: number
  onClose: () => void
}

export default function PreviewModal({ content, meta, prix, onClose }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Typography,
      CodeBlockLowlight.configure({ lowlight }),
      PartieExtension,
      ExerciceExtension,
      EnonceExtension,
      QuestionExtension,
      AnnotationExtension,
      FormulaExtension,
      SchemaExtension,
    ],
    content,
    editable: false,
    immediatelyRender: false,
  })

  return (
    <div className="ed-preview-overlay" onClick={onClose}>
      <div className="ed-preview-modal" onClick={e => e.stopPropagation()}>
        <header className="ed-preview-header">
          <div>
            <div className="ed-preview-tag">Aperçu (lecture seule)</div>
            <h1 className="ed-preview-title">{meta.title || 'Sujet sans titre'}</h1>
            <div className="ed-preview-meta-line">
              {meta.matiere && <span>{meta.matiere}</span>}
              {meta.examType && <span>· {meta.examType}</span>}
              {meta.baccType && <span>· {meta.baccType}</span>}
              {meta.serie && <span>· Série {meta.serie}</span>}
              {meta.bepcOption && <span>· Option {meta.bepcOption}</span>}
              {meta.concoursType && <span>· {meta.concoursType}</span>}
              {meta.anneeScolaire && <span>· {meta.anneeScolaire}</span>}
              {meta.duree && <span>· Durée : {meta.duree}</span>}
              {meta.coefficient && <span>· Coef. {meta.coefficient}</span>}
            </div>
            {meta.dateOfficielle && (
              <div className="ed-preview-meta-line" style={{ fontStyle: 'italic' }}>
                {meta.dateOfficielle}
              </div>
            )}
            {meta.etablissement && (
              <div className="ed-preview-meta-line">
                Établissement : {meta.etablissement}
                {meta.filiere && ` · Filière : ${meta.filiere}`}
                {meta.semestre && ` · ${meta.semestre === 'S1' ? '1er semestre' : 'Examen final'}`}
              </div>
            )}
            {meta.customMeta.length > 0 && (
              <div className="ed-preview-custom-meta">
                {meta.customMeta.filter(cm => cm.label && cm.value).map(cm => (
                  <div key={cm.id}><strong>{cm.label} :</strong> {cm.value}</div>
                ))}
              </div>
            )}
            <div className="ed-preview-price">Prix : {prix.toLocaleString()} Ar</div>
          </div>
          <button className="ed-preview-close" onClick={onClose} aria-label="Fermer">✕</button>
        </header>

        <div className="ed-preview-body editor-canvas">
          <EditorContent editor={editor} />
        </div>

        <footer className="ed-preview-footer">
          <button className="editor-btn" onClick={onClose}>Fermer l'aperçu</button>
        </footer>
      </div>
    </div>
  )
}
