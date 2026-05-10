'use client'

/**
 * Capture un élément HTML en pages PDF via html2canvas + jsPDF.
 *
 * Fonctionnalités :
 * - Largeur canvas = largeur réelle de l'élément (pas de troncature droite)
 * - Coupures de page intelligentes (ligne la plus blanche dans ±3%)
 * - Filigrane diagonal sur chaque page (code de traçabilité + email)
 * - Footer sur chaque page : email · code · date · numéro de page
 */

export interface PDFTrace {
  code: string
  userName: string
  userEmail: string
  downloadedAt: string
}

function injectLightTheme(doc: Document) {
  const el = doc.createElement('style')
  el.textContent = `
    :root {
      color-scheme: light !important;
      /* ── palette de base ── */
      --void: #ffffff !important;
      --depth: #f8f8f8 !important;
      --surface: #ffffff !important;
      --card: #fafaf7 !important;
      --lift: #f5f5f2 !important;
      --text: #0c0c0e !important;
      --text-1: #0c0c0e !important;
      --text-2: #2a2a2a !important;
      --text-3: #555555 !important;
      --text-4: #888888 !important;
      --b1: rgba(26,23,20,0.12) !important;
      --b2: rgba(168,120,42,0.08) !important;
      --b3: rgba(26,23,20,0.04) !important;
      --border-1: #e5e5e5 !important;
      --border-2: #d5d5d5 !important;
      --border-3: #c0c0c0 !important;
      --gold: #C9A84C !important;
      --gold-hi: #e4c06e !important;
      --gold-lo: #a8893e !important;
      --gold-dim: rgba(201,168,76,0.15) !important;
      --gold-line: rgba(201,168,76,0.35) !important;
      --navy: #1c2b4a !important;
      --paper: #ede8e0 !important;
      --ruby-dim: rgba(155,35,53,0.1) !important;
      --ruby-line: rgba(155,35,53,0.24) !important;
      --sage-dim: rgba(74,107,90,0.1) !important;
      --sage-line: rgba(74,107,90,0.24) !important;
      --amber-dim: rgba(201,132,60,0.12) !important;
      --amber-line: rgba(201,132,60,0.28) !important;
      --blue-dim: rgba(58,110,168,0.12) !important;
      --blue-line: rgba(58,110,168,0.24) !important;
      /* ── canvas editor tokens (SubjectRenderer) ── */
      --canvas-bg: #ffffff !important;
      --canvas-fg: #0c0c0e !important;
      --canvas-muted: #2a2a2a !important;
      --canvas-soft: #555555 !important;
      --canvas-h1-border: rgba(26,23,20,0.12) !important;
      --canvas-h2-color: #1c2b4a !important;
      --canvas-link-underline: #C9A84C !important;
      --canvas-list-marker: #C9A84C !important;
      --canvas-blockquote-bar: #C9A84C !important;
      --canvas-blockquote-bg: rgba(201,168,76,0.12) !important;
      --canvas-blockquote-fg: #2a2a2a !important;
      --canvas-code-bg: #ede8e0 !important;
      --canvas-code-border: rgba(26,23,20,0.12) !important;
      --canvas-code-fg: #1c2b4a !important;
      --canvas-pre-bg: #1a1714 !important;
      --canvas-pre-fg: #d4a855 !important;
      --canvas-caret: #C9A84C !important;
    }
    html, body { background: #ffffff !important; color: #0c0c0e !important; }
  `
  doc.head.appendChild(el)
}

function findSafeBreakY(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  targetY: number,
  range: number,
): number {
  const from  = Math.max(0, targetY - range)
  const count = range * 2
  let   data: Uint8ClampedArray
  try {
    data = ctx.getImageData(0, from, canvasWidth, count).data
  } catch {
    return targetY
  }
  let bestRow = 0, bestScore = -1
  for (let row = 0; row < count; row++) {
    let white = 0
    for (let x = 0; x < canvasWidth; x++) {
      const i = (row * canvasWidth + x) * 4
      if ((data[i] + data[i+1] + data[i+2]) / 3 > 230) white++
    }
    const proximity = 1 - Math.abs(row - range) / range
    const score = (white / canvasWidth) * 0.7 + proximity * 0.3
    if (score > bestScore) { bestScore = score; bestRow = row }
  }
  return from + bestRow
}

function drawWatermark(doc: any, trace: PDFTrace, pageW: number, pageH: number) {
  const label = trace.userEmail || trace.userName
  const lines = [trace.code, label, trace.code, label, trace.code]
  doc.setGState(new doc.GState({ opacity: 0.06 }))
  doc.setFontSize(22)
  doc.setTextColor(0, 0, 0)
  const spacing = pageH / (lines.length + 1)
  lines.forEach((line, i) => {
    doc.text(line, pageW / 2, spacing * (i + 1), { align: 'center', angle: -35 })
  })
  doc.setGState(new doc.GState({ opacity: 1 }))
}

function drawFooter(
  doc: any,
  trace: PDFTrace,
  sectionLabel: string,
  pageNum: number,
  pageW: number,
  pageH: number,
  marginMm: number,
) {
  const y = pageH - 6
  const date = (() => {
    try {
      return new Date(trace.downloadedAt).toLocaleString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    } catch { return trace.downloadedAt }
  })()

  // Ligne séparatrice
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(marginMm, pageH - 10, pageW - marginMm, pageH - 10)

  doc.setFontSize(6.5)
  doc.setTextColor(140, 140, 140)

  // Gauche : section + utilisateur
  doc.text(`${sectionLabel} · ${trace.userName}`, marginMm, y)

  // Centre : code de traçabilité en or
  doc.setTextColor(180, 140, 50)
  doc.setFontSize(7)
  doc.text(trace.code, pageW / 2, y, { align: 'center' })

  // Droite : date + page
  doc.setFontSize(6.5)
  doc.setTextColor(140, 140, 140)
  doc.text(`${date}  ·  p. ${pageNum}`, pageW - marginMm, y, { align: 'right' })
}

export async function htmlElementToPDFPages(
  element: HTMLElement,
  options?: {
    pageWidthMm?: number
    pageHeightMm?: number
    marginMm?: number
    scale?: number
    trace?: PDFTrace
    sectionLabel?: string
  }
): Promise<Uint8Array> {
  const [html2canvas, { jsPDF }] = await Promise.all([
    import('html2canvas').then(m => m.default),
    import('jspdf'),
  ])

  const pageWidthMm   = options?.pageWidthMm  ?? 210
  const pageHeightMm  = options?.pageHeightMm ?? 297
  const marginMm      = options?.marginMm     ?? 14
  const scale         = options?.scale        ?? 3
  const trace         = options?.trace
  const sectionLabel  = options?.sectionLabel ?? 'Mah.AI'

  const contentWidthMm  = pageWidthMm  - marginMm * 2
  // Réserve 12mm en bas pour le footer + filigrane
  const contentHeightMm = pageHeightMm - marginMm - (trace ? 14 : marginMm)

  const elementWidthPx = element.scrollWidth || element.offsetWidth || 780

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    width:       elementWidthPx,
    windowWidth: elementWidthPx,
    logging: false,
    onclone: (_doc) => injectLightTheme(_doc),
  })

  const imgWidthMm  = contentWidthMm
  const imgHeightMm = (canvas.height / canvas.width) * imgWidthMm

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const ctx          = canvas.getContext('2d')!
  const searchRange  = Math.round(canvas.height * 0.03)

  let yOffsetMm  = 0
  let pageNum    = 1
  let isFirst    = true

  while (yOffsetMm < imgHeightMm) {
    if (!isFirst) doc.addPage()
    isFirst = false

    const endTheoMm = yOffsetMm + contentHeightMm
    const endTheoPx = Math.round((endTheoMm / imgHeightMm) * canvas.height)
    const safeEndPx = endTheoPx >= canvas.height
      ? canvas.height
      : findSafeBreakY(ctx, canvas.width, endTheoPx, searchRange)

    const yStartPx = Math.round((yOffsetMm / imgHeightMm) * canvas.height)
    const slicePx  = safeEndPx - yStartPx

    const pageCanvas      = document.createElement('canvas')
    pageCanvas.width      = canvas.width
    pageCanvas.height     = slicePx
    const pCtx            = pageCanvas.getContext('2d')!
    pCtx.fillStyle        = '#ffffff'
    pCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
    pCtx.drawImage(canvas, 0, -yStartPx)

    const pageImg       = pageCanvas.toDataURL('image/jpeg', 0.93)
    const sliceHeightMm = (slicePx / canvas.width) * imgWidthMm

    doc.addImage(pageImg, 'JPEG', marginMm, marginMm, imgWidthMm, sliceHeightMm)

    if (trace) {
      drawWatermark(doc, trace, pageWidthMm, pageHeightMm)
      drawFooter(doc, trace, sectionLabel, pageNum, pageWidthMm, pageHeightMm, marginMm)
    }

    yOffsetMm += (slicePx / canvas.height) * imgHeightMm
    pageNum++
  }

  return new Uint8Array(doc.output('arraybuffer') as ArrayBuffer)
}
