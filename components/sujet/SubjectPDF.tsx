'use client'

/**
 * SubjectPDF — Génération d'un document PDF moderne et tracé pour un sujet.
 *
 * Trois sections :
 *  1. Couverture — logo + métadonnées du sujet + date de téléchargement
 *  2. Contenu    — rendu du JSON TipTap (parties / exercices / questions / annotations)
 *  3. Pied de page (sur chaque page) — code filigrane + email utilisateur + date
 *
 * Le **filigrane diagonal** est répété sur chaque page : code unique +
 * email/nom de l'utilisateur. Si quelqu'un revend ou diffuse le PDF, on remonte
 * directement à la ligne SubjectDownload correspondante.
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image as PDFImage,
} from '@react-pdf/renderer'
import type { AICorrectionResult, AICorrectionItem } from '@/lib/ai/schemas'

/* ─────────────────────────────────────────────────────────────────
   Polices — on utilise les polices PDF intégrées (Times/Helvetica/Courier)
   que l'on remplace maintenant par les vraies polices du site.
   Le bug "unsupported number" de fontkit est contourné via le
   callback de césure. Font.register() est dans ensureFonts() pour
   éviter "CJS module can't be async" avec Turbopack.
   ──────────────────────────────────────────────────────────────── */

let _fontsRegistered = false

export function ensureFonts() {
  if (_fontsRegistered) return
  _fontsRegistered = true

  Font.register({
    family: 'Cormorant Garamond',
    fonts: [
      { src: '/fonts/CG-400.woff', fontWeight: 400 },
      { src: '/fonts/CG-400i.woff', fontWeight: 400, fontStyle: 'italic' },
      { src: '/fonts/CG-600.woff', fontWeight: 600 },
      { src: '/fonts/CG-700.woff', fontWeight: 700 },
      { src: '/fonts/CG-700i.woff', fontWeight: 700, fontStyle: 'italic' },
    ],
  })
  Font.register({
    family: 'DM Sans',
    fonts: [
      { src: '/fonts/DMS-400.woff', fontWeight: 400 },
      { src: '/fonts/DMS-400i.woff', fontWeight: 400, fontStyle: 'italic' },
      { src: '/fonts/DMS-500.woff', fontWeight: 500 },
      { src: '/fonts/DMS-700.woff', fontWeight: 700 },
      { src: '/fonts/DMS-700i.woff', fontWeight: 700, fontStyle: 'italic' },
    ],
  })
  Font.register({ family: 'DM Mono', fonts: [{ src: '/fonts/DMM-400.woff', fontWeight: 400 }] })

  Font.registerHyphenationCallback((word) => [word])
}

/* ─────────────────────────────────────────────────────────────────
   Store des formules LaTeX pré-rendues en PNG (rempli par ConsultClient
   avant la génération du PDF via setLatexImages).
   ──────────────────────────────────────────────────────────────── */
let _latexImages: Record<string, string> = {}
export function setLatexImages(map: Record<string, string>) {
  _latexImages = map
}

const styles = StyleSheet.create({
  /* ───── PAGE & LAYOUT ───── */
  page: {
    paddingTop: 52,
    paddingBottom: 64,
    paddingHorizontal: 48,
    fontFamily: 'DM Sans',
    fontSize: 11,
    lineHeight: 1.55,
    color: '#1a1a1a',
    backgroundColor: '#ffffff'
  },

  /* ───── HEADER (chaque page sauf cover) ───── */
  pageHeader: {
    position: 'absolute',
    top: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 8,
    color: '#999',
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
    borderBottomStyle: 'solid'
  },
  pageHeaderLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  pageHeaderTitle: {
    color: '#666',
    fontSize: 8,
    maxWidth: 360
  },

  compactExamHeader: {
    marginTop: 4,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 0.7,
    borderBottomColor: '#d8d2c0',
    borderBottomStyle: 'solid'
  },
  compactExamTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14
  },
  compactExamCol: {
    flex: 1,
    flexDirection: 'column',
    gap: 2
  },
  compactExamLine: {
    fontSize: 9,
    color: '#202020',
    lineHeight: 1.35
  },
  compactExamLineStrong: {
    fontSize: 9,
    color: '#111',
    fontWeight: 700,
    lineHeight: 1.35
  },
  compactExamTitle: {
    fontFamily: 'Cormorant Garamond',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 700,
    color: '#0c0c0e',
    lineHeight: 1.2
  },
  compactExamSubTitle: {
    marginTop: 2,
    textAlign: 'center',
    fontSize: 9,
    color: '#666'
  },

  /* ───── FOOTER (chaque page) ───── */
  pageFooter: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    fontSize: 7,
    color: '#888',
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#e5e5e5',
    borderTopStyle: 'solid'
  },
  pageFooterCol: { flexDirection: 'column', gap: 2 },
  pageFooterCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1
  },
  pageFooterLabel: { color: '#aaa', fontSize: 6 },
  pageFooterValue: { color: '#333', fontSize: 8 },
  pageNumber: { color: '#999' },

  /* ───── FILIGRANE diagonale ───── */
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    opacity: 0.06
  },
  watermarkLine: {
    fontSize: 26,
    color: '#000',
    textAlign: 'center',
    fontWeight: 700
  },

  /* ───── COVER ───── */
  cover: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 60
  },
  coverTopBar: {
    height: 4,
    backgroundColor: '#C9A84C',
    width: 80,
    marginBottom: 32
  },
  coverEyebrow: {
    fontSize: 9,
    color: '#C9A84C', marginBottom: 12
  },
  coverTitle: {
    fontFamily: 'Cormorant Garamond',
    fontSize: 40,
    color: '#0c0c0e',
    fontWeight: 700,
    lineHeight: 1.1,

    marginBottom: 16
  },
  coverSubtitle: {
    fontSize: 14,
    color: '#444',
    lineHeight: 1.6
  },
  coverDivider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 20
  },
  coverMetaGrid: {
    flexDirection: 'column',
    gap: 8
  },
  coverMetaRow: {
    flexDirection: 'row',
    fontSize: 10
  },
  coverMetaLabel: {
    width: 130,
    color: '#888', fontSize: 8
  },
  coverMetaValue: {
    flex: 1,
    color: '#222',
    fontSize: 10
  },
  coverFooter: {
    flexDirection: 'column',
    gap: 4,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    borderTopStyle: 'solid'
  },
  coverLogo: {
    fontFamily: 'Cormorant Garamond',
    fontSize: 26,
    color: '#0c0c0e',
    fontWeight: 700,
    marginBottom: 4
  },
  coverLogoGold: {
    color: '#C9A84C'
  },
  coverFooterLine: {
    fontSize: 8,
    color: '#888'
  },

  /* ───── CONTENT BLOCKS ───── */
  h1: {
    fontFamily: 'Cormorant Garamond',
    fontSize: 22,
    fontWeight: 700,
    color: '#0c0c0e',
    marginTop: 16,
    marginBottom: 8
  },
  h2: {
    fontFamily: 'Cormorant Garamond',
    fontSize: 17,
    fontWeight: 700,
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 6
  },
  h3: {
    fontFamily: 'Cormorant Garamond',
    fontSize: 14,
    fontWeight: 600,
    color: '#1a1a1a',
    marginTop: 10,
    marginBottom: 4
  },
  paragraph: {
    fontSize: 11,
    color: '#222',
    marginBottom: 6,
    lineHeight: 1.6
  },
  bullet: {
    flexDirection: 'row',
    fontSize: 11,
    marginBottom: 3,
    color: '#222'
  },
  bulletDot: {
    width: 12,
    color: '#C9A84C'
  },
  blockquote: {
    marginVertical: 6,
    padding: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#C9A84C',
    borderLeftStyle: 'solid',
    backgroundColor: '#fafaf7'
  },
  horizontalRule: {
    height: 1,
    backgroundColor: '#d8d2c0',
    marginVertical: 10
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginVertical: 8,
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderColor: '#d8d2c0',
    borderStyle: 'solid'
  },
  tableRow: {
    flexDirection: 'row'
  },
  tableCell: {
    flex: 1,
    padding: 5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#d8d2c0',
    borderStyle: 'solid',
    minHeight: 20
  },
  tableHeader: {
    backgroundColor: '#ede8d8'
  },
  tableHeaderText: {
    fontWeight: 700,
    color: '#0c0c0e'
  },
  tableRowAlt: {
    backgroundColor: '#fafaf7'
  },
  tableText: {
    fontSize: 9,
    color: '#333',
    lineHeight: 1.45
  },

  /* ─── Code block ─── */
  codeBlock: {
    marginVertical: 8,
    padding: 10,
    backgroundColor: '#1c1c2a',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#3a3a54',
    borderStyle: 'solid'
  },
  codeBlockLang: {
    fontFamily: 'DM Mono',
    fontSize: 7,
    color: '#89b4fa',
    marginBottom: 5},
  codeBlockText: {
    fontFamily: 'DM Mono',
    fontSize: 9,
    color: '#cdd6f4',
    lineHeight: 1.65
  },

  /* ─── Marks inline : subscript, superscript, link ─── */
  // @react-pdf/renderer ne sait pas gérer la propriété verticalAlign
  // nativement ; on l'approxime par fontSize réduit. Acceptable en lecture.
  markSubscript: {
    fontSize: 8
  },
  markSuperscript: {
    fontSize: 8
  },
  markLink: {
    color: '#3a6594',
    textDecoration: 'underline'
  },
  markBold: {
    fontWeight: 700
  },
  markItalic: {
    fontStyle: 'italic'
  },
  markUnderline: {
    textDecoration: 'underline'
  },
  markStrike: {
    textDecoration: 'line-through'
  },
  markCode: {
    fontSize: 10,
    backgroundColor: '#f3efe3'
  },

  /* ─── Partie / Exercice / Question / Énoncé / Annotation / Formula ─── */
  partie: {
    marginTop: 14,
    marginBottom: 12,
    padding: 12,
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#C9A84C',
    borderLeftStyle: 'solid',
    backgroundColor: '#fafaf7',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4
  },
  partieLabel: {
    fontSize: 8,
    color: '#C9A84C', marginBottom: 4
  },
  partieTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0c0c0e',
    marginBottom: 6
  },

  exercice: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    borderWidth: 0.7,
    borderColor: '#d8d2c0',
    borderStyle: 'dashed',
    borderRadius: 3,
    backgroundColor: '#fdfcf8'
  },
  exerciceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  exerciceLabel: {
    fontSize: 8,
    color: '#C9A84C'},
  exercicePoints: {
    fontSize: 8,
    color: '#666',
    fontFamily: 'DM Mono'
  },

  enonce: {
    marginVertical: 8,
    padding: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#999',
    borderLeftStyle: 'solid',
    backgroundColor: '#f7f7f5',
    fontStyle: 'italic'
  },
  enonceLabel: {
    fontSize: 7,
    color: '#888', marginBottom: 3,
    fontStyle: 'normal'
  },

  question: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 4,
    padding: 6,
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: '#e5e5e5',
    borderStyle: 'solid',
    borderRadius: 2
  },
  questionNum: {
    width: 24,
    color: '#C9A84C',
    fontFamily: 'DM Mono',
    fontSize: 11,
    fontWeight: 700
  },
  questionContent: {
    flex: 1,
    fontSize: 11,
    color: '#222'
  },
  questionPoints: {
    fontSize: 8,
    color: '#888',
    marginLeft: 6
  },

  annotation: {
    marginVertical: 6,
    padding: 8,
    borderRadius: 3,
    borderWidth: 0.5,
    borderStyle: 'solid'
  },
  annotationAmber: { backgroundColor: '#fff8e6', borderColor: '#f3d97a' },
  annotationSage:  { backgroundColor: '#eef7f1', borderColor: '#a3cfb3' },
  annotationBlue:  { backgroundColor: '#eef3fb', borderColor: '#9bb7e0' },
  annotationRuby:  { backgroundColor: '#fbeef0', borderColor: '#e09bab' },
  annotationLabel: {
    fontSize: 7,
    color: '#666', marginBottom: 3
  },

  formula: {
    marginVertical: 8,
    padding: 10,
    backgroundColor: '#f7f7f5',
    borderWidth: 0.5,
    borderColor: '#e5e5e5',
    borderStyle: 'solid',
    borderRadius: 3,
    alignItems: 'center'
  },
  formulaLatex: {
    fontSize: 9,
    color: '#1a1a5a',
    fontFamily: 'DM Mono',
    textAlign: 'center',
  },
  formulaBlock: {
    backgroundColor: '#f7f7fb',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginVertical: 5,
    borderRadius: 2,
    borderLeftWidth: 1,
    borderLeftColor: '#b0b0cc',
    borderLeftStyle: 'solid',
  },
  hrRule: {
    height: 0.5,
    backgroundColor: '#d0d0d0',
    marginVertical: 6,
  },

  schemaPlaceholder: {
    marginVertical: 8,
    padding: 16,
    backgroundColor: '#f0f0ee',
    borderWidth: 0.5,
    borderColor: '#d5d5d0',
    borderStyle: 'dashed',
    borderRadius: 3,
    alignItems: 'center'
  },
  schemaPlaceholderText: {
    fontSize: 9,
    color: '#888',
    fontStyle: 'italic'
  },

  /* ───── AI CORRECTION (inline après chaque question) ───── */
  aiCorr: {
    marginTop: 4,
    marginBottom: 10,
    padding: 9,
    paddingLeft: 12,
    borderLeftWidth: 2.5,
    borderLeftColor: '#6EAA8C',
    borderLeftStyle: 'solid',
    backgroundColor: '#f5faf7',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3
  },
  aiCorrHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6
  },
  aiCorrLabel: {
    fontSize: 7,
    color: '#6EAA8C', fontWeight: 700
  },
  aiCorrVerdict: {
    fontSize: 7,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    overflow: 'hidden',
    fontWeight: 700},
  aiCorrVerdictCorrect:   { color: '#3f7758', backgroundColor: '#dff0e6' },
  aiCorrVerdictPartial:   { color: '#8a6c1c', backgroundColor: '#fbf1cb' },
  aiCorrVerdictIncorrect: { color: '#9a3a4f', backgroundColor: '#fbe1e6' },
  aiCorrVerdictMissing:   { color: '#666',    backgroundColor: '#ececec' },
  aiCorrVerdictModel:     { color: '#3a6594', backgroundColor: '#e3ecf7' },

  aiCorrUserAnswer: {
    marginTop: 4,
    marginBottom: 4,
    padding: 6,
    paddingLeft: 9,
    borderLeftWidth: 1.5,
    borderLeftColor: '#9bb7e0',
    borderLeftStyle: 'solid',
    backgroundColor: '#f0f4fb',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2
  },
  aiCorrSubLabel: {
    fontSize: 6.5,
    color: '#888', marginBottom: 2,
    fontWeight: 700
  },
  aiCorrText: {
    fontSize: 10,
    color: '#222',
    lineHeight: 1.5
  },
  aiCorrFeedback: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: '#dcebe2',
    borderTopStyle: 'solid',
    fontSize: 9.5,
    color: '#3f5f4e',
    fontStyle: 'italic',
    lineHeight: 1.5
  },
  aiLatexInline: {
    fontSize: 10,
    color: '#2a4a6a'
  },

  /* ───── Corrections supplémentaires (items IA non consommés) ───── */
  extraCorrections: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#6EAA8C',
    borderTopStyle: 'solid'
  },
  extraCorrectionsTitle: {
    fontFamily: 'Cormorant Garamond',
    fontSize: 14,
    fontWeight: 700,
    color: '#3f7758',
    marginBottom: 8
  },
  extraCorrectionLabel: {
    fontFamily: 'DM Mono',
    fontSize: 8,
    color: '#888',
    marginBottom: 3},

  /* ───── AI SUMMARY (fin de PDF avec corrections) ───── */
  aiSummary: {
    marginTop: 24,
    padding: 14,
    borderWidth: 0.7,
    borderColor: '#C9A84C',
    borderStyle: 'solid',
    borderRadius: 4,
    backgroundColor: '#fdfcf6'
  },
  aiSummaryTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0c0c0e',
    marginBottom: 8},
  aiSummaryRow: {
    marginTop: 6
  },
  aiSummaryRowLabel: {
    fontSize: 8,
    color: '#C9A84C', fontWeight: 700,
    marginBottom: 3
  },
  aiSummaryItem: {
    fontSize: 10,
    color: '#222',
    marginBottom: 2,
    lineHeight: 1.5
  }
})

/* ─── Watermark composant ───────────────────────────────────────── */
function Watermark({ code, userLabel }: { code: string; userLabel: string }) {
  // 5 lignes diagonales, alternant code et email/nom — couvre toute la page.
  const lines = [code, userLabel, code, userLabel, code]
  return (
    <View style={styles.watermarkContainer} fixed>
      {lines.map((line, i) => (
        <Text key={i} style={styles.watermarkLine}>
          {line}
        </Text>
      ))}
    </View>
  )
}

/* ─── Renderer récursif des nodes TipTap ────────────────────────── */
function renderInline(content: any[]): string {
  if (!Array.isArray(content)) return ''
  return sanitizePDFText(
    content
      .map((c) => {
        if (typeof c?.text === 'string') return c.text
        if (c?.type === 'inlineMath') return `$${c?.attrs?.latex || ''}$`
        return ''
      })
      .join('')
  )
}

/**
 * Variante riche : retourne un tableau de Text @react-pdf qui préserve
 * les marks TipTap (subscript, superscript, link, bold/italic/underline/strike/code).
 * À utiliser quand on veut afficher le contenu inline avec son styling
 * réel (paragraphes, questions, headings).
 *
 * Les `inlineMath` deviennent des Text Courier comme dans le bloc IA.
 */
function applyMarks(node: React.ReactNode, marks: any[] | undefined, key: string): React.ReactNode {
  if (!marks || marks.length === 0) return node
  const styles_to_apply: any[] = []
  let isLink = false
  for (const mark of marks) {
    switch (mark?.type) {
      case 'bold':        styles_to_apply.push(styles.markBold); break
      case 'italic':      styles_to_apply.push(styles.markItalic); break
      case 'underline':   styles_to_apply.push(styles.markUnderline); break
      case 'strike':      styles_to_apply.push(styles.markStrike); break
      case 'subscript':   styles_to_apply.push(styles.markSubscript); break
      case 'superscript': styles_to_apply.push(styles.markSuperscript); break
      case 'code':        styles_to_apply.push(styles.markCode); break
      case 'link':        styles_to_apply.push(styles.markLink); isLink = true; break
      default: break
    }
  }
  if (styles_to_apply.length === 0 && !isLink) return node
  return (
    <Text key={key} style={styles_to_apply}>
      {node}
    </Text>
  )
}

function renderInlineWithMarks(content: any[]): React.ReactNode[] {
  if (!Array.isArray(content)) return []
  const out: React.ReactNode[] = []
  content.forEach((c, i) => {
    const key = `i-${i}`
    if (typeof c?.text === 'string') {
      out.push(applyMarks(sanitizePDFText(c.text), c.marks, key))
      return
    }
    if (c?.type === 'inlineMath') {
      const latex = sanitizePDFText(c?.attrs?.latex || '')
      out.push(
        <Text key={key} style={styles.aiLatexInline}>
          ${latex}$
        </Text>,
      )
      return
    }
    if (c?.type === 'hardBreak') {
      out.push(<Text key={key}>{'\n'}</Text>)
      return
    }
  })
  return out
}

/* ─── AI corrections inline ──────────────────────────────────────── */
interface RenderState {
  itemsByOrder?: AICorrectionItem[]
  counter: { value: number }
  mode: 'SUBMISSION' | 'DIRECT'
  numbering: {
    partie: number
    exercice: number
    question: number
  }
}

function resolveNumero(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed || trimmed === '?') return null
    const parsed = Number(trimmed)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }
  return null
}

function getDisplayNumero(
  state: RenderState | undefined,
  key: keyof RenderState['numbering'],
  rawValue: unknown,
): number {
  const parsed = resolveNumero(rawValue)
  if (!state) return parsed ?? 1
  if (parsed) {
    state.numbering[key] = Math.max(state.numbering[key], parsed)
    return parsed
  }
  state.numbering[key] += 1
  return state.numbering[key]
}

const VERDICT_STYLE: Record<string, { label: string; style: any }> = {
  correct:   { label: 'Correct',         style: styles.aiCorrVerdictCorrect },
  partial:   { label: 'Partiel',         style: styles.aiCorrVerdictPartial },
  incorrect: { label: 'Incorrect',       style: styles.aiCorrVerdictIncorrect },
  missing:   { label: 'Non répondu',     style: styles.aiCorrVerdictMissing },
  model:     { label: 'Correction modèle', style: styles.aiCorrVerdictModel }
}

/**
 * Découpe le texte en segments LaTeX / texte ordinaire.
 * NB : on n'utilise PAS de fontFamily différente dans le <Text> enfant
 * pour éviter le changement de police imbriqué qui fait planter fontkit.
 */
function renderInlineLatex(text: string): React.ReactNode[] {
  if (!text) return []
  const safe = sanitizePDFText(text)
  const re = /(\$\$[\s\S]+?\$\$)|(\$[^$\n]+?\$)/g
  const parts: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  let i = 0
  while ((match = re.exec(safe)) !== null) {
    if (match.index > last) parts.push(safe.slice(last, match.index))
    // Même police que le parent — juste une couleur distincte
    parts.push(<Text key={`l-${i++}`} style={styles.aiLatexInline}>{match[0]}</Text>)
    last = match.index + match[0].length
  }
  if (last < safe.length) parts.push(safe.slice(last))
  return parts.length > 0 ? parts : [safe]
}

/**
 * Map des caractères Unicode courants vers des équivalents Latin-1.
 * Les polices PDF intégrées (Times/Helvetica/Courier) ne supportent que
 * Latin-1 — tout caractère absent du jeu provoque une erreur de métrique
 * fontkit ("unsupported number"). On translittère donc les symboles
 * mathématiques, flèches et ponctuation typographique en équivalents ASCII.
 */
const UNICODE_TRANSLITERATION: Record<string, string> = {
  // Flèches
  '←': '<-', '→': '->', '↔': '<->',
  '⇐': '<=', '⇒': '=>', '⇔': '<=>',
  '↑': '^', '↓': 'v',
  // Comparaisons
  '≤': '<=', '≥': '>=', '≠': '!=',
  '≈': '~=', '≡': '==',
  // Opérateurs
  '±': '+/-', '×': 'x', '÷': '/', '−': '-',
  '∙': '.', '•': '·',
  // Ensembles
  '∈': 'in', '∉': 'notin',
  '∩': 'inter', '∪': 'union',
  '⊂': 'subset', '⊆': 'subseteq',
  '∀': 'forall', '∃': 'exists',
  // Lettres grecques courantes (math)
  'α': 'alpha', 'β': 'beta', 'γ': 'gamma',
  'δ': 'delta', 'ε': 'epsilon', 'θ': 'theta',
  'λ': 'lambda', 'μ': 'mu', 'π': 'pi',
  'ρ': 'rho', 'σ': 'sigma', 'τ': 'tau',
  'φ': 'phi', 'χ': 'chi', 'ψ': 'psi',
  'ω': 'omega', 'Δ': 'Delta', 'Σ': 'Sigma',
  'Ω': 'Omega', 'Π': 'Pi',
  // Math
  '∞': 'inf', '√': 'sqrt', '∫': 'integ',
  '∂': 'd', '∇': 'nabla', '∑': 'Sum',
  '∏': 'Prod',
  // Ponctuation typographique
  '…': '...', '–': '-', '—': '--',
  '‘': "'", '’': "'",
  '“': '"', '”': '"',
  // Espaces spéciaux
  ' ': ' ', ' ': ' ', ' ': ' ', ' ': ' ', ' ': ' ',
}

function sanitizePDFText(text: string): string {
  if (!text) return ''
  let s = text
  try {
    s = s.normalize('NFC')
  } catch { /* ignore */ }
  s = s
    // Contrôles ASCII (sauf newline et tab) + DEL
    .replace(/[ --]/g, '')
    // Zero-width / formatting / BOM / RTL / LRM / word joiners
    .replace(/[​-‏‪-‮⁠-⁯﻿]/g, '')
    // Surrogates non appairés
    .replace(/[�-�]/g, '')

  // Translittération Unicode -> Latin-1 (les polices PDF builtin ne supportent
  // que Latin-1 ; tout caractère hors plage casse fontkit).
  let out = ''
  for (const ch of s) {
    const code = ch.charCodeAt(0)
    if (code <= 0xFF) {
      out += ch
    } else if (UNICODE_TRANSLITERATION[ch]) {
      out += UNICODE_TRANSLITERATION[ch]
    } else {
      // Décompose pour récupérer la lettre de base si possible (lettres
      // accentuées rares, etc.) ; sinon remplace par '?'.
      const decomposed = ch.normalize('NFD')
      const fallback = decomposed.split('').filter(c => c.charCodeAt(0) <= 0xFF).join('')
      out += fallback || '?'
    }
  }
  return out
}

/**
 * Convertit les commandes LaTeX en texte lisible pour les polices PDF builtin
 * (Latin-1 uniquement — pas de KaTeX dans le PDF).
 * Ex : $\frac{a}{b}$ → (a)/(b)  /  $\rightarrow$ → ->
 */
function simplifyLatex(latex: string): string {
  let s = latex
  // Expansion itérative des groupes imbriqués (jusqu'à 5 niveaux)
  for (let pass = 0; pass < 5; pass++) {
    s = s
      .replace(/\\(?:text|mathrm|textbf|textit|textrm|mathbf|mathit|mathcal|operatorname)\{([^{}]*)\}/g, '$1')
      .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)')
      .replace(/\\left[\(\[{|]/g, '(').replace(/\\right[\)\]}|]/g, ')')
  }
  s = s
    .replace(/\\rightarrow/g, '->').replace(/\\to\b/g, '->')
    .replace(/\\leftarrow/g, '<-')
    .replace(/\\Rightarrow/g, '=>').replace(/\\Leftarrow/g, '<=')
    .replace(/\\leftrightarrow/g, '<->').replace(/\\Leftrightarrow/g, '<=>')
    .replace(/\\geq\b/g, '>=').replace(/\\ge\b/g, '>=')
    .replace(/\\leq\b/g, '<=').replace(/\\le\b/g, '<=')
    .replace(/\\neq\b/g, '!=').replace(/\\ne\b/g, '!=')
    .replace(/\\approx\b/g, '~=').replace(/\\equiv\b/g, '==')
    .replace(/\\times\b/g, 'x').replace(/\\cdot\b/g, '.')
    .replace(/\\pm\b/g, '+/-').replace(/\\infty\b/g, 'inf')
    .replace(/\\[,;:!]/g, ' ').replace(/\\\\/g, ' ')
    .replace(/\\_/g, '_').replace(/\\\^/g, '^')
    .replace(/\\%/g, '%')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/\^\{2\}/g, '²').replace(/\^\{3\}/g, '³')
    .replace(/[{}]/g, '')
    .replace(/\^2(?!\d)/g, '²').replace(/\^3(?!\d)/g, '³')
    // Simplifier les fractions avec parens inutiles : (a)/(b) → a/b
    .replace(/\(([^()]+)\)\/\(([^()]+)\)/g, '$1/$2')
    .replace(/\s+/g, ' ')
    .trim()
  return sanitizePDFText(s)
}

/**
 * Convertit le markdown inline en texte brut pour react-pdf.
 * On ne crée AUCUN <Text> imbriqué — zéro nesting, zéro changement de
 * fontFamily/fontWeight dans un sous-arbre Text, ce qui évite les erreurs
 * de métriques fontkit ("unsupported number").
 * Le gras/italique est supprimé ; le LaTeX $...$ est converti en texte
 * lisible via simplifyLatex.
 */
function renderInlineMarkdown(text: string): string {
  if (!text) return ''
  return sanitizePDFText(text)
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/(?<!\$[^$]*)_([^_]+)_(?![^$]*\$)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Convertir LaTeX $$...$$ et $...$ en texte lisible
    .replace(/\$\$([^$]+)\$\$/g, (_, l) => simplifyLatex(l))
    .replace(/\$([^$\n]+)\$/g, (_, l) => simplifyLatex(l))
}

/**
 * Parse inline markdown → ReactNode[]: **bold**, *italic*, `code`, $latex$.
 * Utilise les variantes built-in (Helvetica-Bold/Oblique, Courier) pour éviter
 * le chargement de polices custom. Nécessite que pdfkit soit patché.
 */
function renderInlineRich(text: string): React.ReactNode[] {
  if (!text) return []
  const re = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/g
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let k = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(sanitizePDFText(text.slice(lastIndex, match.index)))
    }
    const token = match[0]
    if (token.startsWith('**')) {
      // fontStyle:'normal' évite que l'héritage italic du parent donne Helvetica-BoldOblique
      nodes.push(
        <Text key={`ri-${k++}`} style={{ fontFamily: 'DM Sans', fontStyle: 'normal' }}>
          {sanitizePDFText(token.slice(2, -2))}
        </Text>
      )
    } else if (token.startsWith('*')) {
      // fontFamily Helvetica-Oblique + reset fontWeight pour éviter Helvetica-BoldOblique
      nodes.push(
        <Text key={`ri-${k++}`} style={{ fontFamily: 'DM Sans', fontStyle: 'normal' }}>
          {sanitizePDFText(token.slice(1, -1))}
        </Text>
      )
    } else if (token.startsWith('`')) {
      nodes.push(
        <Text key={`ri-${k++}`} style={{ fontFamily: 'DM Mono', fontStyle: 'normal', fontSize: 9, backgroundColor: '#f0ede4' }}>
          {sanitizePDFText(token.slice(1, -1))}
        </Text>
      )
    } else if (token.startsWith('$$')) {
      nodes.push(
        <Text key={`ri-${k++}`} style={{ fontFamily: 'DM Mono', fontStyle: 'normal', color: '#2a4a6a' }}>
          {simplifyLatex(token.slice(2, -2))}
        </Text>
      )
    } else if (token.startsWith('$')) {
      nodes.push(
        <Text key={`ri-${k++}`} style={{ fontFamily: 'DM Mono', fontStyle: 'normal', color: '#2a4a6a' }}>
          {simplifyLatex(token.slice(1, -1))}
        </Text>
      )
    }
    lastIndex = match.index + token.length
  }
  if (lastIndex < text.length) {
    nodes.push(sanitizePDFText(text.slice(lastIndex)))
  }
  return nodes.length > 0 ? nodes : [sanitizePDFText(text)]
}

/**
 * Parse du markdown multi-ligne (listes, titres, paragraphes, bold, italic, LaTeX)
 * en éléments @react-pdf/renderer. Utilisé pour les textes IA dans le PDF.
 */
function renderMdTable(tableLines: string[], key: number, baseStyle?: any): React.ReactElement {
  const rows = tableLines.map(line =>
    line.replace(/^\||\|$/g, '').split('|').map(c => c.trim())
  )
  const cellTxt = baseStyle ? { ...(baseStyle as object), fontSize: Math.max(8, ((baseStyle as any).fontSize || 9) - 1) } : styles.tableText
  return (
    <View key={key} style={[styles.table, { marginVertical: 4 }]}>
      {rows.map((cells, rowIdx) => {
        const isHeader = rowIdx === 0
        const isAlt = !isHeader && rowIdx % 2 === 0
        return (
          <View key={rowIdx} style={[styles.tableRow, isHeader ? styles.tableHeader : (isAlt ? styles.tableRowAlt : {})]}>
            {cells.map((cell, cellIdx) => (
              <View key={cellIdx} style={styles.tableCell}>
                <Text style={[cellTxt, isHeader ? styles.tableHeaderText : {}]}>
                  {renderInlineMarkdown(cell)}
                </Text>
              </View>
            ))}
          </View>
        )
      })}
    </View>
  )
}

function renderMarkdownToPDF(text: string, baseStyle?: any): React.ReactElement[] {
  if (!text) return []
  const lines = text.split('\n')
  const elements: React.ReactElement[] = []
  let key = 0
  let i = 0
  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (!trimmed) { i++; continue }

    // ── Séparateur horizontal ---
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      elements.push(<View key={key++} style={styles.hrRule} />)
      i++; continue
    }

    // ── Bloc code ```lang ... ```
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length) {
        const cl = lines[i]
        if (cl.trim() === '```' || cl.trim().startsWith('```')) { i++; break }
        codeLines.push(cl)
        i++
      }
      // Render code block — texte brut, pas de parsing markdown à l'intérieur
      const codeText = codeLines.map(l => sanitizePDFText(l)).join('\n')
      elements.push(
        <View key={key++} style={styles.codeBlock}>
          {lang ? <Text style={styles.codeBlockLang}>{lang}</Text> : null}
          <Text style={styles.codeBlockText}>{codeText}</Text>
        </View>
      )
      continue
    }

    // ── Bloc LaTeX $$...$$  (peut s'étaler sur plusieurs lignes)
    if (trimmed.startsWith('$$')) {
      const latexLines: string[] = []
      const firstContent = trimmed.slice(2)
      if (firstContent.endsWith('$$') && firstContent.length > 2) {
        // Sur une seule ligne : $$...$$
        latexLines.push(firstContent.slice(0, -2))
        i++
      } else {
        latexLines.push(firstContent)
        i++
        while (i < lines.length) {
          const l = lines[i].trim()
          if (l.endsWith('$$')) {
            latexLines.push(l.slice(0, -2))
            i++; break
          }
          latexLines.push(l)
          i++
        }
      }
      const combined = latexLines.join(' ').trim()
      if (combined) {
        const img = _latexImages[combined]
        elements.push(
          img
            ? (
              <View key={key++} style={[styles.formulaBlock, { alignItems: 'center' }]}>
                <PDFImage src={img} style={{ maxWidth: '100%' }} />
              </View>
            )
            : (
              <View key={key++} style={styles.formulaBlock}>
                <Text style={styles.formulaLatex}>{simplifyLatex(combined)}</Text>
              </View>
            )
        )
      }
      continue
    }

    // ── Table markdown : lignes commençant et finissant par |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length) {
        const tl = lines[i].trim()
        if (!tl.startsWith('|')) break
        if (!tl.match(/^\|[-:| ]+\|$/)) tableLines.push(tl) // skip séparateur |---|
        i++
      }
      if (tableLines.length > 0) elements.push(renderMdTable(tableLines, key++, baseStyle))
      continue
    }

    // ── Heading #{1,6}
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const hStyle = level <= 2
        ? { ...(baseStyle || styles.aiCorrText), fontSize: 11, fontWeight: 700 as const }
        : level <= 4
          ? { ...(baseStyle || styles.aiCorrText), fontSize: 10, fontWeight: 700 as const }
          : { ...(baseStyle || styles.aiCorrText), fontSize: 9, fontStyle: 'italic' as const }
      elements.push(<Text key={key++} style={hStyle}>{renderInlineRich(headingMatch[2])}</Text>)
      i++; continue
    }

    // Ligne blockquote vide (> seul) — ignorer
    if (trimmed === '>') { i++; continue }

    // Bullets: - item  * item  > item (blockquote style IA)
    const bulletMatch = trimmed.match(/^[-*>]\s+(.+)$/)
    if (bulletMatch) {
      elements.push(
        <View key={key++} style={{ flexDirection: 'row', marginBottom: 1 }}>
          <Text style={{ ...(baseStyle || styles.aiCorrText), width: 12 }}>{'•'}</Text>
          <Text style={{ ...(baseStyle || styles.aiCorrText), flex: 1 }}>{renderInlineRich(bulletMatch[1])}</Text>
        </View>
      )
      i++; continue
    }
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/)
    if (numberedMatch) {
      elements.push(
        <View key={key++} style={{ flexDirection: 'row', marginBottom: 1 }}>
          <Text style={{ ...(baseStyle || styles.aiCorrText), width: 18 }}>{numberedMatch[1]}.</Text>
          <Text style={{ ...(baseStyle || styles.aiCorrText), flex: 1 }}>{renderInlineRich(numberedMatch[2])}</Text>
        </View>
      )
      i++; continue
    }
    elements.push(
      <Text key={key++} style={baseStyle || styles.aiCorrText}>{renderInlineRich(trimmed)}</Text>
    )
    i++
  }
  return elements
}

function CorrectionBlock({
  item,
  mode
}: {
  item: AICorrectionItem
  mode: 'SUBMISSION' | 'DIRECT'
}): React.ReactElement {
  const verdict = VERDICT_STYLE[item.verdict] || VERDICT_STYLE.model
  return (
    <View style={styles.aiCorr}>
      <View style={styles.aiCorrHead}>
        <Text style={styles.aiCorrLabel}>Correction IA</Text>
        <Text style={[styles.aiCorrVerdict, verdict.style]}>{verdict.label}</Text>
        {item.score ? (
          <Text style={{ fontSize: 7, color: '#666', fontFamily: 'DM Mono' }}>
            {item.score}
          </Text>
        ) : null}
      </View>

      {mode === 'SUBMISSION' && item.userAnswer ? (
        <View style={styles.aiCorrUserAnswer}>
          <Text style={styles.aiCorrSubLabel}>Votre réponse</Text>
          {renderMarkdownToPDF(item.userAnswer, styles.aiCorrText)}
        </View>
      ) : null}

      <Text style={styles.aiCorrSubLabel}>
        {mode === 'SUBMISSION' ? 'Solution attendue' : 'Correction'}
      </Text>
      {renderMarkdownToPDF(item.correctAnswer || '', styles.aiCorrText)}

      {item.feedback ? (
        <View style={{ marginTop: 5, paddingTop: 5, borderTopWidth: 0.5, borderTopColor: '#dcebe2', borderTopStyle: 'solid' }}>
          {renderMarkdownToPDF(item.feedback, { fontSize: 9.5, color: '#3f5f4e', fontStyle: 'italic', lineHeight: 1.5 })}
        </View>
      ) : null}
    </View>
  )
}

interface NodeProps {
  node: any
  depth?: number
  state?: RenderState
}

function NodeRenderer({ node, depth = 0, state }: NodeProps): React.ReactElement | null {
  if (!node) return null
  const { type, content, attrs, text } = node

  switch (type) {
    case 'doc':
      return <>{(content || []).map((child: any, i: number) => <NodeRenderer key={i} node={child} state={state} />)}</>

    case 'paragraph': {
      const nodes = renderInlineWithMarks(content || [])
      if (nodes.length === 0) return <Text style={styles.paragraph}> </Text>
      // renderInlineWithMarks préserve sub/sup/link/bold/italic et rend les
      // inlineMath en Courier. C'est le rendu inline complet.
      return <Text style={styles.paragraph}>{nodes}</Text>
    }

    case 'heading': {
      const level = attrs?.level || 1
      const style = level === 1 ? styles.h1 : level === 2 ? styles.h2 : styles.h3
      return <Text style={style}>{renderInlineWithMarks(content || [])}</Text>
    }

    case 'bulletList':
    case 'orderedList': {
      const ordered = type === 'orderedList'
      return (
        <View>
          {(content || []).map((item: any, i: number) => (
            <View key={i} style={styles.bullet}>
              <Text style={styles.bulletDot}>{ordered ? `${i + 1}.` : '•'}</Text>
              <View style={{ flex: 1 }}>
                <NodeRenderer
                  node={{ ...item, type: 'paragraph', content: item.content?.[0]?.content || [] }}
                  state={state}
                />
              </View>
            </View>
          ))}
        </View>
      )
    }

    case 'codeBlock':
      return (
        <View style={styles.codeBlock}>
          {attrs?.language ? (
            <Text style={styles.codeBlockLang}>{attrs.language}</Text>
          ) : null}
          <Text style={styles.codeBlockText}>{renderInline(content)}</Text>
        </View>
      )

    case 'blockquote':
      return (
        <View style={styles.blockquote}>
          {(content || []).map((c: any, i: number) => (
            <NodeRenderer key={i} node={c} depth={depth + 1} state={state} />
          ))}
        </View>
      )

    case 'horizontalRule':
      return <View style={styles.horizontalRule} />

    case 'table':
      return (
        <View style={styles.table}>
          {(content || []).map((row: any, rowIndex: number) => {
            const isAlt = rowIndex > 0 && rowIndex % 2 === 0
            return (
              <View key={rowIndex} style={[styles.tableRow, isAlt ? styles.tableRowAlt : {}]}>
                {(row.content || []).map((cell: any, cellIndex: number) => {
                  const isHeader = cell.type === 'tableHeader'
                  const textValue = (cell.content || [])
                    .map((child: any) =>
                      child?.type === 'paragraph'
                        ? renderInline(child.content || [])
                        : ''
                    )
                    .join(' ')
                    .trim()
                  return (
                    <View
                      key={cellIndex}
                      style={isHeader ? [styles.tableCell, styles.tableHeader] : styles.tableCell}
                    >
                      <Text style={[styles.tableText, isHeader ? styles.tableHeaderText : {}]}>
                        {renderInlineLatex(textValue)}
                      </Text>
                    </View>
                  )
                })}
              </View>
            )
          })}
        </View>
      )

    case 'partie':
      // Pas de wrap={false} si on a des corrections (peuvent être longues).
      const partieNumero = getDisplayNumero(state, 'partie', attrs?.numero)
      return (
        <View style={styles.partie} wrap={!state}>
          <Text style={styles.partieLabel}>Partie {partieNumero}</Text>
          {attrs?.titre ? <Text style={styles.partieTitle}>{attrs.titre}</Text> : null}
          {(content || []).map((c: any, i: number) => <NodeRenderer key={i} node={c} depth={depth + 1} state={state} />)}
        </View>
      )

    case 'exercice':
      const exerciceNumero = getDisplayNumero(state, 'exercice', attrs?.numero)
      return (
        <View style={styles.exercice} wrap={!state}>
          <View style={styles.exerciceHeader}>
            <Text style={styles.exerciceLabel}>Exercice {exerciceNumero}</Text>
            {attrs?.hasPoints !== false && attrs?.points ? (
              <Text style={styles.exercicePoints}>{attrs.points} pts</Text>
            ) : null}
          </View>
          {(content || []).map((c: any, i: number) => <NodeRenderer key={i} node={c} depth={depth + 1} state={state} />)}
        </View>
      )

    case 'enonce':
      return (
        <View style={styles.enonce}>
          <Text style={styles.enonceLabel}>Énoncé</Text>
          {(content || []).map((c: any, i: number) => <NodeRenderer key={i} node={c} depth={depth + 1} state={state} />)}
        </View>
      )

    case 'question': {
      const questionNumero = getDisplayNumero(state, 'question', attrs?.numero)
      // Lookup correction par ordre d'apparition : Claude renvoie items[]
      // dans le même ordre que les questions parcourues. Si l'utilisateur a
      // répondu seulement à certaines questions (mode SUBMISSION), on essaie
      // de matcher par questionLabel (suffixe Q<num>) avant de retomber sur
      // l'index.
      let correction: AICorrectionItem | undefined
      if (state?.itemsByOrder?.length) {
        const num = questionNumero
        if (num) {
          const matchByNum = state.itemsByOrder.find((it) => {
            const re = new RegExp(`Q\\s*${num}\\b`, 'i')
            return re.test(it.questionLabel || '')
          })
          if (matchByNum) {
            correction = matchByNum
            // marquer comme consommé pour éviter de la repiquer
            state.itemsByOrder = state.itemsByOrder.filter((it) => it !== matchByNum)
          }
        }
        if (!correction) {
          correction = state.itemsByOrder[state.counter.value]
          if (correction) state.counter.value++
        }
      }

      return (
        <View>
          <View style={styles.question} wrap={false}>
            <Text style={styles.questionNum}>{questionNumero}.</Text>
            <Text style={styles.questionContent}>{renderInlineWithMarks(content || [])}</Text>
            {attrs?.hasPoints !== false && attrs?.points ? (
              <Text style={styles.questionPoints}>({attrs.points} pts)</Text>
            ) : null}
          </View>
          {state && correction ? (
            <CorrectionBlock item={correction} mode={state.mode} />
          ) : null}
        </View>
      )
    }

    case 'annotation': {
      const variant = attrs?.type || 'note'
      const variantStyle =
        variant === 'attention' || variant === 'erreur' ? styles.annotationRuby :
        variant === 'astuce' || variant === 'info' ? styles.annotationBlue :
        variant === 'correction' || variant === 'remarque' ? styles.annotationSage :
        styles.annotationAmber
      return (
        <View style={[styles.annotation, variantStyle]} wrap={false}>
          <Text style={styles.annotationLabel}>{String(variant).toUpperCase()}</Text>
          {(content || []).map((c: any, i: number) => <NodeRenderer key={i} node={c} depth={depth + 1} state={state} />)}
        </View>
      )
    }

    case 'formula':
      return (
        <View style={styles.formula} wrap={false}>
          <Text style={styles.formulaLatex}>{attrs?.latex ? `$${attrs.latex}$` : '(formule)'}</Text>
        </View>
      )

    case 'schema':
      // L'image n'est pas téléchargée dans le PDF (pour rester rapide + offline-capable
      // côté navigateur). On affiche un placeholder avec le nom du fichier.
      return (
        <View style={styles.schemaPlaceholder}>
          <Text style={styles.schemaPlaceholderText}>
            [Schéma : {attrs?.filename || 'image jointe'} — disponible sur la plateforme]
          </Text>
        </View>
      )

    case 'text':
      return <Text>{text || ''}</Text>

    default:
      // Node inconnu — on tente de rendre ses enfants en texte brut.
      if (Array.isArray(content)) {
        return <Text style={styles.paragraph}>{renderInline(content)}</Text>
      }
      return null
  }
}

/* ─── Document principal ────────────────────────────────────────── */

export interface SubjectPDFMeta {
  title: string
  matiere: string
  examType?: string
  baccType?: string
  serie?: string
  bepcOption?: string
  concoursType?: string
  etablissement?: string
  filiere?: string
  semestre?: string
  anneeScolaire?: string
  dateOfficielle?: string
  duree?: string
  coefficient?: number | string
  authorName?: string
  prix?: number
}

export interface SubjectPDFTrace {
  watermarkCode: string
  userEmail: string
  userName: string
  downloadedAt: string
}

interface Props {
  content: any
  meta: SubjectPDFMeta
  trace: SubjectPDFTrace
  /** Correction IA optionnelle à intégrer inline après chaque question. */
  aiCorrection?: AICorrectionResult | null
  /** Mode de la correction — change l'étiquette des blocs (réponse vs. modèle). */
  aiCorrectionMode?: 'SUBMISSION' | 'DIRECT'
}

function formatDateFr(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return iso
  }
}

export default function SubjectPDF({ content, meta, trace, aiCorrection, aiCorrectionMode }: Props) {
  const watermarkLabel = trace.userEmail || trace.userName

  // État de rendu des corrections — on consomme items[] au fur et à mesure
  // qu'on rencontre des nodes `question` dans l'arbre.
  const renderState: RenderState = {
    itemsByOrder: aiCorrection?.items?.length ? [...aiCorrection.items] : undefined,
    counter: { value: 0 },
    mode: aiCorrectionMode || 'DIRECT',
    numbering: {
      partie: 0,
      exercice: 0,
      question: 0
    }
  }

  const aiSummary = aiCorrection?.summary

  const examTypeLine = [meta.examType, meta.baccType, meta.bepcOption, meta.concoursType]
    .filter(Boolean)
    .join(' · ')

  const leftHeaderLines = [
    meta.etablissement || 'RÉPUBLIQUE DE MADAGASCAR',
    meta.filiere ? `Filière : ${meta.filiere}` : '',
    meta.authorName ? `Auteur : ${meta.authorName}` : '',
  ].filter(Boolean)

  const rightHeaderLines = [
    meta.anneeScolaire ? `Année : ${meta.anneeScolaire}` : '',
    meta.serie ? `Série : ${meta.serie}` : '',
    meta.semestre ? `Semestre : ${meta.semestre}` : '',
    meta.dateOfficielle ? `${meta.dateOfficielle}` : '',
    meta.duree ? `Durée : ${meta.duree}` : '',
    meta.coefficient ? `Coefficient : ${meta.coefficient}` : '',
  ].filter(Boolean)

  return (
    <Document
      title={meta.title}
      author={meta.authorName || 'Mah.AI'}
      creator="Mah.AI"
      producer="Mah.AI"
      keywords={[meta.matiere, meta.examType, meta.anneeScolaire].filter(Boolean).join(', ')}
    >
      {/* ───── Page(s) de contenu ───── */}
      <Page size="A4" style={styles.page} wrap>
        <Watermark code={trace.watermarkCode} userLabel={watermarkLabel} />

        {/* Header sur chaque page de contenu */}
        <View style={styles.pageHeader} fixed>
          <View style={styles.pageHeaderLogo}>
            <Text style={{ fontSize: 9, fontWeight: 700, color: '#0c0c0e' }}>
              Mah<Text style={{ color: '#C9A84C' }}>◆</Text>AI
            </Text>
          </View>
          <Text style={styles.pageHeaderTitle}>{meta.title}</Text>
        </View>

        <View>
          <View style={styles.compactExamHeader}>
            <View style={styles.compactExamTop}>
              <View style={styles.compactExamCol}>
                {leftHeaderLines.map((line, idx) => (
                  <Text key={`l-${idx}`} style={idx === 0 ? styles.compactExamLineStrong : styles.compactExamLine}>
                    {line}
                  </Text>
                ))}
              </View>
              <View style={styles.compactExamCol}>
                {rightHeaderLines.map((line, idx) => (
                  <Text key={`r-${idx}`} style={styles.compactExamLine}>
                    {line}
                  </Text>
                ))}
              </View>
            </View>

            <Text style={styles.compactExamTitle}>{meta.title}</Text>
            <Text style={styles.compactExamSubTitle}>
              {[examTypeLine, meta.matiere].filter(Boolean).join(' — ')}
            </Text>
          </View>

          <NodeRenderer node={content} state={renderState} />

          {/* Items IA non consommés (ex : corrections d'un énoncé terminal
              qui ne contient pas de nœuds "question" explicites) */}
          {renderState.itemsByOrder && renderState.itemsByOrder.length > 0 ? (
            <View style={styles.extraCorrections}>
              <Text style={styles.extraCorrectionsTitle}>Corrections supplémentaires</Text>
              {renderState.itemsByOrder.map((item, idx) => (
                <View key={idx}>
                  {item.questionLabel ? (
                    <Text style={styles.extraCorrectionLabel}>{item.questionLabel}</Text>
                  ) : null}
                  <CorrectionBlock item={item} mode={renderState.mode} />
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {aiSummary && (aiSummary.totalScore || aiSummary.strengths?.length || aiSummary.improvements?.length) ? (
          <View style={styles.aiSummary} wrap={false}>
            <Text style={styles.aiSummaryTitle}>
              {aiCorrectionMode === 'SUBMISSION' ? 'Bilan de la correction IA' : 'Synthèse pédagogique'}
            </Text>
            {aiSummary.totalScore && aiSummary.totalScore !== '—' ? (
              <View style={styles.aiSummaryRow}>
                <Text style={styles.aiSummaryRowLabel}>Note globale</Text>
                <Text style={[styles.aiSummaryItem, { fontWeight: 700, fontFamily: 'DM Mono' }]}>
                  {aiSummary.totalScore}
                </Text>
              </View>
            ) : null}
            {aiSummary.strengths?.length ? (
              <View style={styles.aiSummaryRow}>
                <Text style={styles.aiSummaryRowLabel}>Points forts</Text>
                {aiSummary.strengths.map((s, i) => (
                  <View key={i} style={{ flexDirection: 'row', marginBottom: 1 }}>
                    <Text style={{ ...styles.aiSummaryItem, width: 12 }}>•</Text>
                    <Text style={{ ...styles.aiSummaryItem, flex: 1 }}>{renderInlineMarkdown(s)}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {aiSummary.improvements?.length ? (
              <View style={styles.aiSummaryRow}>
                <Text style={styles.aiSummaryRowLabel}>
                  {aiCorrectionMode === 'DIRECT' ? 'Conseils méthodologiques' : 'Axes de progrès'}
                </Text>
                {aiSummary.improvements.map((s, i) => (
                  <View key={i} style={{ flexDirection: 'row', marginBottom: 1 }}>
                    <Text style={{ ...styles.aiSummaryItem, width: 12 }}>•</Text>
                    <Text style={{ ...styles.aiSummaryItem, flex: 1 }}>{renderInlineMarkdown(s)}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Footer fixé sur chaque page */}
        <View style={styles.pageFooter} fixed>
          <View style={styles.pageFooterCol}>
            <Text style={styles.pageFooterLabel}>Téléchargé par</Text>
            <Text style={styles.pageFooterValue}>{trace.userName}</Text>
          </View>
          <View style={styles.pageFooterCenter}>
            <Text style={styles.pageFooterLabel}>Code de traçabilité</Text>
            <Text style={[styles.pageFooterValue, { fontFamily: 'DM Mono', color: '#C9A84C' }]}>
              {trace.watermarkCode}
            </Text>
          </View>
          <View style={[styles.pageFooterCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.pageFooterLabel}>Date</Text>
            <Text style={styles.pageFooterValue}>{formatDateFr(trace.downloadedAt)}</Text>
            <Text
              style={[styles.pageNumber, { marginTop: 2 }]}
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
            />
          </View>
        </View>
      </Page>
    </Document>
  )
}