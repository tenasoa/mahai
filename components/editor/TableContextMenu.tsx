'use client'

/**
 * TableContextMenu — barre flottante pour gérer un tableau.
 *
 * Apparaît au-dessus du tableau quand le curseur est dedans. Permet
 * d'ajouter/supprimer des lignes/colonnes, de basculer la ligne d'en-tête,
 * et de supprimer le tableau.
 *
 * Implémenté via un overlay positionné absolument par rapport à l'élément
 * `<table>` survolé/contenant le curseur. Utilise `editor.on('selectionUpdate')`
 * pour détecter quand le curseur entre/sort d'une table.
 */

import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/react'

interface Props {
  editor: Editor | null
}

interface Anchor {
  top: number
  left: number
  width: number
}

export default function TableContextMenu({ editor }: Props) {
  const [anchor, setAnchor] = useState<Anchor | null>(null)

  useEffect(() => {
    if (!editor) return

    const update = () => {
      // Si pas dans une table → on cache
      if (!editor.isActive('table')) {
        setAnchor(null)
        return
      }

      // On récupère l'élément <table> qui contient la sélection
      const { from } = editor.state.selection
      const dom = editor.view.domAtPos(from)
      if (!dom) {
        setAnchor(null)
        return
      }
      const node = dom.node as Node
      const el = (node.nodeType === Node.ELEMENT_NODE
        ? (node as HTMLElement)
        : node.parentElement) as HTMLElement | null
      const tableEl = el?.closest('table')
      if (!tableEl) {
        setAnchor(null)
        return
      }

      const rect = tableEl.getBoundingClientRect()
      setAnchor({ top: rect.top - 38, left: rect.left, width: rect.width })
    }

    editor.on('selectionUpdate', update)
    editor.on('transaction', update)
    update()

    return () => {
      editor.off('selectionUpdate', update)
      editor.off('transaction', update)
    }
  }, [editor])

  if (!editor || !anchor) return null

  const c = editor.chain().focus()

  return (
    <div
      className="ed-table-ctx"
      role="toolbar"
      aria-label="Actions sur le tableau"
      style={{
        position: 'fixed',
        top: Math.max(8, anchor.top),
        left: anchor.left,
        zIndex: 50,
      }}
    >
      <button className="ed-table-ctx-btn" onClick={() => c.addColumnBefore().run()} title="Ajouter une colonne avant">
        ←＋
      </button>
      <button className="ed-table-ctx-btn" onClick={() => c.addColumnAfter().run()} title="Ajouter une colonne après">
        ＋→
      </button>
      <button className="ed-table-ctx-btn" onClick={() => c.deleteColumn().run()} title="Supprimer la colonne">
        −col
      </button>
      <div className="ed-table-ctx-sep" />
      <button className="ed-table-ctx-btn" onClick={() => c.addRowBefore().run()} title="Ajouter une ligne au-dessus">
        ↑＋
      </button>
      <button className="ed-table-ctx-btn" onClick={() => c.addRowAfter().run()} title="Ajouter une ligne en-dessous">
        ＋↓
      </button>
      <button className="ed-table-ctx-btn" onClick={() => c.deleteRow().run()} title="Supprimer la ligne">
        −lig
      </button>
      <div className="ed-table-ctx-sep" />
      <button className="ed-table-ctx-btn" onClick={() => c.toggleHeaderRow().run()} title="Basculer la ligne d'en-tête">
        H↔
      </button>
      <button className="ed-table-ctx-btn" onClick={() => c.mergeOrSplit().run()} title="Fusionner / scinder les cellules">
        ⊞
      </button>
      <div className="ed-table-ctx-sep" />
      <button
        className="ed-table-ctx-btn ed-table-ctx-del"
        onClick={() => c.deleteTable().run()}
        title="Supprimer le tableau"
      >
        ✕
      </button>
    </div>
  )
}
