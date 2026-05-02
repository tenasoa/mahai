'use client'

/**
 * StepsBar — indicateur d'étape horizontal réutilisable.
 *
 * Inspiré de widgets/mah-ai-editor.html `.steps-indicator` : pillule de N
 * étapes alignées, avec état done (vert sage), active (foncé) et todo
 * (gris). Sert dans :
 *  - la barre de l'éditeur (workflow Métadonnées → Édition → Soumission)
 *  - la page wizard /sujet/[id]/submit (Aperçu → Tarif → Publier)
 *
 * Affichage compact : pour les écrans étroits, seul le numéro est visible.
 */

import type { ReactNode } from 'react'

export interface Step {
  num: number
  label: string
  /** Optionnel : icône ou contenu custom à gauche du label. */
  icon?: ReactNode
}

interface Props {
  steps: Step[]
  current: number
  /** Permet de cliquer pour aller à une étape précédente (done). */
  onStepClick?: (n: number) => void
  /** Mode compact : numéros seulement, labels masqués sur mobile. */
  compact?: boolean
}

export default function StepsBar({ steps, current, onStepClick, compact = false }: Props) {
  return (
    <div className={`steps-bar${compact ? ' steps-bar--compact' : ''}`} role="list">
      {steps.map((s) => {
        const state =
          s.num < current ? 'done' : s.num === current ? 'active' : 'todo'
        const clickable = onStepClick && s.num <= current
        const Tag = clickable ? 'button' : 'div'
        return (
          <Tag
            key={s.num}
            role="listitem"
            className={`steps-bar-item steps-bar-item--${state}`}
            onClick={clickable ? () => onStepClick!(s.num) : undefined}
            type={clickable ? 'button' : undefined}
            aria-current={s.num === current ? 'step' : undefined}
          >
            <span className="steps-bar-num">
              {state === 'done' ? '✓' : s.num}
            </span>
            <span className="steps-bar-label">
              {s.icon}
              {s.label}
            </span>
          </Tag>
        )
      })}

      <style jsx>{`
        .steps-bar {
          display: inline-flex;
          align-items: center;
          gap: 0;
        }

        .steps-bar-item {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--mono, monospace);
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.4rem 0.85rem;
          border: 1px solid var(--b1, rgba(0, 0, 0, 0.1));
          border-right: none;
          background: transparent;
          color: var(--text-3, rgba(0, 0, 0, 0.4));
          cursor: default;
          transition: all 0.15s ease;
          line-height: 1;
          font-weight: 500;
          text-align: center;
        }
        .steps-bar-item:first-child {
          border-radius: 3px 0 0 3px;
        }
        .steps-bar-item:last-child {
          border-radius: 0 3px 3px 0;
          border-right: 1px solid var(--b1);
        }

        button.steps-bar-item {
          cursor: pointer;
        }
        button.steps-bar-item:hover {
          background: var(--surface, #f0eee9);
          color: var(--text, #1a1714);
        }

        /* États */
        .steps-bar-item--active {
          background: var(--ink, #1a1714);
          color: var(--cream, #f7f3ee);
          border-color: var(--ink);
        }
        .steps-bar-item--done {
          background: var(--sage-dim, rgba(74, 107, 90, 0.1));
          color: var(--sage, #4a6b5a);
          border-color: var(--sage-line, rgba(74, 107, 90, 0.24));
        }

        .steps-bar-num {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--b1);
          color: var(--text-3);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          font-weight: 600;
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .steps-bar-item--active .steps-bar-num {
          background: rgba(255, 255, 255, 0.18);
          color: var(--cream);
        }
        .steps-bar-item--done .steps-bar-num {
          background: var(--sage);
          color: white;
        }

        .steps-bar-label {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        /* Compact / mobile : labels cachés sous 720px (ou si compact prop) */
        .steps-bar--compact .steps-bar-label,
        @media (max-width: 720px) {
          .steps-bar-label {
            display: none;
          }
          .steps-bar-item {
            padding: 0.4rem 0.55rem;
          }
        }
      `}</style>
    </div>
  )
}
