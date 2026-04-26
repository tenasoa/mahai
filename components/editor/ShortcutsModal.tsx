'use client'

/**
 * ShortcutsModal — liste des raccourcis clavier de l'éditeur.
 * Ouverte par ⌘/ (Mod-/) ou par le bouton ⓘ dans la toolbar.
 */

interface Props {
  onClose: () => void
}

const SECTIONS: { title: string; rows: [string, string][] }[] = [
  {
    title: 'Mise en forme',
    rows: [
      ['Gras',       '⌘B'],
      ['Italique',   '⌘I'],
      ['Souligné',   '⌘U'],
      ['Barré',      '⌘⇧X'],
      ['Code inline','⌘E'],
      ['Indice',     '⌘,'],
      ['Exposant',   '⌘.'],
    ],
  },
  {
    title: 'Structure',
    rows: [
      ['Titre 2',         '⌘⇧2'],
      ['Titre 3',         '⌘⇧3'],
      ['Titre 4',         '⌘⇧4'],
      ['Liste à puces',   '⌘⇧8'],
      ['Liste numérotée', '⌘⇧7'],
      ['Citation',        '⌘⇧B'],
      ['Séparateur',      'En-tête → Plus → Séparateur'],
    ],
  },
  {
    title: 'Formules',
    rows: [
      ['Formule inline',  '⌘M'],
      ['Formule en bloc', 'Bouton ∑ Formule'],
      ['Saisie directe',  '$x^2$ puis espace'],
    ],
  },
  {
    title: 'Édition',
    rows: [
      ['Annuler',     '⌘Z'],
      ['Rétablir',    '⌘⇧Z'],
      ['Sauvegarder', '⌘S'],
      ['Raccourcis',  '⌘/'],
    ],
  },
]

export default function ShortcutsModal({ onClose }: Props) {
  return (
    <div
      className="ed-katex-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Raccourcis clavier"
    >
      <div className="ed-shortcuts-modal">
        <div className="ed-katex-modal-header">
          <span className="ed-katex-modal-title">⌨ Raccourcis clavier</span>
          <button
            className="editor-btn"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="ed-shortcuts-body">
          {SECTIONS.map(section => (
            <div key={section.title} className="ed-shortcuts-section">
              <div className="ed-shortcuts-section-title">{section.title}</div>
              <table className="ed-shortcuts-table">
                <tbody>
                  {section.rows.map(([label, kbd]) => (
                    <tr key={label}>
                      <td className="ed-shortcuts-label">{label}</td>
                      <td className="ed-shortcuts-kbd">
                        <kbd>{kbd}</kbd>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
