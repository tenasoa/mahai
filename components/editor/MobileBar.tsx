'use client'

import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { MobileTab, SubjectMetadata, PrixMode, Visibilite, OutlineItem } from './types'
import MetadataSidebar from './MetadataSidebar'
import PricingSidebar from './PricingSidebar'
import InsertMenu from './InsertMenu'

interface Props {
  editor: Editor | null
  meta: SubjectMetadata
  onMetaChange: <K extends keyof SubjectMetadata>(field: K, value: SubjectMetadata[K]) => void
  prix: number
  prixMode: PrixMode
  visibilite: Visibilite
  stats: { words: number; pages: number; questions: number; readTime: number }
  onPrixChange: (v: number) => void
  onPrixModeChange: (m: PrixMode) => void
  onVisibiliteChange: (v: Visibilite) => void
  outline: OutlineItem[]
  onOutlineClick: (id: string) => void
  onOpenKaTeX: () => void
  onInsertMenu?: (e: React.MouseEvent) => void
}

export default function MobileBar({
  editor, meta, onMetaChange, prix, prixMode, visibilite, stats,
  onPrixChange, onPrixModeChange, onVisibiliteChange, outline, onOutlineClick, onOpenKaTeX
}: Props) {
  const [activeTab, setActiveTab] = useState<MobileTab | null>(null)

  const tabs: { id: MobileTab; icon: string; label: string }[] = [
    { id: 'write',    icon: '✎', label: 'Écrire'      },
    { id: 'insert',   icon: '⊕', label: 'Insérer'     },
    { id: 'metadata', icon: '≡', label: 'Infos'       },
    { id: 'settings', icon: '⚙', label: 'Paramètres'  },
  ]

  const close = () => setActiveTab(null)

  return (
    <>
      <div className="editor-mobile-bar">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`ed-mobile-tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(prev => prev === t.id ? null : t.id)}
          >
            <span className="ed-mobile-tab-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab && activeTab !== 'write' && (
        <>
          <div className="ed-mobile-drawer-overlay" onClick={close} />
          <div className="ed-mobile-drawer">
            <div className="ed-mobile-drawer-handle" />
            <button
              className="ed-mobile-drawer-close"
              onClick={close}
              aria-label="Fermer"
            >✕</button>

            {activeTab === 'insert' && (
              <div className="ed-mobile-drawer-body">
                <InsertMenu
                  editor={editor}
                  position={{ top: 0, left: 0 }}
                  onClose={close}
                  onOpenKaTeX={() => { close(); onOpenKaTeX() }}
                />
              </div>
            )}

            {activeTab === 'metadata' && (
              <div className="ed-mobile-drawer-body" style={{ padding: '1rem' }}>
                <MetadataSidebar
                  meta={meta}
                  onChange={onMetaChange}
                  outline={outline}
                  onOutlineClick={(id) => { onOutlineClick(id); close() }}
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="ed-mobile-drawer-body" style={{ padding: '1rem' }}>
                <PricingSidebar
                  prix={prix}
                  prixMode={prixMode}
                  visibilite={visibilite}
                  stats={stats}
                  onPrixChange={onPrixChange}
                  onPrixModeChange={onPrixModeChange}
                  onVisibiliteChange={onVisibiliteChange}
                />
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
