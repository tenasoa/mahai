'use client'

import { useState } from 'react'

interface UserAvatarProps {
  src?: string | null
  initials: string
  size?: number
  className?: string
  style?: React.CSSProperties
}

export function UserAvatar({ src, initials, size = 36, className, style }: UserAvatarProps) {
  const [error, setError] = useState(false)

  if (src && !error) {
    return (
      <img 
        src={src} 
        alt="" 
        onError={() => setError(true)}
        style={{ 
          width: size, 
          height: size, 
          borderRadius: '50%', 
          objectFit: 'cover', 
          border: '1px solid var(--gold-line)',
          ...style 
        }}
        className={className}
      />
    )
  }

  return (
    <div 
      className={`sb-av ${className || ''}`} 
      style={{ 
        width: size, 
        height: size, 
        fontSize: size > 40 ? '1rem' : '0.85rem',
        ...style 
      }}
    >
      {initials.toUpperCase() || 'U'}
    </div>
  )
}
