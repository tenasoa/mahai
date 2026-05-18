// Module exécuté côté serveur uniquement (route API /api/subjects/[id]/pdf).

import path from 'path'
import {
  Document,
  Page,
  Font,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer'
import type { ReactElement } from 'react'

// ── Polices (identiques à l'application) ──────────────────────────────
// Côté serveur, @react-pdf/renderer ne peut pas résoudre une URL relative
// au navigateur (« /fonts/x.woff ») : il faut un chemin de fichier absolu
// pointant vers le dossier public/fonts.

const fontPath = (file: string) => path.join(process.cwd(), 'public', 'fonts', file)

Font.register({
  family: 'Cormorant Garamond',
  fonts: [
    { src: fontPath('CG-400.woff'), fontWeight: 400 },
    { src: fontPath('CG-400i.woff'), fontWeight: 400, fontStyle: 'italic' },
    { src: fontPath('CG-600.woff'), fontWeight: 600 },
    { src: fontPath('CG-700.woff'), fontWeight: 700 },
    { src: fontPath('CG-700i.woff'), fontWeight: 700, fontStyle: 'italic' },
  ],
})

Font.register({
  family: 'DM Sans',
  fonts: [
    { src: fontPath('DMS-400.woff'), fontWeight: 400 },
    { src: fontPath('DMS-400i.woff'), fontWeight: 400, fontStyle: 'italic' },
    { src: fontPath('DMS-500.woff'), fontWeight: 500 },
    { src: fontPath('DMS-700.woff'), fontWeight: 700 },
    { src: fontPath('DMS-700i.woff'), fontWeight: 700, fontStyle: 'italic' },
  ],
})

Font.register({ family: 'DM Mono', fonts: [{ src: fontPath('DMM-400.woff'), fontWeight: 400 }] })

// Evite les erreurs "unsupported number" de fontkit sur les metriques
// de polices WOFF (largeur de glyphe hors-limites).
Font.registerHyphenationCallback((word) => [word])

// ── Types ───────────────────────────────────────────────────────────

interface TipTapMark {
  type: string
  attrs?: Record<string, unknown>
}

interface TipTapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
  text?: string
  marks?: TipTapMark[]
}

export interface SubjectMeta {
  titre: string
  matiere: string
  type: string
  annee?: string | number
  serie?: string | null
  pages?: number | null
  duree?: string | null
  coefficient?: number | string | null
  difficulte?: string | null
  authorName?: string | null
  etablissement?: string | null
  description?: string | null
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    padding: '2cm 2.2cm',
    fontFamily: 'Cormorant Garamond',
    fontSize: 12,
    lineHeight: 1.65,
    color: '#1a1714',
  },
  pageInner: { flex: 1 },
  header: {
    marginBottom: 16,
    borderBottom: '1.5px solid #C9A84C',
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Cormorant Garamond',
    color: '#C9A84C',
    fontWeight: 700,
    marginBottom: 4,
  },
  headerMeta: { fontSize: 9, color: '#666', fontFamily: 'DM Sans' },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 2 },
  partie: {
    marginTop: 20,
    marginBottom: 8,
    borderLeft: '2.5px solid #C9A84C',
    paddingLeft: 10,
  },
  partieTitle: {
    fontSize: 15,
    fontFamily: 'Cormorant Garamond',
    color: '#1c2b4a',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  exercice: { marginTop: 16, marginBottom: 8, paddingLeft: 6 },
  exerciceTitle: {
    fontSize: 13,
    fontFamily: 'Cormorant Garamond',
    color: '#1a1714',
    fontWeight: 700,
    marginBottom: 4,
  },
  enonce: {
    marginVertical: 6,
    paddingLeft: 8,
    borderLeft: '1px solid #e0d5c0',
  },
  enonceLabel: {
    fontSize: 9,
    color: '#888',
    fontFamily: 'DM Sans',
    marginBottom: 4,
  },
  question: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#fafaf7',
    borderRadius: 4,
    border: '0.5px solid #e5e5e5',
  },
  questionLabel: {
    fontSize: 11,
    fontFamily: 'DM Sans',
    color: '#C9A84C',
    fontWeight: 700,
    marginBottom: 4,
  },
  heading: { marginTop: 12, marginBottom: 4 },
  heading1: { fontSize: 16, fontFamily: 'Cormorant Garamond', fontWeight: 700, color: '#1c2b4a' },
  heading2: { fontSize: 14, fontFamily: 'Cormorant Garamond', fontWeight: 700, color: '#1c2b4a' },
  heading3: { fontSize: 12, fontFamily: 'Cormorant Garamond', fontWeight: 700, color: '#333' },
  paragraph: { marginBottom: 4, textAlign: 'justify' as const },
  textInline: { fontFamily: 'Cormorant Garamond' },
  markBold: { fontWeight: 700 },
  markItalic: { fontStyle: 'italic' as const },
  markUnderline: { textDecoration: 'underline' as const },
  markStrike: { textDecoration: 'line-through' as const },
  mathInline: {
    fontFamily: 'DM Mono',
    fontSize: 10,
    backgroundColor: '#f5f5f2',
    padding: '1 3',
  },
  formulaBlock: {
    fontFamily: 'DM Mono',
    fontSize: 10,
    backgroundColor: '#f5f5f2',
    padding: '6 8',
    marginVertical: 6,
    textAlign: 'center' as const,
  },
  listItem: { marginLeft: 12, marginBottom: 2, flexDirection: 'row' as const },
  bullet: { width: 12, fontFamily: 'Cormorant Garamond' },
  listText: { flex: 1 },
  codeBlock: {
    fontFamily: 'DM Mono',
    fontSize: 9,
    backgroundColor: '#ede8e0',
    padding: 8,
    marginVertical: 6,
  },
  table: { marginVertical: 8, border: '0.5px solid #d5d5d5' },
  tableRow: { flexDirection: 'row' as const, borderBottom: '0.5px solid #e5e5e5' },
  tableRowHeader: {
    flexDirection: 'row' as const,
    borderBottom: '0.5px solid #d5d5d5',
    backgroundColor: '#f5f5f2',
  },
  tableCell: { flex: 1, padding: '3 5', fontSize: 9 },
  tableCellHeader: { flex: 1, padding: '3 5', fontSize: 9, fontFamily: 'DM Sans', fontWeight: 700 },
  annotation: {
    marginVertical: 4,
    padding: '6 8',
    backgroundColor: '#fff8e1',
    borderLeft: '2px solid #C9A84C',
    fontSize: 9,
    fontFamily: 'DM Sans',
  },
  annotationLabel: {
    fontSize: 7,
    fontFamily: 'DM Sans',
    fontWeight: 700,
    color: '#C9A84C',
    letterSpacing: 1,
    marginBottom: 3,
  },
  schema: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f5f5f2',
    border: '0.5px dashed #d5d5d5',
    textAlign: 'center' as const,
    fontSize: 9,
    color: '#888',
    fontFamily: 'DM Sans',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 7,
    color: '#aaa',
    fontFamily: 'DM Sans',
  },
  watermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.12,
  },
  watermarkText: {
    fontSize: 60,
    fontFamily: 'Cormorant Garamond',
    fontWeight: 700,
    color: '#C9A84C',
    transform: 'rotate(-35deg)',
  },
})

// ── Rendu inline (text, inlineMath, hardBreak) ────────────────────

// Convertit les marques TipTap (bold/italic/underline/strike) en styles PDF.
function styleFromMarks(marks?: TipTapMark[]) {
  if (!marks) return []
  type MarkStyle =
    | (typeof styles)['markBold']
    | (typeof styles)['markItalic']
    | (typeof styles)['markUnderline']
    | (typeof styles)['markStrike']
  const out: MarkStyle[] = []
  for (const mark of marks) {
    if (mark.type === 'bold') out.push(styles.markBold)
    else if (mark.type === 'italic') out.push(styles.markItalic)
    else if (mark.type === 'underline') out.push(styles.markUnderline)
    else if (mark.type === 'strike') out.push(styles.markStrike)
  }
  return out
}

function RenderInline({ children }: { children?: TipTapNode[] }) {
  if (!children) return null
  return (
    <>
      {children.map((node, i) => {
        if (node.type === 'text') {
          return (
            <Text key={i} style={[styles.textInline, ...styleFromMarks(node.marks)]}>
              {node.text || ''}
            </Text>
          )
        }
        if (node.type === 'inlineMath') {
          const latex = (node.attrs?.latex as string) || ''
          return (
            <Text key={i} style={styles.mathInline}>
              ${latex}$
            </Text>
          )
        }
        if (node.type === 'hardBreak') {
          return <Text key={i}>{'\n'}</Text>
        }
        return null
      })}
    </>
  )
}

// ── Rendu récursif des blocs TipTap ───────────────────────────────

function RenderNode({ node }: { node: TipTapNode; index: number }): ReactElement | null {
  const { type, attrs, content, text } = node

  switch (type) {
    case 'doc':
      return (
        <>
          {content?.map((child, i) => (
            <RenderNode key={i} node={child} index={i} />
          ))}
        </>
      )

    case 'partie': {
      const num = String(attrs?.numero || '?')
      const titre = String(attrs?.titre || '')
      return (
        <View style={styles.partie} wrap={false}>
          <Text style={styles.partieTitle}>
            PARTIE {num}{titre ? ` \u2014 ${titre}` : ''}
          </Text>
          {content?.map((child, i) => (
            <RenderNode key={i} node={child} index={i} />
          ))}
        </View>
      )
    }

    case 'exercice': {
      const num = String(attrs?.numero || '?')
      const pts = attrs?.points ? ` (${attrs.points} pts)` : ''
      return (
        <View style={styles.exercice} wrap={false}>
          <Text style={styles.exerciceTitle}>
            EXERCICE {num}{pts}
          </Text>
          {content?.map((child, i) => (
            <RenderNode key={i} node={child} index={i} />
          ))}
        </View>
      )
    }

    case 'enonce':
      return (
        <View style={styles.enonce}>
          <Text style={styles.enonceLabel}>ÉNONCÉ</Text>
          {content?.map((child, i) => (
            <RenderNode key={i} node={child} index={i} />
          ))}
        </View>
      )

    case 'question': {
      const num = String(attrs?.numero || '?')
      const pts = attrs?.points ? ` (${attrs.points} pts)` : ''
      return (
        <View style={styles.question} wrap={false}>
          <Text style={styles.questionLabel}>
            Question {num}{pts}
          </Text>
          <RenderInline>{content}</RenderInline>
        </View>
      )
    }

    case 'annotation':
      return (
        <View style={styles.annotation}>
          <Text style={styles.annotationLabel}>
            [{((attrs?.type as string) || 'NOTE').toUpperCase()}]
          </Text>
          {content?.map((child, i) => (
            <RenderNode key={i} node={child} index={i} />
          ))}
        </View>
      )

    case 'formula':
      return (
        <Text style={styles.formulaBlock}>
          $${String(attrs?.latex || '')}$$
        </Text>
      )

    case 'schema':
      return (
        <View style={styles.schema}>
          <Text>[Schéma : {(attrs?.filename as string) || 'image'}]</Text>
        </View>
      )

    case 'heading': {
      const level = (attrs?.level as number) || 1
      const styleMap: Record<number, (typeof styles)['heading1']> = {
        1: styles.heading1,
        2: styles.heading2,
        3: styles.heading3,
      }
      return (
        <View style={styles.heading}>
          <Text style={styleMap[level] || styles.heading3}>
            <RenderInline>{content}</RenderInline>
          </Text>
        </View>
      )
    }

    case 'paragraph':
      return (
        <Text style={styles.paragraph}>
          <RenderInline>{content}</RenderInline>
        </Text>
      )

    case 'bulletList':
    case 'orderedList':
      return (
        <View>
          {content?.map((item, i) => {
            const bullet = type === 'orderedList' ? `${i + 1}.` : '\u2022'
            const inlineContent = item?.content?.[0]?.content || item?.content
            return (
              <View key={i} style={styles.listItem}>
                <Text style={styles.bullet}>{bullet} </Text>
                <Text style={styles.listText}>
                  <RenderInline>{inlineContent}</RenderInline>
                </Text>
              </View>
            )
          })}
        </View>
      )

    case 'codeBlock':
      return (
        <View style={styles.codeBlock}>
          {content?.map((child, i) => (
            <RenderNode key={i} node={child} index={i} />
          ))}
        </View>
      )

    case 'table': {
      const rows = (content || []) as TipTapNode[]
      if (!rows.length) return null
      return (
        <View style={styles.table}>
          {rows.map((row, ri) => {
            const cells = (row.content || []) as TipTapNode[]
            const isHeader = ri === 0
            return (
              <View key={ri} style={isHeader ? styles.tableRowHeader : styles.tableRow}>
                {cells.map((cell, ci) => (
                  <View key={ci} style={isHeader ? styles.tableCellHeader : styles.tableCell}>
                    <RenderInline>{cell.content}</RenderInline>
                  </View>
                ))}
              </View>
            )
          })}
        </View>
      )
    }

    default:
      if (text) {
        return <Text>{text}</Text>
      }
      if (content) {
        return (
          <>
            {content.map((child, i) => (
              <RenderNode key={i} node={child} index={i} />
            ))}
          </>
        )
      }
      return null
  }
}

// ── Composant Document principal ─────────────────────────────────

interface SubjectPDFProps {
  meta: SubjectMeta
  content: TipTapNode
  traceCode?: string
}

function SubjectPDF({ meta, content, traceCode }: SubjectPDFProps) {
  const metaItems: string[] = []
  if (meta.type) metaItems.push(meta.type)
  if (meta.matiere) metaItems.push(meta.matiere)
  if (meta.annee) metaItems.push(String(meta.annee))
  if (meta.serie) metaItems.push(`S\u00e9rie ${meta.serie}`)
  if (meta.duree) metaItems.push(meta.duree)
  if (meta.coefficient) metaItems.push(`Coef. ${meta.coefficient}`)
  if (meta.pages) metaItems.push(`${meta.pages} page${meta.pages > 1 ? 's' : ''}`)
  if (meta.difficulte) metaItems.push(meta.difficulte)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {traceCode && (
          <View style={styles.watermark} fixed>
            <Text style={styles.watermarkText}>{traceCode}</Text>
          </View>
        )}

        <View style={styles.pageInner}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{meta.titre || 'Sujet'}</Text>
            {meta.etablissement && (
              <Text style={{ ...styles.headerMeta, marginBottom: 2, fontStyle: 'italic' }}>
                {meta.etablissement}
              </Text>
            )}
            <View style={styles.metaRow}>
              {metaItems.slice(0, 4).map((item, i) => (
                <Text key={i} style={styles.headerMeta}>{item}</Text>
              ))}
            </View>
            {metaItems.length > 4 && (
              <View style={styles.metaRow}>
                {metaItems.slice(4).map((item, i) => (
                  <Text key={i} style={styles.headerMeta}>{item}</Text>
                ))}
              </View>
            )}
            {meta.description && (
              <Text style={{ ...styles.headerMeta, marginTop: 4, fontStyle: 'italic', color: '#555' }}>
                {meta.description}
              </Text>
            )}
          </View>

          <RenderNode node={content} index={0} />
        </View>

        <View style={styles.footer} fixed>
          <Text>
            Mah.AI — {meta.titre || 'Sujet'}
            {traceCode ? ` — ${traceCode}` : ''}
            {' — Page 1'}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// ── Fonction d'export ─────────────────────────────────────────────

// Numérote séquentiellement les nœuds `question` dépourvus d'attribut
// `numero` (comme le fait l'affichage « lecture simple » de l'application).
function numberQuestions(node: TipTapNode, counter: { n: number }): void {
  if (node.type === 'question') {
    counter.n += 1
    const current = node.attrs?.numero
    if (current === undefined || current === null || current === '') {
      node.attrs = { ...node.attrs, numero: counter.n }
    }
  }
  node.content?.forEach((child) => numberQuestions(child, counter))
}

export async function generateSubjectPDF(
  meta: SubjectMeta,
  content: TipTapNode,
  traceCode?: string,
): Promise<Buffer> {
  numberQuestions(content, { n: 0 })
  const document = <SubjectPDF meta={meta} content={content} traceCode={traceCode} />
  const pdfBlob = await pdf(document).toBlob()
  const arrayBuffer = await pdfBlob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}