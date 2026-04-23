'use client'

import { MATIERES } from './types'

interface Props {
  active: string
  onChange: (matiere: string) => void
  counts?: Record<string, number>
}

export default function DiscBar({ active, onChange, counts = {} }: Props) {
  const all = ['Toutes', ...MATIERES]

  return (
    <div className="editor-discbar">
      {all.map(m => {
        const count = m === 'Toutes' ? Object.values(counts).reduce((a, b) => a + b, 0) : (counts[m] || 0)
        return (
          <button
            key={m}
            className={`editor-disc-btn${active === m ? ' active' : ''}`}
            onClick={() => onChange(m)}
          >
            {m}
            {count > 0 && <span className="editor-disc-badge">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
