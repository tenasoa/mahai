'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
  CONTENT_TYPES,
  CustomMeta,
  getSeriesForExam,
} from './types'

interface Props {
  onComplete: (data: SubjectMetadata & { prix: number; prixMode: string }) => void
}

const PRIX_SUGGESTIONS = [500, 1000, 2000, 3000, 5000]

/**
 * Génère un titre automatique à partir des métadonnées saisies.
 * Garde uniquement les infos les plus discriminantes : type d'examen +
 * variante (série / option / concours / établissement) + année + matière.
 * Renvoie '' tant qu'aucun examType n'est choisi pour éviter d'écraser un
 * titre vide par un titre vide.
 */
function buildAutoTitle(m: SubjectMetadata): string {
  if (!m.examType) return ''

  let head = ''

  switch (m.examType) {
    case 'BACC': {
      if (m.serie) {
        const tech = m.baccType === 'Technique' ? ' Tech.' : ''
        head = `BACC${tech} série ${m.serie}`
      } else if (m.baccType) {
        head = `BACC ${m.baccType === 'Technique' ? 'Technique' : 'Général'}`
      } else {
        head = 'BACC'
      }
      break
    }
    case 'BEPC': {
      head = m.bepcOption ? `BEPC option ${m.bepcOption}` : 'BEPC'
      break
    }
    case 'CEPE': {
      head = 'CEPE'
      break
    }
    case 'Concours': {
      head = m.concoursType?.trim()
        ? `Concours ${m.concoursType.trim()}`
        : 'Concours'
      break
    }
    case 'Etablissement': {
      const base = m.etablissement?.trim() || 'Établissement'
      const sem = m.semestre === 'S1' ? 'S1' : m.semestre === 'Final' ? 'Final' : ''
      head = sem ? `${base} ${sem}` : base
      break
    }
    case 'Autre':
    default: {
      head = 'Sujet'
    }
  }

  const annee = m.anneeScolaire?.trim() || ''
  const matiere = m.matiere?.trim() || ''

  const left = annee ? `${head} ${annee}` : head
  if (left && matiere) return `${left} — ${matiere}`
  return left || matiere
}

function emptyMeta(): SubjectMetadata {
  return {
    title: '',
    matiere: '',
    examType: '',
    bepcOption: '',
    baccType: '',
    serie: '',
    concoursType: '',
    etablissement: '',
    semestre: '',
    filiere: '',
    anneeScolaire: '',
    dateOfficielle: '',
    duree: '',
    coefficient: '2',
    contentType: 'sujet_seul',
    tags: [],
    customMeta: [],
  }
}

export default function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState(1)
  const [meta, setMeta] = useState<SubjectMetadata>(emptyMeta())
  const [prix, setPrix] = useState(2000)
  const [prixMode, setPrixMode] = useState('forfait')

  // Suivi du titre auto-généré : tant que l'utilisateur n'a pas tapé quelque
  // chose de différent, on continue de mettre à jour le titre lorsqu'une
  // métadonnée change. Dès qu'il customise, on respecte sa saisie.
  const [titleOverridden, setTitleOverridden] = useState(false)
  const [lastAutoTitle, setLastAutoTitle] = useState('')

  const set = <K extends keyof SubjectMetadata>(field: K, value: SubjectMetadata[K]) => {
    setMeta(prev => ({ ...prev, [field]: value }))
  }

  const computedAutoTitle = useMemo(() => buildAutoTitle(meta), [meta])

  // Synchronise le titre avec l'auto-génération tant qu'il n'a pas été
  // explicitement modifié par l'utilisateur.
  useEffect(() => {
    if (titleOverridden) return
    if (!computedAutoTitle) return
    if (meta.title && meta.title !== lastAutoTitle) {
      // Cas où le titre actuel a été saisi avant le 1er passage : on respecte.
      setTitleOverridden(true)
      return
    }
    setLastAutoTitle(computedAutoTitle)
    setMeta(prev =>
      prev.title === computedAutoTitle ? prev : { ...prev, title: computedAutoTitle }
    )
  }, [computedAutoTitle, meta.title, titleOverridden, lastAutoTitle])

  const handleTitleChange = (value: string) => {
    setTitleOverridden(value.trim().length > 0)
    set('title', value)
  }

  const setExamType = (value: ExamType) => {
    // reset des champs conditionnels
    setMeta(prev => ({
      ...prev,
      examType: value,
      bepcOption: '',
      baccType: '',
      serie: '',
      concoursType: '',
      etablissement: '',
      semestre: '',
      filiere: '',
      anneeScolaire: '',
    }))
  }

  // ── Métadonnées custom ──
  const addCustomMeta = () => {
    const nm: CustomMeta = { id: crypto.randomUUID(), label: 'Nouvelle info', value: '' }
    set('customMeta', [...meta.customMeta, nm])
  }
  const updateCustomMeta = (id: string, field: 'label' | 'value', value: string) => {
    set('customMeta', meta.customMeta.map(cm => cm.id === id ? { ...cm, [field]: value } : cm))
  }
  const deleteCustomMeta = (id: string) => {
    set('customMeta', meta.customMeta.filter(cm => cm.id !== id))
  }

  // ── Validation step 1 ──
  const needsBepcOption = meta.examType === 'BEPC'
  const needsBaccType = meta.examType === 'BACC'
  const needsBaccSerie = meta.examType === 'BACC' && !!meta.baccType
  const needsConcoursType = meta.examType === 'Concours'
  const needsEtablissementFields = meta.examType === 'Etablissement'

  const canNext1 = (() => {
    if (!meta.title.trim() || !meta.matiere.trim() || !meta.examType) return false
    if (needsBepcOption && !meta.bepcOption) return false
    if (needsBaccType && !meta.baccType) return false
    if (needsBaccSerie && !meta.serie) return false
    if (needsConcoursType && !meta.concoursType?.trim()) return false
    if (needsEtablissementFields && !meta.semestre) return false
    if (!meta.anneeScolaire) return false
    return true
  })()

  const canNext2 = meta.contentType && meta.duree

  const handleFinish = () => {
    onComplete({ ...meta, prix, prixMode })
  }

  const commission = Math.round(prix * 0.3)
  const revenu = prix - commission
  const series = getSeriesForExam(meta.examType, meta.baccType)
  const isConcours = meta.examType === 'Concours'

  return (
    <div className="ed-onboarding-overlay">
      <div className="ed-onboarding-modal ed-onboarding-modal--lg">

        {/* ── Étape 1 : Informations de base ── */}
        {step === 1 && (
          <>
            <div className="ed-onboarding-header">
              <div className="ed-onboarding-step-label">Étape 1 / 4 — Identification</div>
              <h2 className="ed-onboarding-title">Nouveau <em>sujet</em></h2>
              <p className="ed-onboarding-desc">Renseignez les informations de base pour bien indexer votre sujet.</p>
            </div>

            <div className="ed-onboarding-body ed-onboarding-body--scroll">
              <div className="ed-field">
                <label className="ed-label">
                  Titre du sujet *
                  <span className="ed-label-hint">
                    {titleOverridden
                      ? '(personnalisé)'
                      : '(généré automatiquement)'}
                  </span>
                </label>
                <input
                  className="ed-input"
                  placeholder="Ex : BACC série C 2010-2011 — Mathématiques"
                  value={meta.title}
                  onChange={e => handleTitleChange(e.target.value)}
                />
                {titleOverridden && computedAutoTitle && computedAutoTitle !== meta.title && (
                  <button
                    type="button"
                    className="ed-btn-mini"
                    style={{ marginTop: '0.35rem' }}
                    onClick={() => {
                      setTitleOverridden(false)
                      setLastAutoTitle(computedAutoTitle)
                      set('title', computedAutoTitle)
                    }}
                  >
                    → Régénérer : {computedAutoTitle}
                  </button>
                )}
              </div>

              <div className="ed-field">
                <label className="ed-label">Matière * <span className="ed-label-hint">(saisie libre)</span></label>
                <input
                  className="ed-input"
                  placeholder="Ex : Mathématiques, Physique-Chimie, Droit civil…"
                  value={meta.matiere}
                  onChange={e => set('matiere', e.target.value)}
                />
              </div>

              <div className="ed-field">
                <label className="ed-label">Type d'examen *</label>
                <select
                  className="ed-select"
                  value={meta.examType}
                  onChange={e => setExamType(e.target.value as ExamType)}
                >
                  <option value="">— Choisir —</option>
                  {EXAM_TYPES.map(et => (
                    <option key={et.value} value={et.value}>{et.label}</option>
                  ))}
                </select>
              </div>

              {/* ── BEPC Option ── */}
              {needsBepcOption && (
                <div className="ed-field">
                  <label className="ed-label">Option BEPC *</label>
                  <div className="ed-pill-group">
                    {BEPC_OPTIONS.map(o => (
                      <button
                        key={o}
                        className={`ed-pill${meta.bepcOption === o ? ' active' : ''}`}
                        onClick={() => set('bepcOption', o)}
                      >Option {o}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── BACC Type ── */}
              {needsBaccType && (
                <div className="ed-field">
                  <label className="ed-label">Type de BACC *</label>
                  <div className="ed-pill-group">
                    {BACC_TYPES.map(bt => (
                      <button
                        key={bt.value}
                        className={`ed-pill${meta.baccType === bt.value ? ' active' : ''}`}
                        onClick={() => { set('baccType', bt.value as BaccType); set('serie', '') }}
                      >{bt.label}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── BACC série (général/technique) ── */}
              {needsBaccSerie && series.length > 0 && (
                <div className="ed-field">
                  <label className="ed-label">Série *</label>
                  <select className="ed-select" value={meta.serie || ''} onChange={e => set('serie', e.target.value)}>
                    <option value="">— Choisir la série —</option>
                    {series.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {meta.baccType === 'Technique' && (
                    <p className="ed-label-hint" style={{ marginTop: '0.25rem' }}>
                      Séries techniques en cours d'investigation — contactez l'admin si votre série n'apparaît pas.
                    </p>
                  )}
                </div>
              )}

              {/* ── Concours ── */}
              {needsConcoursType && (
                <div className="ed-field">
                  <label className="ed-label">Type de concours * <span className="ed-label-hint">(saisie libre)</span></label>
                  <input
                    className="ed-input"
                    placeholder="Ex : ENAM, INSCAE, Médecine, École Normale…"
                    value={meta.concoursType || ''}
                    onChange={e => set('concoursType', e.target.value)}
                  />
                </div>
              )}

              {/* ── Établissement ── */}
              {needsEtablissementFields && (
                <>
                  <div className="ed-field">
                    <label className="ed-label">Établissement <span className="ed-label-hint">(optionnel)</span></label>
                    <input
                      className="ed-input"
                      placeholder="Ex : Lycée Jules Ferry, Université d'Antananarivo…"
                      value={meta.etablissement || ''}
                      onChange={e => set('etablissement', e.target.value)}
                    />
                  </div>
                  <div className="ed-field">
                    <label className="ed-label">Semestre *</label>
                    <div className="ed-pill-group">
                      {SEMESTRES.map(s => (
                        <button
                          key={s.value}
                          className={`ed-pill${meta.semestre === s.value ? ' active' : ''}`}
                          onClick={() => set('semestre', s.value as Semestre)}
                        >{s.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="ed-field">
                    <label className="ed-label">Filière <span className="ed-label-hint">(ex: Informatique, Droit, Commerce…)</span></label>
                    <input
                      className="ed-input"
                      placeholder="Filière / Mention"
                      value={meta.filiere || ''}
                      onChange={e => set('filiere', e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* ── Année (scolaire ou concours) ── */}
              <div className="ed-field">
                <label className="ed-label">
                  {isConcours ? 'Année du concours *' : 'Année scolaire *'}
                </label>
                <select
                  className="ed-select"
                  value={meta.anneeScolaire || ''}
                  onChange={e => set('anneeScolaire', e.target.value)}
                >
                  <option value="">— Choisir —</option>
                  {(isConcours ? ANNEES_CONCOURS : ANNEES_SCOLAIRES).map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* ── Date officielle ── */}
              <div className="ed-field">
                <label className="ed-label">
                  Date officielle de l'examen <span className="ed-label-hint">(optionnel)</span>
                </label>
                <input
                  className="ed-input"
                  placeholder="Ex : Jeudi 22 septembre 2016 dans l'après-midi"
                  value={meta.dateOfficielle || ''}
                  onChange={e => set('dateOfficielle', e.target.value)}
                />
              </div>

              {/* ── Métadonnées custom ── */}
              <div className="ed-field">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="ed-label" style={{ margin: 0 }}>Autres informations utiles</label>
                  <button type="button" className="ed-btn-mini" onClick={addCustomMeta}>+ Ajouter</button>
                </div>
                {meta.customMeta.length === 0 ? (
                  <p className="ed-label-hint">Aucune. Cliquez sur « + Ajouter » pour créer un champ personnalisé.</p>
                ) : (
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

            <div className="ed-onboarding-footer">
              <div className="ed-step-dots">
                {[1,2,3,4].map(i => <span key={i} className={`ed-step-dot${step === i ? ' active' : ''}${step > i ? ' done' : ''}`} />)}
              </div>
              <button
                className="editor-btn editor-btn--primary"
                disabled={!canNext1}
                onClick={() => setStep(2)}
              >
                Continuer →
              </button>
            </div>
          </>
        )}

        {/* ── Étape 2 : Type de contenu & durée ── */}
        {step === 2 && (
          <>
            <div className="ed-onboarding-header">
              <div className="ed-onboarding-step-label">Étape 2 / 4 — Configuration</div>
              <h2 className="ed-onboarding-title">Type &amp; Durée</h2>
              <p className="ed-onboarding-desc">Définissez le type de contenu et les paramètres.</p>
            </div>

            <div className="ed-onboarding-body">
              <div className="ed-field">
                <label className="ed-label">Type de contenu *</label>
                <div className="ed-content-type-grid">
                  {CONTENT_TYPES.map(ct => (
                    <button
                      key={ct.value}
                      className={`ed-ct-opt${meta.contentType === ct.value ? ' active' : ''}`}
                      onClick={() => set('contentType', ct.value)}
                    >
                      <div className="ed-ct-opt-label">{ct.label}</div>
                      <div className="ed-ct-opt-desc">{ct.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginTop: '0.75rem' }}>
                <div className="ed-field">
                  <label className="ed-label">Durée *</label>
                  <select className="ed-select" value={meta.duree} onChange={e => set('duree', e.target.value)}>
                    <option value="">— Durée —</option>
                    {DUREES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="ed-field">
                  <label className="ed-label">Coefficient</label>
                  <select className="ed-select" value={meta.coefficient} onChange={e => set('coefficient', e.target.value)}>
                    {COEFFICIENTS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="ed-onboarding-footer">
              <button className="editor-btn" onClick={() => setStep(1)}>← Retour</button>
              <div className="ed-step-dots">
                {[1,2,3,4].map(i => <span key={i} className={`ed-step-dot${step === i ? ' active' : ''}${step > i ? ' done' : ''}`} />)}
              </div>
              <button
                className="editor-btn editor-btn--primary"
                disabled={!canNext2}
                onClick={() => setStep(3)}
              >
                Continuer →
              </button>
            </div>
          </>
        )}

        {/* ── Étape 3 : Tarification ── */}
        {step === 3 && (
          <>
            <div className="ed-onboarding-header">
              <div className="ed-onboarding-step-label">Étape 3 / 4 — Tarification</div>
              <h2 className="ed-onboarding-title">Prix</h2>
              <p className="ed-onboarding-desc">Définissez le prix de votre sujet.</p>
            </div>

            <div className="ed-onboarding-body">
              <div className="ed-price-toggle" style={{ marginBottom: '1rem' }}>
                {['forfait', 'par_page'].map(mode => (
                  <button
                    key={mode}
                    className={`ed-price-toggle-btn${prixMode === mode ? ' active' : ''}`}
                    onClick={() => setPrixMode(mode)}
                  >
                    {mode === 'forfait' ? 'Forfait' : 'Par page'}
                  </button>
                ))}
              </div>

              <div className="ed-field" style={{ marginBottom: '0.75rem' }}>
                <label className="ed-label">
                  Prix {prixMode === 'par_page' ? 'par page' : 'total'} (Ariary)
                </label>
                <input
                  className="ed-price-input"
                  type="number"
                  min={0}
                  step={100}
                  value={prix}
                  onChange={e => setPrix(Number(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {PRIX_SUGGESTIONS.map(p => (
                  <button
                    key={p}
                    className={`ed-tag${prix === p ? ' active' : ''}`}
                    onClick={() => setPrix(p)}
                  >
                    {p.toLocaleString()} Ar
                  </button>
                ))}
              </div>

              <div className="ed-ventilation">
                <div className="ed-vent-row">
                  <span className="ed-vent-label">Prix affiché étudiant</span>
                  <span className="ed-vent-val">{prix.toLocaleString()} Ar</span>
                </div>
                <div className="ed-vent-sep" />
                <div className="ed-vent-row">
                  <span className="ed-vent-label">Commission plateforme (30%)</span>
                  <span className="ed-vent-val">− {commission.toLocaleString()} Ar</span>
                </div>
                <div className="ed-vent-row">
                  <span className="ed-vent-label">Vos revenus (70%)</span>
                  <span className="ed-vent-val ed-vent-val--gold">{revenu.toLocaleString()} Ar</span>
                </div>
              </div>
            </div>

            <div className="ed-onboarding-footer">
              <button className="editor-btn" onClick={() => setStep(2)}>← Retour</button>
              <div className="ed-step-dots">
                {[1,2,3,4].map(i => <span key={i} className={`ed-step-dot${step === i ? ' active' : ''}${step > i ? ' done' : ''}`} />)}
              </div>
              <button
                className="editor-btn editor-btn--primary"
                onClick={() => setStep(4)}
                disabled={prix <= 0}
              >
                Continuer →
              </button>
            </div>
          </>
        )}

        {/* ── Étape 4 : Aperçu & Validation ─────────────────────────────
           Récapitulatif final avant ouverture de l'éditeur. L'utilisateur
           peut cliquer sur n'importe quel bloc pour revenir à l'étape
           correspondante (raccourci UX). */}
        {step === 4 && (
          <>
            <div className="ed-onboarding-header">
              <div className="ed-onboarding-step-label">Étape 4 / 4 — Aperçu</div>
              <h2 className="ed-onboarding-title">Vérifiez avant de <em>commencer</em></h2>
              <p className="ed-onboarding-desc">Cliquez sur un bloc pour modifier ses informations.</p>
            </div>

            <div className="ed-onboarding-body">
              <div className="ed-recap">
                {/* Identification */}
                <button
                  className="ed-recap-card"
                  onClick={() => setStep(1)}
                  type="button"
                  aria-label="Modifier l'identification"
                >
                  <div className="ed-recap-card-head">
                    <span className="ed-recap-card-num">01</span>
                    <span className="ed-recap-card-title">Identification</span>
                    <span className="ed-recap-card-edit">Modifier</span>
                  </div>
                  <div className="ed-recap-grid">
                    <div className="ed-recap-row">
                      <span className="ed-recap-label">Titre</span>
                      <span className="ed-recap-value">{meta.title || '—'}</span>
                    </div>
                    <div className="ed-recap-row">
                      <span className="ed-recap-label">Matière</span>
                      <span className="ed-recap-value">{meta.matiere || '—'}</span>
                    </div>
                    <div className="ed-recap-row">
                      <span className="ed-recap-label">Type</span>
                      <span className="ed-recap-value">
                        {[meta.examType, meta.baccType, meta.bepcOption, meta.serie, meta.concoursType]
                          .filter(Boolean).join(' · ') || '—'}
                      </span>
                    </div>
                    <div className="ed-recap-row">
                      <span className="ed-recap-label">Année</span>
                      <span className="ed-recap-value">{meta.anneeScolaire || '—'}</span>
                    </div>
                  </div>
                </button>

                {/* Configuration */}
                <button
                  className="ed-recap-card"
                  onClick={() => setStep(2)}
                  type="button"
                  aria-label="Modifier la configuration"
                >
                  <div className="ed-recap-card-head">
                    <span className="ed-recap-card-num">02</span>
                    <span className="ed-recap-card-title">Configuration</span>
                    <span className="ed-recap-card-edit">Modifier</span>
                  </div>
                  <div className="ed-recap-grid">
                    <div className="ed-recap-row">
                      <span className="ed-recap-label">Type de contenu</span>
                      <span className="ed-recap-value">{meta.contentType || '—'}</span>
                    </div>
                    <div className="ed-recap-row">
                      <span className="ed-recap-label">Durée</span>
                      <span className="ed-recap-value">{meta.duree || '—'}</span>
                    </div>
                    <div className="ed-recap-row">
                      <span className="ed-recap-label">Coefficient</span>
                      <span className="ed-recap-value">{meta.coefficient || '—'}</span>
                    </div>
                    {meta.tags && meta.tags.length > 0 && (
                      <div className="ed-recap-row">
                        <span className="ed-recap-label">Tags</span>
                        <span className="ed-recap-value">{meta.tags.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </button>

                {/* Tarification */}
                <button
                  className="ed-recap-card ed-recap-card--gold"
                  onClick={() => setStep(3)}
                  type="button"
                  aria-label="Modifier la tarification"
                >
                  <div className="ed-recap-card-head">
                    <span className="ed-recap-card-num">03</span>
                    <span className="ed-recap-card-title">Tarification</span>
                    <span className="ed-recap-card-edit">Modifier</span>
                  </div>
                  <div className="ed-recap-grid">
                    <div className="ed-recap-row">
                      <span className="ed-recap-label">Prix affiché</span>
                      <span className="ed-recap-value ed-recap-value--strong">
                        {prix.toLocaleString()} Ar
                      </span>
                    </div>
                    <div className="ed-recap-row">
                      <span className="ed-recap-label">Mode</span>
                      <span className="ed-recap-value">{prixMode === 'forfait' ? 'Forfait' : 'Par page'}</span>
                    </div>
                    <div className="ed-recap-row">
                      <span className="ed-recap-label">Commission (30%)</span>
                      <span className="ed-recap-value ed-recap-value--mute">− {commission.toLocaleString()} Ar</span>
                    </div>
                    <div className="ed-recap-row">
                      <span className="ed-recap-label">Vos revenus (70%)</span>
                      <span className="ed-recap-value ed-recap-value--gold-strong">
                        {revenu.toLocaleString()} Ar
                      </span>
                    </div>
                  </div>
                </button>

                <p className="ed-recap-note">
                  Vous pourrez modifier ces informations à tout moment depuis l'éditeur via le panneau Métadonnées.
                </p>
              </div>
            </div>

            <div className="ed-onboarding-footer">
              <button className="editor-btn" onClick={() => setStep(3)}>← Retour</button>
              <div className="ed-step-dots">
                {[1,2,3,4].map(i => <span key={i} className={`ed-step-dot${step === i ? ' active' : ''}${step > i ? ' done' : ''}`} />)}
              </div>
              <button
                className="editor-btn editor-btn--primary"
                onClick={handleFinish}
              >
                Ouvrir l'éditeur ✦
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
