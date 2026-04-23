'use client'

import {
  SubjectMetadata,
  ExamType,
  BaccType,
  Semestre,
  EXAM_TYPES,
  BEPC_OPTIONS,
  BACC_TYPES,
  SEMESTRES,
  ANNEES_SCOLAIRES,
  ANNEES_CONCOURS,
  DUREES,
  COEFFICIENTS,
  ALL_TAGS,
  CustomMeta,
  OutlineItem,
  getSeriesForExam,
} from './types'

interface Props {
  meta: SubjectMetadata
  onChange: <K extends keyof SubjectMetadata>(field: K, value: SubjectMetadata[K]) => void
  outline: OutlineItem[]
  onOutlineClick: (id: string) => void
  activeOutlineId?: string
}

export default function MetadataSidebar({ meta, onChange, outline, onOutlineClick, activeOutlineId }: Props) {
  const series = getSeriesForExam(meta.examType, meta.baccType)
  const isConcours = meta.examType === 'Concours'
  const isEtablissement = meta.examType === 'Etablissement'
  const isBacc = meta.examType === 'BACC'
  const isBepc = meta.examType === 'BEPC'

  const toggleTag = (tag: string) => {
    const tags = meta.tags.includes(tag) ? meta.tags.filter(t => t !== tag) : [...meta.tags, tag]
    onChange('tags', tags)
  }

  // Custom meta helpers
  const addCustomMeta = () => {
    const nm: CustomMeta = { id: crypto.randomUUID(), label: 'Nouvelle info', value: '' }
    onChange('customMeta', [...meta.customMeta, nm])
  }
  const updateCustomMeta = (id: string, field: 'label' | 'value', value: string) => {
    onChange('customMeta', meta.customMeta.map(cm => cm.id === id ? { ...cm, [field]: value } : cm))
  }
  const deleteCustomMeta = (id: string) => {
    onChange('customMeta', meta.customMeta.filter(cm => cm.id !== id))
  }

  return (
    <>
      {/* ── Métadonnées ── */}
      <div className="ed-panel">
        <div className="ed-panel-header">Métadonnées</div>
        <div className="ed-panel-body">

          <div className="ed-field">
            <label className="ed-label">Titre</label>
            <input
              className="ed-input"
              value={meta.title}
              onChange={e => onChange('title', e.target.value)}
              placeholder="Titre du sujet"
            />
          </div>

          <div className="ed-field">
            <label className="ed-label">Matière</label>
            <input
              className="ed-input"
              value={meta.matiere}
              onChange={e => onChange('matiere', e.target.value)}
              placeholder="Matière (saisie libre)"
            />
          </div>

          <div className="ed-field">
            <label className="ed-label">Type d'examen</label>
            <select
              className="ed-select"
              value={meta.examType}
              onChange={e => {
                onChange('examType', e.target.value as ExamType)
                onChange('bepcOption', '')
                onChange('baccType', '')
                onChange('serie', '')
                onChange('concoursType', '')
                onChange('etablissement', '')
                onChange('semestre', '')
                onChange('filiere', '')
              }}
            >
              <option value="">— Choisir —</option>
              {EXAM_TYPES.map(et => <option key={et.value} value={et.value}>{et.label}</option>)}
            </select>
          </div>

          {/* BEPC option */}
          {isBepc && (
            <div className="ed-field">
              <label className="ed-label">Option BEPC</label>
              <select className="ed-select" value={meta.bepcOption || ''} onChange={e => onChange('bepcOption', e.target.value)}>
                <option value="">—</option>
                {BEPC_OPTIONS.map(o => <option key={o} value={o}>Option {o}</option>)}
              </select>
            </div>
          )}

          {/* BACC type */}
          {isBacc && (
            <div className="ed-field">
              <label className="ed-label">Type de BACC</label>
              <select
                className="ed-select"
                value={meta.baccType || ''}
                onChange={e => { onChange('baccType', e.target.value as BaccType); onChange('serie', '') }}
              >
                <option value="">—</option>
                {BACC_TYPES.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
              </select>
            </div>
          )}

          {/* Série BACC */}
          {isBacc && meta.baccType && series.length > 0 && (
            <div className="ed-field">
              <label className="ed-label">Série</label>
              <select className="ed-select" value={meta.serie || ''} onChange={e => onChange('serie', e.target.value)}>
                <option value="">—</option>
                {series.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* Concours type */}
          {isConcours && (
            <div className="ed-field">
              <label className="ed-label">Type de concours</label>
              <input
                className="ed-input"
                value={meta.concoursType || ''}
                onChange={e => onChange('concoursType', e.target.value)}
                placeholder="Ex : ENAM, INSCAE…"
              />
            </div>
          )}

          {/* Établissement fields */}
          {isEtablissement && (
            <>
              <div className="ed-field">
                <label className="ed-label">Établissement <span className="ed-label-hint">(optionnel)</span></label>
                <input
                  className="ed-input"
                  value={meta.etablissement || ''}
                  onChange={e => onChange('etablissement', e.target.value)}
                  placeholder="Nom de l'établissement"
                />
              </div>
              <div className="ed-field">
                <label className="ed-label">Semestre</label>
                <select className="ed-select" value={meta.semestre || ''} onChange={e => onChange('semestre', e.target.value as Semestre)}>
                  <option value="">—</option>
                  {SEMESTRES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="ed-field">
                <label className="ed-label">Filière</label>
                <input
                  className="ed-input"
                  value={meta.filiere || ''}
                  onChange={e => onChange('filiere', e.target.value)}
                  placeholder="Ex : Informatique, Droit…"
                />
              </div>
            </>
          )}

          {/* Année */}
          <div className="ed-field">
            <label className="ed-label">{isConcours ? 'Année du concours' : 'Année scolaire'}</label>
            <select
              className="ed-select"
              value={meta.anneeScolaire || ''}
              onChange={e => onChange('anneeScolaire', e.target.value)}
            >
              <option value="">—</option>
              {(isConcours ? ANNEES_CONCOURS : ANNEES_SCOLAIRES).map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Date officielle */}
          <div className="ed-field">
            <label className="ed-label">Date officielle</label>
            <input
              className="ed-input"
              value={meta.dateOfficielle || ''}
              onChange={e => onChange('dateOfficielle', e.target.value)}
              placeholder="Ex : Jeudi 22 sept. 2016"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div className="ed-field">
              <label className="ed-label">Durée</label>
              <select className="ed-select" value={meta.duree} onChange={e => onChange('duree', e.target.value)}>
                <option value="">—</option>
                {DUREES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="ed-field">
              <label className="ed-label">Coef.</label>
              <select className="ed-select" value={meta.coefficient} onChange={e => onChange('coefficient', e.target.value)}>
                {COEFFICIENTS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="ed-field">
            <label className="ed-label">Tags</label>
            <div className="ed-tags">
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  className={`ed-tag${meta.tags.includes(tag) ? ' active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {meta.tags.includes(tag) ? '✓ ' : ''}{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Custom meta */}
          <div className="ed-field">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label className="ed-label" style={{ margin: 0 }}>Autres informations</label>
              <button type="button" className="ed-btn-mini" onClick={addCustomMeta}>+ Ajouter</button>
            </div>
            {meta.customMeta.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {meta.customMeta.map(cm => (
                  <div key={cm.id} className="ed-custom-meta-row">
                    <input
                      className="ed-input ed-input--sm"
                      placeholder="Libellé"
                      value={cm.label}
                      onChange={e => updateCustomMeta(cm.id, 'label', e.target.value)}
                    />
                    <input
                      className="ed-input ed-input--sm"
                      placeholder="Valeur"
                      value={cm.value}
                      onChange={e => updateCustomMeta(cm.id, 'value', e.target.value)}
                    />
                    <button
                      type="button"
                      className="ed-btn-mini ed-btn-mini--del"
                      onClick={() => deleteCustomMeta(cm.id)}
                      aria-label="Supprimer"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Plan du document ── */}
      {outline.length > 0 && (
        <div className="ed-panel">
          <div className="ed-panel-header">Plan du document</div>
          <div className="ed-panel-body" style={{ padding: '0.5rem' }}>
            <div className="ed-outline">
              {outline.map(item => (
                <button
                  key={item.id}
                  className={`ed-outline-item ed-outline-item--niveau-${item.depth}${activeOutlineId === item.id ? ' active' : ''}`}
                  onClick={() => onOutlineClick(item.id)}
                >
                  <span className="ed-outline-icon">
                    {item.type === 'partie' ? '§' : item.type === 'exercice' ? '✎' : 'Q'}
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.numero}. {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
