'use client'

/**
 * Rend les formules LaTeX display ($$...$$) en images PNG via Canvas API natif.
 *
 * N'utilise pas html2canvas ni aucun fetch réseau — évite les NetworkError
 * liées au chargement des polices KaTeX. La formule est d'abord simplifiée
 * en texte lisible (via simplifyLatexText), puis rendue sur canvas avec une
 * police monospace système, dans le même style que le bloc formulaBlock du PDF.
 */

/** Même logique que simplifyLatex dans SubjectPDF — dupliquée pour éviter
 *  de rendre SubjectPDF importable côté lib (il est 'use client' react-pdf). */
function simplifyLatexText(latex: string): string {
  let s = latex
  for (let pass = 0; pass < 5; pass++) {
    s = s
      .replace(/\\(?:text|mathrm|textbf|textit|textrm|mathbf|mathit|mathcal|operatorname)\{([^{}]*)\}/g, '$1')
      .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2')
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
    .replace(/\(([^()]+)\)\/\(([^()]+)\)/g, '$1/$2')
    .replace(/\s+/g, ' ')
    .trim()
  // Translittération basique Unicode → ASCII
  return s.replace(/[^\x00-\xFF]/g, ch => {
    const map: Record<string, string> = {
      '→': '->', '←': '<-', '⇒': '=>', '⇔': '<=>',
      '≤': '<=', '≥': '>=', '≠': '!=', '≈': '~=',
      '±': '+/-', '×': 'x', '−': '-', '∞': 'inf',
      '∈': 'in', '∀': 'forall', '∃': 'exists',
      'α': 'alpha', 'β': 'beta', 'γ': 'gamma', 'π': 'pi',
      'θ': 'theta', 'λ': 'lambda', 'μ': 'mu', 'σ': 'sigma',
      'Σ': 'Sigma', 'Δ': 'Delta', 'Ω': 'Omega',
    }
    return map[ch] ?? '?'
  })
}

function renderFormulaToImage(formulaText: string): string {
  const dpr = 2.5
  const fontSize = 14
  const px = 14   // padding horizontal
  const py = 9    // padding vertical
  const maxContentWidth = 430
  const font = `${fontSize}px "Courier New", Courier, monospace`

  // Mesure sur un canvas temporaire
  const tmp = document.createElement('canvas').getContext('2d')!
  tmp.font = font

  // Découpe en lignes si le texte dépasse la largeur max
  const tokens = formulaText.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const tok of tokens) {
    const test = cur ? `${cur} ${tok}` : tok
    if (tmp.measureText(test).width > maxContentWidth && cur) {
      lines.push(cur); cur = tok
    } else { cur = test }
  }
  if (cur) lines.push(cur)

  const lineH = fontSize * 1.65
  const contentW = Math.min(
    Math.max(...lines.map(l => tmp.measureText(l).width)),
    maxContentWidth
  )
  const canvasW = contentW + px * 2 + 4
  const canvasH = lines.length * lineH + py * 2

  const canvas = document.createElement('canvas')
  canvas.width  = Math.ceil(canvasW * dpr)
  canvas.height = Math.ceil(canvasH * dpr)

  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  // Fond
  ctx.fillStyle = '#f7f7fb'
  ctx.fillRect(0, 0, canvasW, canvasH)

  // Bordure gauche
  ctx.fillStyle = '#b0b0cc'
  ctx.fillRect(0, 0, 3, canvasH)

  // Texte
  ctx.fillStyle = '#1a1a5a'
  ctx.font = font
  ctx.textBaseline = 'top'
  lines.forEach((line, i) => {
    ctx.fillText(line, px + 2, py + i * lineH, maxContentWidth)
  })

  return canvas.toDataURL('image/png')
}

export function renderLatexFormulasToImages(
  formulas: string[]
): Record<string, string> {
  const unique = [...new Set(formulas.filter(Boolean))]
  const result: Record<string, string> = {}
  for (const latex of unique) {
    try {
      const text = simplifyLatexText(latex)
      if (text) result[latex] = renderFormulaToImage(text)
    } catch (e) {
      console.warn('[latex-img] skipped:', latex, e)
    }
  }
  return result
}

/** Extrait les formules $$...$$ d'un texte markdown. */
export function extractDisplayFormulas(text: string): string[] {
  const re = /\$\$([\s\S]+?)\$\$/g
  const out: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const inner = m[1].trim()
    if (inner) out.push(inner)
  }
  return out
}
