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
} from '@react-pdf/renderer'

/* ─────────────────────────────────────────────────────────────────
   Polices : on utilise les polices PDF par défaut (Helvetica) pour
   garder le bundle léger et éviter les erreurs CORS sur les fonts
   externes. Pour le rendu typographique « luxe », l'export PDF se
   contente d'une hiérarchie nette plutôt que de reproduire les fonts
   custom du site (Cormorant + Outfit).
   ──────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  /* ───── PAGE & LAYOUT ───── */
  page: {
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.55,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
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
    borderBottomStyle: 'solid',
  },
  pageHeaderLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageHeaderTitle: {
    color: '#666',
    fontSize: 8,
    maxWidth: 360,
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
    borderTopStyle: 'solid',
  },
  pageFooterCol: { flexDirection: 'column', gap: 2 },
  pageFooterCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
  },
  pageFooterLabel: { color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 6 },
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
    transform: 'rotate(-30deg)',
    opacity: 0.06,
  },
  watermarkLine: {
    fontSize: 26,
    color: '#000',
    textAlign: 'center',
    fontWeight: 700,
    letterSpacing: 4,
  },

  /* ───── COVER ───── */
  cover: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  coverTopBar: {
    height: 4,
    backgroundColor: '#C9A84C',
    width: 80,
    marginBottom: 32,
  },
  coverEyebrow: {
    fontSize: 9,
    color: '#C9A84C',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  coverTitle: {
    fontSize: 36,
    color: '#0c0c0e',
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  coverSubtitle: {
    fontSize: 14,
    color: '#444',
    lineHeight: 1.6,
  },
  coverDivider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 20,
  },
  coverMetaGrid: {
    flexDirection: 'column',
    gap: 8,
  },
  coverMetaRow: {
    flexDirection: 'row',
    fontSize: 10,
  },
  coverMetaLabel: {
    width: 130,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 8,
  },
  coverMetaValue: {
    flex: 1,
    color: '#222',
    fontSize: 10,
  },
  coverFooter: {
    flexDirection: 'column',
    gap: 4,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    borderTopStyle: 'solid',
  },
  coverLogo: {
    fontSize: 22,
    color: '#0c0c0e',
    fontWeight: 700,
    marginBottom: 4,
  },
  coverLogoGold: {
    color: '#C9A84C',
  },
  coverFooterLine: {
    fontSize: 8,
    color: '#888',
  },

  /* ───── CONTENT BLOCKS ───── */
  h1: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0c0c0e',
    marginTop: 16,
    marginBottom: 8,
  },
  h2: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 6,
  },
  h3: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1a1a1a',
    marginTop: 10,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 11,
    color: '#222',
    marginBottom: 6,
    lineHeight: 1.6,
  },
  bullet: {
    flexDirection: 'row',
    fontSize: 11,
    marginBottom: 3,
    color: '#222',
  },
  bulletDot: {
    width: 12,
    color: '#C9A84C',
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
    borderBottomRightRadius: 4,
  },
  partieLabel: {
    fontSize: 8,
    color: '#C9A84C',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  partieTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0c0c0e',
    marginBottom: 6,
  },

  exercice: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    borderWidth: 0.7,
    borderColor: '#d8d2c0',
    borderStyle: 'dashed',
    borderRadius: 3,
    backgroundColor: '#fdfcf8',
  },
  exerciceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  exerciceLabel: {
    fontSize: 8,
    color: '#C9A84C',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  exercicePoints: {
    fontSize: 8,
    color: '#666',
    fontFamily: 'Courier',
  },

  enonce: {
    marginVertical: 8,
    padding: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#999',
    borderLeftStyle: 'solid',
    backgroundColor: '#f7f7f5',
    fontStyle: 'italic',
  },
  enonceLabel: {
    fontSize: 7,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
    fontStyle: 'normal',
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
    borderRadius: 2,
  },
  questionNum: {
    width: 24,
    color: '#C9A84C',
    fontFamily: 'Courier',
    fontSize: 11,
    fontWeight: 700,
  },
  questionContent: {
    flex: 1,
    fontSize: 11,
    color: '#222',
  },
  questionPoints: {
    fontSize: 8,
    color: '#888',
    marginLeft: 6,
  },

  annotation: {
    marginVertical: 6,
    padding: 8,
    borderRadius: 3,
    borderWidth: 0.5,
    borderStyle: 'solid',
  },
  annotationAmber: { backgroundColor: '#fff8e6', borderColor: '#f3d97a' },
  annotationSage:  { backgroundColor: '#eef7f1', borderColor: '#a3cfb3' },
  annotationBlue:  { backgroundColor: '#eef3fb', borderColor: '#9bb7e0' },
  annotationRuby:  { backgroundColor: '#fbeef0', borderColor: '#e09bab' },
  annotationLabel: {
    fontSize: 7,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  formula: {
    marginVertical: 8,
    padding: 10,
    backgroundColor: '#f7f7f5',
    borderWidth: 0.5,
    borderColor: '#e5e5e5',
    borderStyle: 'solid',
    borderRadius: 3,
    alignItems: 'center',
  },
  formulaLatex: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: '#0c0c0e',
  },

  schemaPlaceholder: {
    marginVertical: 8,
    padding: 16,
    backgroundColor: '#f0f0ee',
    borderWidth: 0.5,
    borderColor: '#d5d5d0',
    borderStyle: 'dashed',
    borderRadius: 3,
    alignItems: 'center',
  },
  schemaPlaceholderText: {
    fontSize: 9,
    color: '#888',
    fontStyle: 'italic',
  },
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
  return content.map((c) => (typeof c?.text === 'string' ? c.text : '')).join('')
}

interface NodeProps {
  node: any
  depth?: number
}

function NodeRenderer({ node, depth = 0 }: NodeProps): React.ReactElement | null {
  if (!node) return null
  const { type, content, attrs, text } = node

  switch (type) {
    case 'doc':
      return <>{(content || []).map((child: any, i: number) => <NodeRenderer key={i} node={child} />)}</>

    case 'paragraph': {
      const t = renderInline(content)
      if (!t) return <Text style={styles.paragraph}> </Text>
      return <Text style={styles.paragraph}>{t}</Text>
    }

    case 'heading': {
      const level = attrs?.level || 1
      const style = level === 1 ? styles.h1 : level === 2 ? styles.h2 : styles.h3
      return <Text style={style}>{renderInline(content)}</Text>
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
                <NodeRenderer node={{ ...item, type: 'paragraph', content: item.content?.[0]?.content || [] }} />
              </View>
            </View>
          ))}
        </View>
      )
    }

    case 'codeBlock':
      return (
        <View style={[styles.formula, { alignItems: 'flex-start' }]}>
          <Text style={styles.formulaLatex}>{renderInline(content)}</Text>
        </View>
      )

    case 'partie':
      return (
        <View style={styles.partie} wrap={false}>
          <Text style={styles.partieLabel}>Partie {attrs?.numero || ''}</Text>
          {attrs?.titre ? <Text style={styles.partieTitle}>{attrs.titre}</Text> : null}
          {(content || []).map((c: any, i: number) => <NodeRenderer key={i} node={c} depth={depth + 1} />)}
        </View>
      )

    case 'exercice':
      return (
        <View style={styles.exercice} wrap={false}>
          <View style={styles.exerciceHeader}>
            <Text style={styles.exerciceLabel}>Exercice {attrs?.numero || ''}</Text>
            {attrs?.hasPoints !== false && attrs?.points ? (
              <Text style={styles.exercicePoints}>{attrs.points} pts</Text>
            ) : null}
          </View>
          {(content || []).map((c: any, i: number) => <NodeRenderer key={i} node={c} depth={depth + 1} />)}
        </View>
      )

    case 'enonce':
      return (
        <View style={styles.enonce}>
          <Text style={styles.enonceLabel}>Énoncé</Text>
          {(content || []).map((c: any, i: number) => <NodeRenderer key={i} node={c} depth={depth + 1} />)}
        </View>
      )

    case 'question':
      return (
        <View style={styles.question} wrap={false}>
          <Text style={styles.questionNum}>{attrs?.numero || '•'}.</Text>
          <Text style={styles.questionContent}>{renderInline(content)}</Text>
          {attrs?.hasPoints !== false && attrs?.points ? (
            <Text style={styles.questionPoints}>({attrs.points} pts)</Text>
          ) : null}
        </View>
      )

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
          {(content || []).map((c: any, i: number) => <NodeRenderer key={i} node={c} depth={depth + 1} />)}
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
}

function formatDateFr(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function SubjectPDF({ content, meta, trace }: Props) {
  const watermarkLabel = trace.userEmail || trace.userName

  // Liste des métadonnées affichées sur la couverture (filtre les vides).
  const coverRows: { label: string; value: string }[] = [
    { label: 'Matière',        value: meta.matiere },
    { label: 'Type d\'examen', value: [meta.examType, meta.baccType, meta.bepcOption, meta.concoursType].filter(Boolean).join(' · ') },
    { label: 'Série',          value: meta.serie || '' },
    { label: 'Année',          value: meta.anneeScolaire || '' },
    { label: 'Date officielle',value: meta.dateOfficielle || '' },
    { label: 'Durée',          value: meta.duree || '' },
    { label: 'Coefficient',    value: meta.coefficient ? String(meta.coefficient) : '' },
    { label: 'Établissement',  value: [meta.etablissement, meta.filiere, meta.semestre].filter(Boolean).join(' · ') },
    { label: 'Auteur',         value: meta.authorName || '' },
  ].filter((r) => r.value && r.value.trim() !== '')

  return (
    <Document
      title={meta.title}
      author={meta.authorName || 'Mah.AI'}
      creator="Mah.AI"
      producer="Mah.AI"
      keywords={[meta.matiere, meta.examType, meta.anneeScolaire].filter(Boolean).join(', ')}
    >
      {/* ───── Page de couverture ───── */}
      <Page size="A4" style={styles.page}>
        <Watermark code={trace.watermarkCode} userLabel={watermarkLabel} />

        <View style={styles.cover}>
          <View>
            <View style={styles.coverTopBar} />
            <Text style={styles.coverEyebrow}>SUJET D'EXAMEN</Text>
            <Text style={styles.coverTitle}>{meta.title}</Text>
            <Text style={styles.coverSubtitle}>
              {[meta.matiere, meta.examType, meta.anneeScolaire].filter(Boolean).join(' — ')}
            </Text>

            <View style={styles.coverDivider} />

            <View style={styles.coverMetaGrid}>
              {coverRows.map((row, i) => (
                <View key={i} style={styles.coverMetaRow}>
                  <Text style={styles.coverMetaLabel}>{row.label}</Text>
                  <Text style={styles.coverMetaValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.coverFooter}>
            <Text style={styles.coverLogo}>
              Mah<Text style={styles.coverLogoGold}>◆</Text>AI
            </Text>
            <Text style={styles.coverFooterLine}>
              Plateforme EdTech — sujets d'examens nationaux malgaches
            </Text>
            <Text style={styles.coverFooterLine}>
              Téléchargé le {formatDateFr(trace.downloadedAt)} par {trace.userName}
            </Text>
            <Text style={[styles.coverFooterLine, { fontFamily: 'Courier', color: '#C9A84C', marginTop: 6 }]}>
              Code de traçabilité : {trace.watermarkCode}
            </Text>
          </View>
        </View>
      </Page>

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
          <NodeRenderer node={content} />
        </View>

        {/* Footer fixé sur chaque page */}
        <View style={styles.pageFooter} fixed>
          <View style={styles.pageFooterCol}>
            <Text style={styles.pageFooterLabel}>Téléchargé par</Text>
            <Text style={styles.pageFooterValue}>{trace.userName}</Text>
          </View>
          <View style={styles.pageFooterCenter}>
            <Text style={styles.pageFooterLabel}>Code de traçabilité</Text>
            <Text style={[styles.pageFooterValue, { fontFamily: 'Courier', color: '#C9A84C', letterSpacing: 1 }]}>
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
