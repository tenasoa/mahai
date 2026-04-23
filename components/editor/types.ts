// ─────────────────────────────────────────────────────────────
// Types éditeur sujet
// ─────────────────────────────────────────────────────────────

export type ExamType = 'CEPE' | 'BEPC' | 'BACC' | 'Concours' | 'Etablissement' | 'Autre'
export type BaccType = 'General' | 'Technique'
export type BepcOption = 'A' | 'B'
export type Semestre = 'S1' | 'Final'

export interface CustomMeta {
  id: string
  label: string
  value: string
}

export interface SubjectMetadata {
  title: string
  matiere: string              // texte libre
  examType: ExamType | ''
  // Champs conditionnels
  bepcOption?: string          // A | B
  baccType?: BaccType | ''     // General | Technique
  serie?: string               // A1, A2, C, D, S, L, OSE (BACC Général) / STT, STI, STL (BACC Technique)
  concoursType?: string        // texte libre
  etablissement?: string       // optionnel
  semestre?: Semestre | ''     // S1 | Final (pour Etablissement)
  filiere?: string             // texte libre (pour Etablissement)
  // Année
  anneeScolaire?: string       // "2010-2011" (examens) ou "2016" (concours)
  dateOfficielle?: string      // ex: "Jeudi 22 septembre 2016 après-midi"
  // Contenu & structure
  duree: string
  coefficient: string
  contentType: string
  tags: string[]
  customMeta: CustomMeta[]
}

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'
export type PrixMode = 'par_page' | 'forfait'
export type Visibilite = 'public' | 'abonnes' | 'premium'
export type MobileTab = 'write' | 'insert' | 'metadata' | 'settings'

// ─── Constantes (listes d'options) ─────────────────────────────

export const EXAM_TYPES: { value: ExamType; label: string; desc: string }[] = [
  { value: 'CEPE',          label: 'CEPE',                    desc: 'Certificat d\'études primaires' },
  { value: 'BEPC',          label: 'BEPC',                    desc: 'Brevet d\'études du premier cycle' },
  { value: 'BACC',          label: 'BACC',                    desc: 'Baccalauréat' },
  { value: 'Concours',      label: 'Concours',                desc: 'Concours d\'entrée' },
  { value: 'Etablissement', label: 'Sujet d\'établissement',  desc: 'Examen interne d\'un établissement' },
  { value: 'Autre',         label: 'Autre',                   desc: 'Autre type d\'examen' },
]

export const BEPC_OPTIONS = ['A', 'B'] as const
export const BACC_TYPES: { value: BaccType; label: string }[] = [
  { value: 'General',   label: 'Général'   },
  { value: 'Technique', label: 'Technique' },
]

export const BACC_GENERAL_SERIES = ['A1', 'A2', 'C', 'D', 'S', 'L', 'OSE'] as const
// BACC Technique séries — à compléter après investigation
export const BACC_TECHNIQUE_SERIES = ['STT', 'STI', 'STL', 'STG', 'Autre'] as const

export const SEMESTRES: { value: Semestre; label: string }[] = [
  { value: 'S1',    label: 'Examen du 1er semestre' },
  { value: 'Final', label: 'Examen final (2ème semestre)' },
]

export const DUREES = ['30min', '1h', '1h30', '2h', '2h30', '3h', '3h30', '4h', '4h30', '5h', '6h']
export const COEFFICIENTS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']

// Années scolaires (ex: 2000-2001 à 2030-2031)
export const ANNEES_SCOLAIRES = Array.from({ length: 31 }, (_, i) => {
  const y = 2000 + i
  return `${y}-${y + 1}`
})

// Années concours (ex: 2000 à 2030)
export const ANNEES_CONCOURS = Array.from({ length: 31 }, (_, i) => String(2000 + i))

export const ALL_TAGS = [
  'Correction incluse',
  'Annale officielle',
  'Difficulté facile',
  'Difficulté moyenne',
  'Difficulté difficile',
  'Sujet type',
  'Avec schémas',
  'Avec formules',
]

export const CONTENT_TYPES = [
  { value: 'sujet_seul',      label: 'Sujet seul',        desc: 'Énoncé uniquement' },
  { value: 'sujet_corrige',   label: 'Sujet + Corrigé',   desc: 'Avec correction détaillée' },
  { value: 'cours_exercices', label: 'Cours + Exercices', desc: 'Support de cours complet' },
  { value: 'annale',          label: 'Annale officielle', desc: 'Document officiel scanné/retranscrit' },
]

export const ANNOTATION_TYPES = [
  { value: 'note',       label: 'Note',                icon: '💡', color: 'amber',  desc: 'Conseil pratique' },
  { value: 'rappel',     label: 'Rappel de cours',     icon: '📗', color: 'sage',   desc: 'Concept clé' },
  { value: 'info',       label: 'Information',         icon: 'ℹ',  color: 'blue',   desc: 'Information utile' },
  { value: 'attention',  label: 'Attention / Piège',   icon: '⚠',  color: 'ruby',   desc: 'Erreur fréquente' },
  { value: 'definition', label: 'Définition',          icon: '📖', color: 'blue',   desc: 'Définition' },
  { value: 'theoreme',   label: 'Théorème / Propriété',icon: '🔷', color: 'sage',   desc: 'Propriété mathématique' },
  { value: 'exemple',    label: 'Exemple résolu',      icon: '✏',  color: 'neutre', desc: 'Exemple' },
  { value: 'correction', label: 'Correction (masquée)',icon: '✓',  color: 'sage',   desc: 'Révélée après soumission' },
]

export const STRUCTURE_BLOCS = [
  { value: 'partie',   label: 'Partie',   icon: 'Ⅰ',  color: 'violet', desc: 'Section principale numérotée' },
  { value: 'exercice', label: 'Exercice', icon: '✎',  color: 'gold',   desc: 'Exercice numéroté avec barème' },
  { value: 'enonce',   label: 'Énoncé',   icon: '¶',  color: 'neutre', desc: 'Contexte et données' },
  { value: 'question', label: 'Question', icon: 'Q',  color: 'gold',   desc: 'Question numérotée' },
  { value: 'bareme',   label: 'Barème',   icon: '⚖',  color: 'neutre', desc: 'Tableau de répartition des points' },
]

export const MEDIA_BLOCS = [
  { value: 'formula', label: 'Formule / Équation', icon: '∑',    desc: 'Ouvre la modal KaTeX' },
  { value: 'schema',  label: 'Schéma / Figure',    icon: '🖼',   desc: 'Placeholder upload image' },
  { value: 'tableau', label: 'Tableau',            icon: '⊞',    desc: 'Grille éditable' },
  { value: 'code',    label: 'Bloc de code',       icon: '</>',  desc: 'Syntaxe highlight' },
]

export const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

export interface OutlineItem {
  id: string
  type: 'partie' | 'exercice' | 'question'
  label: string
  numero: string | number
  depth: number
}

// ─── Helpers ────────────────────────────────────────────────────

/** Retourne la liste des séries disponibles selon examType + baccType */
export function getSeriesForExam(examType: ExamType | '', baccType?: BaccType | ''): readonly string[] {
  if (examType === 'BACC') {
    if (baccType === 'General') return BACC_GENERAL_SERIES
    if (baccType === 'Technique') return BACC_TECHNIQUE_SERIES
  }
  return []
}

/** Retourne la valeur "niveau" dérivée (pour compat SQL/ancien code) */
export function deriveNiveau(meta: SubjectMetadata): string {
  if (meta.examType === 'BACC') return 'BAC'
  if (meta.examType === 'BEPC' || meta.examType === 'CEPE') return meta.examType
  return meta.examType || ''
}
