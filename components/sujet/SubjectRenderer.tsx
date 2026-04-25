'use client'

/**
 * SubjectRenderer — Rendu lecture seule du contenu TipTap d'un sujet.
 *
 * Réutilisé sur :
 *  - /sujet/[id] (teaser : `lockAfter` cache les blocs au-delà du seuil)
 *  - /sujet/[id]/consult (rendu intégral après achat)
 *  - PreviewModal contributeur (aperçu avant publication)
 *
 * Mêmes extensions que l'éditeur → mêmes classes CSS (`.editor-canvas`,
 * `.ed-partie`, `.ed-exercice`, `.ed-question`, `.ed-formula`, etc.).
 */

import { useEffect } from 'react'
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
} from '@/components/editor/extensions'

const lowlight = createLowlight(common)

interface Props {
  /**
   * Contenu TipTap (JSON) sauvegardé dans `Subject.content`. Peut être
   * `null`/`undefined` si le sujet n'a pas encore été édité — on affiche
   * un message vide.
   */
  content: object | null | undefined
  /**
   * Si défini, on coupe le rendu après ce nombre de blocs racine et on
   * affiche un overlay paywall (utilisé sur la page détail avant achat).
   */
  lockAfter?: number
  /** Slot rendu sous le contenu tronqué (ex: CTA d'achat). */
  lockOverlay?: React.ReactNode
}

export function SubjectRenderer({ content, lockAfter, lockOverlay }: Props) {
  // Tronquer le doc TipTap si lockAfter est défini.
  const renderContent =
    typeof lockAfter === 'number' && content && (content as any).content
      ? {
          ...(content as any),
          content: (content as any).content.slice(0, lockAfter),
        }
      : content

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
    content: renderContent || '',
    editable: false,
    immediatelyRender: false,
  })

  // Met à jour le rendu si le contenu change (changement de sujet, etc.)
  useEffect(() => {
    if (editor && renderContent) {
      editor.commands.setContent(renderContent as any)
    }
  }, [editor, JSON.stringify(renderContent)])

  if (!content || !(content as any).content || (content as any).content.length === 0) {
    return (
      <div className="editor-canvas" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>
          Le contenu de ce sujet n'est pas encore disponible.
        </p>
      </div>
    )
  }

  const totalBlocks = (content as any).content?.length ?? 0
  const isLocked = typeof lockAfter === 'number' && totalBlocks > lockAfter

  return (
    <div className="subject-renderer-wrap" style={{ position: 'relative' }}>
      <div className="editor-canvas">
        <EditorContent editor={editor} />
      </div>

      {isLocked && (
        <div className="subject-lock-overlay">
          <div className="subject-lock-fade" aria-hidden="true" />
          <div className="subject-lock-cta">{lockOverlay}</div>
        </div>
      )}

      <style jsx global>{`
        .subject-lock-overlay {
          position: relative;
          margin-top: -120px;
          pointer-events: none;
        }
        .subject-lock-fade {
          height: 180px;
          background: linear-gradient(
            to bottom,
            rgba(var(--void-rgb, 12, 12, 14), 0) 0%,
            rgba(var(--void-rgb, 12, 12, 14), 0.85) 60%,
            var(--void) 100%
          );
        }
        .subject-lock-cta {
          background: var(--void);
          padding: 1.5rem 1rem 2rem;
          text-align: center;
          pointer-events: auto;
        }
      `}</style>
    </div>
  )
}
