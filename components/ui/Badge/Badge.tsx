'use client'

/**
 * Badge / Chip — petit indicateur de statut, label ou catégorie.
 *
 * Variants alignés sur les couleurs sémantiques du design system :
 *   - default → gris neutre
 *   - gold    → premium / highlight
 *   - sage    → succès / validation
 *   - ruby    → erreur / urgence
 *   - amber   → warning
 *   - blue    → info
 *   - navy    → contributor / role
 *
 * Inspiré de widgets/50-ui-components-*.html.
 */

import type { ReactNode } from 'react'
import styles from './Badge.module.css'

type Variant = 'default' | 'gold' | 'sage' | 'ruby' | 'amber' | 'blue' | 'navy'
type Size = 'xs' | 'sm' | 'md'

interface Props {
  variant?: Variant
  size?: Size
  /** Affiche un dot animé (pulse) à gauche — utile pour « En ligne », « En direct ». */
  dot?: boolean
  /** Icône optionnelle (lucide-react ou autre) à gauche du texte. */
  icon?: ReactNode
  className?: string
  children: ReactNode
}

export default function Badge({
  variant = 'default',
  size = 'sm',
  dot = false,
  icon,
  className,
  children,
}: Props) {
  return (
    <span
      className={[
        styles.badge,
        styles[`v-${variant}`],
        styles[`s-${size}`],
        className || '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
}
