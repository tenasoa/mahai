import Link from 'next/link'
import styles from './Logo.module.css'

type LogoSize = 'sm' | 'md' | 'lg' | 'xl'

interface LogoProps {
  size?: LogoSize
  href?: string
  asLink?: boolean
  className?: string
  ariaLabel?: string
}

export function Logo({
  size = 'md',
  href = '/',
  asLink = true,
  className = '',
  ariaLabel = 'Mah.AI — Accueil',
}: LogoProps) {
  const content = (
    <>
      Mah<span className={styles.gem} aria-hidden="true" />AI
    </>
  )

  const combinedClassName = `${styles.logo} ${styles[size]} ${className}`.trim()

  if (!asLink) {
    return (
      <span className={combinedClassName} role="img" aria-label="Mah.AI">
        {content}
      </span>
    )
  }

  return (
    <Link href={href} className={combinedClassName} aria-label={ariaLabel}>
      {content}
    </Link>
  )
}
