/**
 * pdf-client.ts — Helper côté front-end pour générer un PDF via la route
 * /api/pdf/generate (Playwright headless côté serveur).
 *
 * Usage :
 *   const bytes = await generatePDFFromHTML({ bodyHTML, meta, trace, filename })
 *   triggerPDFDownload(bytes, filename)
 */

export interface PDFTrace {
  watermarkCode: string
  userName: string
  userEmail: string
  downloadedAt: string
}

export interface PDFMeta {
  title: string
  matiere?: string | null
  examType?: string | null
  serie?: string | null
  anneeScolaire?: string | null
  duree?: string | null
  coefficient?: number | null
}

export interface GeneratePDFOptions {
  /** HTML du corps (sujet ± correction), sans balise <html>/<body>. */
  bodyHTML: string
  meta: PDFMeta
  trace: PDFTrace
  filename?: string
}

// ── CSS embarqué ──────────────────────────────────────────────────────────────

/** Variables de thème clair et styles de l'éditeur, embarqués dans le PDF. */
const EMBEDDED_CSS = `
/* ── Thème clair forcé ── */
:root {
  color-scheme: light;
  --void: #ffffff;
  --depth: #f8f8f8;
  --surface: #ffffff;
  --card: #fafaf7;
  --lift: #f5f5f2;
  --text: #0c0c0e;
  --text-1: #0c0c0e;
  --text-2: #2a2a2a;
  --text-3: #555555;
  --text-4: #888888;
  --b1: rgba(26,23,20,0.12);
  --b2: rgba(168,120,42,0.08);
  --b3: rgba(26,23,20,0.04);
  --border-1: #e5e5e5;
  --border-2: #d5d5d5;
  --gold: #C9A84C;
  --gold-hi: #e4c06e;
  --gold-lo: #a8893e;
  --gold-dim: rgba(201,168,76,0.15);
  --gold-line: rgba(201,168,76,0.35);
  --ruby: #9b2235;
  --ruby-dim: rgba(155,35,53,0.10);
  --ruby-line: rgba(155,35,53,0.24);
  --sage: #4a6b5a;
  --sage-dim: rgba(74,107,90,0.10);
  --sage-line: rgba(74,107,90,0.24);
  --amber-dim: rgba(201,132,60,0.12);
  --amber-line: rgba(201,132,60,0.28);
  --blue-dim: rgba(58,110,168,0.12);
  --blue-line: rgba(58,110,168,0.24);
  --navy: #1c2b4a;
  --display: Georgia, 'Times New Roman', serif;
  --body: system-ui, -apple-system, sans-serif;
  --mono: 'Courier New', Courier, monospace;
  --r-xs: 2px;
  --r-sm: 4px;
  --r-lg: 8px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
  /* Canvas tokens */
  --canvas-bg: #ffffff;
  --canvas-fg: #0c0c0e;
  --canvas-muted: #2a2a2a;
  --canvas-soft: #555555;
  --canvas-h1-border: rgba(26,23,20,0.12);
  --canvas-h2-color: #1c2b4a;
  --canvas-link-underline: #C9A84C;
  --canvas-list-marker: #C9A84C;
  --canvas-blockquote-bar: #C9A84C;
  --canvas-blockquote-bg: rgba(201,168,76,0.12);
  --canvas-blockquote-fg: #2a2a2a;
  --canvas-code-bg: #ede8e0;
  --canvas-code-border: rgba(26,23,20,0.12);
  --canvas-code-fg: #1c2b4a;
  --canvas-pre-bg: #1a1714;
  --canvas-pre-fg: #d4a855;
}

/* ── Reset & base ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #ffffff; color: #0c0c0e; font-family: var(--body); font-size: 14px; line-height: 1.6; }

/* ── En-tête du document ── */
.pdf-header { padding: 0 0 20px; margin-bottom: 24px; border-bottom: 1.5px solid #C9A84C; }
.pdf-header-brand { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #C9A84C; margin-bottom: 8px; font-weight: 600; font-family: var(--mono); }
.pdf-header-title { font-size: 18px; font-weight: 700; color: #0c0c0e; margin: 0 0 12px; line-height: 1.3; font-family: var(--display); }
.pdf-header-meta { display: flex; flex-wrap: wrap; gap: 4px 16px; }
.pdf-header-chip { font-size: 11px; color: #555; }
.pdf-header-chip-label { color: #999; margin-right: 2px; }
.pdf-header-chip-value { color: #0c0c0e; font-weight: 600; }

/* ── Séparateur correction ── */
.pdf-correction-sep { margin: 32px 0 20px; padding: 12px 0 12px; border-top: 2px solid #C9A84C; }
.pdf-correction-sep-label { font-family: var(--mono); font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #C9A84C; }

/* ── Filigrane diagonal ── */
.pdf-watermark {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg);
  font-family: var(--mono); font-size: 18px; color: rgba(0,0,0,0.05);
  white-space: nowrap; pointer-events: none; z-index: 0;
  text-align: center; line-height: 2.5;
  width: 150%; letter-spacing: 4px;
}

/* ── Pied de page ── */
.pdf-footer {
  position: fixed; bottom: 0; left: 14mm; right: 14mm;
  border-top: 0.3px solid #ddd; padding: 3px 0;
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--mono); font-size: 7px; color: #999;
}
.pdf-footer-code { color: #b48c32; font-weight: 600; }

/* ── Canvas éditeur ── */
.editor-canvas { background: var(--canvas-bg); min-height: 100px; font-family: var(--display); font-size: 1rem; line-height: 1.85; color: var(--canvas-fg); }
.editor-canvas .ProseMirror { outline: none; }
.editor-canvas .ProseMirror p { margin: 0 0 0.85em; }
.editor-canvas .ProseMirror h1 { font-family: var(--display); font-size: 1.8rem; font-weight: 500; letter-spacing: -0.015em; line-height: 1.15; margin: 1em 0 0.55em; border-bottom: 2px solid var(--canvas-h1-border); padding-bottom: 0.35rem; color: var(--canvas-fg); }
.editor-canvas .ProseMirror h2 { font-family: var(--display); font-size: 1.35rem; font-weight: 500; letter-spacing: -0.01em; margin: 1.25em 0 0.5em; color: var(--canvas-h2-color); }
.editor-canvas .ProseMirror h3 { font-family: var(--display); font-size: 1.1rem; font-weight: 500; font-style: italic; margin: 1em 0 0.4em; color: var(--canvas-fg); }
.editor-canvas .ProseMirror strong { font-weight: 600; color: var(--canvas-h2-color); }
.editor-canvas .ProseMirror em { font-style: italic; color: var(--canvas-muted); }
.editor-canvas .ProseMirror blockquote { border-left: 3px solid var(--canvas-blockquote-bar); background: var(--canvas-blockquote-bg); border-radius: 0 2px 2px 0; margin: 0.75rem 0; padding: 0.5rem 1.25rem; font-style: italic; color: var(--canvas-blockquote-fg); }
.editor-canvas .ProseMirror code { font-family: var(--mono); font-size: 0.85em; background: var(--canvas-code-bg); border: 1px solid var(--canvas-code-border); border-radius: 2px; padding: 0.08rem 0.35rem; color: var(--canvas-code-fg); }
.editor-canvas .ProseMirror pre { font-family: var(--mono); font-size: 0.85em; background: var(--canvas-pre-bg); color: var(--canvas-pre-fg); border-radius: 4px; padding: 1rem 1.25rem; margin: 0.85rem 0; line-height: 1.65; overflow-x: auto; }
.editor-canvas .ProseMirror pre code { background: none; border: none; padding: 0; color: inherit; }
.editor-canvas .ProseMirror ul { list-style: disc outside; padding-left: 1.75em; margin: 0.5em 0; }
.editor-canvas .ProseMirror ol { list-style: decimal outside; padding-left: 2em; margin: 0.5em 0; }
.editor-canvas .ProseMirror ol ol { list-style-type: lower-alpha; }
.editor-canvas .ProseMirror ol ol ol { list-style-type: lower-roman; }
.editor-canvas .ProseMirror ul ul { list-style-type: circle; }
.editor-canvas .ProseMirror li { margin-bottom: 0.25em; padding-left: 0.15em; }
.editor-canvas .ProseMirror li::marker { color: var(--gold); font-weight: 600; font-family: var(--mono); }
.editor-canvas .ProseMirror li p { margin: 0; display: inline; }
.editor-canvas .ProseMirror table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; font-size: 0.9rem; }
.editor-canvas .ProseMirror th, .editor-canvas .ProseMirror td { border: 1px solid var(--b1); padding: 0.5rem 0.75rem; text-align: left; }
.editor-canvas .ProseMirror th { background: var(--depth); font-family: var(--mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-2); font-weight: 600; }

/* ── Blocs personnalisés ── */
.ed-partie { border: 1px solid var(--b1); border-radius: 8px; padding: 1.25rem 1.5rem; background: var(--lift); position: relative; margin: 1rem 0; }
.ed-partie::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--gold); border-radius: 8px 0 0 8px; }
.ed-partie-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.ed-partie-label { display: flex; align-items: center; gap: 0.65rem; font-family: var(--mono); font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gold); }
.ed-partie-title { color: var(--text); font-size: 0.85rem; }
.ed-partie-content { padding-top: 0.5rem; }
.ed-exercice { border: 1px dashed var(--b1); border-radius: 4px; padding: 1rem 1.25rem; background: var(--depth); margin: 0.75rem 0; }
.ed-exercice-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
.ed-exercice-label { display: flex; align-items: center; gap: 0.4rem; font-family: var(--mono); font-size: 0.72rem; text-transform: uppercase; color: var(--gold); }
.ed-exercice-content { padding-top: 0.25rem; }
.ed-enonce { border-left: 3px solid var(--text-3); background: var(--surface); padding: 0.8rem 1.1rem; font-style: italic; margin: 0.75rem 0; }
.ed-enonce-label { display: block; font-family: var(--mono); font-size: 0.6rem; text-transform: uppercase; color: var(--text-4); margin-bottom: 0.4rem; font-style: normal; }
.ed-question { display: flex; align-items: flex-start; gap: 0.65rem; background: var(--surface); border: 1px solid var(--b1); border-radius: 4px; padding: 0.6rem 0.85rem; margin: 0.5rem 0; }
.ed-question-num { font-family: var(--mono); color: var(--gold); min-width: 28px; font-size: 0.85rem; flex-shrink: 0; padding-top: 1px; }
.ed-question-content { flex: 1; }
.ed-question-meta { display: flex; align-items: center; gap: 0.3rem; flex-shrink: 0; }
.ed-annotation { border-radius: 4px; padding: 0.65rem 1rem; margin: 0.75rem 0; }
.ed-annotation--amber { border: 1px solid var(--amber-line); background: var(--amber-dim); }
.ed-annotation--sage  { border: 1px solid var(--sage-line);  background: var(--sage-dim);  }
.ed-annotation--blue  { border: 1px solid var(--blue-line);  background: var(--blue-dim);  }
.ed-annotation--ruby  { border: 1px solid var(--ruby-line);  background: var(--ruby-dim);  }
.ed-annotation--neutre { border: 1px solid var(--b1); background: var(--surface); }
.ed-annotation-header { display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.5rem; }
.ed-annotation-icon { font-size: 0.9rem; }
.ed-annotation-label { font-family: var(--mono); font-size: 0.58rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-3); }
.ed-formula { background: var(--surface); border: 1px solid var(--b1); border-radius: 8px; padding: 0.85rem 1.25rem; text-align: center; margin: 0.75rem 0; overflow-x: auto; }
.ed-formula-render { min-height: 32px; display: flex; align-items: center; justify-content: center; }
.ed-inline-math { display: inline; padding: 1px 4px; margin: 0 1px; border-radius: 3px; background: rgba(201,168,76,0.06); white-space: nowrap; }
.ed-inline-math-render { display: inline; }
.ed-inline-math-render .katex { font-size: 1em; }
.ed-schema { border: 2px dashed var(--b1); border-radius: 8px; padding: 2rem 1.5rem; text-align: center; margin: 0.75rem 0; }
.ed-bloc-num { font-family: var(--mono); font-size: 0.8rem; font-weight: 600; }
.ed-bloc-icon { font-size: 0.85rem; }
.ed-points-label { font-family: var(--mono); font-size: 0.65rem; color: var(--text-4); }
.ed-points-display { font-family: var(--mono); font-size: 0.85rem; color: var(--gold); }

/* ── Cacher les contrôles d'édition en mode lecture ── */
.ed-bloc-controls, .ed-ctrl-btn, .ed-ctrl-abs,
.ed-correction-toggle, .ed-parts-toggle { display: none !important; }
.ed-points-input { display: none !important; }

/* ── Sauts de page ── */
.ed-partie { page-break-inside: avoid; break-inside: avoid; }
.ed-exercice { page-break-inside: avoid; break-inside: avoid; }

/* ── Section correction ── */
.ai-correction-section { margin-top: 24px; }
.ai-correction-item { margin-bottom: 16px; padding: 12px; border: 1px solid var(--b1); border-radius: 4px; background: var(--surface); }
.ai-correction-question { font-family: var(--mono); font-size: 0.75rem; color: var(--gold); margin-bottom: 6px; }
.ai-correction-answer { font-size: 0.9rem; color: var(--text); line-height: 1.6; }
`

// ── Template HTML complet ─────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

export function buildPDFDocument(opts: GeneratePDFOptions): string {
  const { bodyHTML, meta, trace, filename: _f } = opts

  const metaChips: string[] = []
  if (meta.matiere) metaChips.push(`<span class="pdf-header-chip"><span class="pdf-header-chip-label">Matière :</span><span class="pdf-header-chip-value">${escHtml(meta.matiere)}</span></span>`)
  if (meta.examType || meta.serie) metaChips.push(`<span class="pdf-header-chip"><span class="pdf-header-chip-label">Examen :</span><span class="pdf-header-chip-value">${escHtml([meta.examType, meta.serie].filter(Boolean).join(' · '))}</span></span>`)
  if (meta.anneeScolaire) metaChips.push(`<span class="pdf-header-chip"><span class="pdf-header-chip-label">Année :</span><span class="pdf-header-chip-value">${escHtml(meta.anneeScolaire)}</span></span>`)
  if (meta.duree) metaChips.push(`<span class="pdf-header-chip"><span class="pdf-header-chip-label">Durée :</span><span class="pdf-header-chip-value">${escHtml(meta.duree)}</span></span>`)
  if (meta.coefficient) metaChips.push(`<span class="pdf-header-chip"><span class="pdf-header-chip-label">Coef. :</span><span class="pdf-header-chip-value">${meta.coefficient}</span></span>`)

  const watermarkLines = [trace.watermarkCode, trace.userEmail || trace.userName]
    .flatMap(l => [l, l, l]).join('\n')

  const formattedDate = formatDate(trace.downloadedAt)

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css" crossorigin="anonymous">
  <style>${EMBEDDED_CSS}</style>
</head>
<body>
  <!-- Filigrane -->
  <div class="pdf-watermark" aria-hidden="true">${escHtml(watermarkLines)}</div>

  <!-- Pied de page fixe -->
  <div class="pdf-footer">
    <span>${escHtml(meta.matiere || 'Mah.AI')} · ${escHtml(trace.userName)}</span>
    <span class="pdf-footer-code">${escHtml(trace.watermarkCode)}</span>
    <span>${escHtml(formattedDate)}</span>
  </div>

  <!-- Contenu principal -->
  <div style="position:relative;z-index:1;padding-bottom:20mm;">
    <!-- En-tête du sujet -->
    <div class="pdf-header">
      <div class="pdf-header-brand">Mah.AI · Annales Madagascar</div>
      <div class="pdf-header-title">${escHtml(meta.title)}</div>
      <div class="pdf-header-meta">${metaChips.join('')}</div>
    </div>

    <!-- Corps (sujet ± correction) -->
    ${bodyHTML}
  </div>
</body>
</html>`
}

function escHtml(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ── Appel API + déclenchement téléchargement ─────────────────────────────────

export async function generateAndDownloadPDF(
  opts: GeneratePDFOptions & { filename: string }
): Promise<void> {
  const htmlContent = buildPDFDocument(opts)

  const response = await fetch('/api/pdf/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ htmlContent, filename: opts.filename }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `Erreur PDF: ${response.status}`)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = opts.filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
