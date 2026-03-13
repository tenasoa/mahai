'use client'

import { useState, useEffect } from 'react'

type ViewMode = 'grid-3' | 'grid-2' | 'list'

interface ViewToggleProps {
  initialMode?: ViewMode
  onChange?: (mode: ViewMode) => void
}

export function ViewToggle({ initialMode = 'grid-3', onChange }: ViewToggleProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode)

  useEffect(() => {
    const saved = localStorage.getItem('catalogue-view-mode') as ViewMode
    if (saved) {
      setViewMode(saved)
      onChange?.(saved)
    }
  }, [onChange])

  const handleChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('catalogue-view-mode', mode)
    onChange?.(mode)
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => handleChange('grid-3')}
        className={`p-2 rounded-md transition-colors ${
          viewMode === 'grid-3' 
            ? 'bg-white shadow text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
        title="Grille 3"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      
      <button
        onClick={() => handleChange('grid-2')}
        className={`p-2 rounded-md transition-colors ${
          viewMode === 'grid-2' 
            ? 'bg-white shadow text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
        title="Grille 2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
        </svg>
      </button>
      
      <button
        onClick={() => handleChange('list')}
        className={`p-2 rounded-md transition-colors ${
          viewMode === 'list' 
            ? 'bg-white shadow text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
        title="Liste"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  )
}

export type { ViewMode }
