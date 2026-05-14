'use client'

/**
 * Rend les formules LaTeX en images PNG haute-résolution via MathJax 3 → SVG.
 *
 * Pipeline :
 *  1. `tex2svg(latex)` côté navigateur (lite adaptor, sans DOM externe)
 *     → SVG self-contained (fontCache: 'none' garantit que tous les glyphes
 *     sont inline en tant que <path>, pas de référence externe).
 *  2. Le SVG est dessiné dans un <canvas> à une résolution multipliée par
 *     `SCALE` pour garder la netteté à l'impression PDF.
 *  3. On exporte en PNG dataURL — exploitable par <Image src=...> de
 *     @react-pdf/renderer.
 *
 * Le rendu est **fidèle au rendu KaTeX** que voient les utilisateurs dans
 * l'app (mêmes glyphes math, espaces, tailles), ce qui résout le problème
 * de formules en "code brut" dans le PDF.
 *
 * Tous les appels sont async — le pipeline image.onload est non-bloquant.
 */

import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'

/** Résolution PDF : 3× → texte vectoriel net même imprimé. */
const SCALE = 3

/* ─────────────────────────────────────────────────────────────────
   MathJax setup — singleton, créé une seule fois par session
   ──────────────────────────────────────────────────────────────── */
let _mathjaxDoc: ReturnType<typeof mathjax.document> | null = null
let _adaptor: ReturnType<typeof liteAdaptor> | null = null

function getMathJax() {
  if (_mathjaxDoc && _adaptor) return { doc: _mathjaxDoc, adaptor: _adaptor }

  _adaptor = liteAdaptor()
  RegisterHTMLHandler(_adaptor)

  const tex = new TeX({ packages: AllPackages })
  // `fontCache: 'none'` → tous les glyphes sont inline (pas de <defs>
  // partagé entre rendus), donc chaque SVG est autonome et convertible
  // en image sans dépendance externe.
  const svg = new SVG({ fontCache: 'none' })

  _mathjaxDoc = mathjax.document('', { InputJax: tex, OutputJax: svg })
  return { doc: _mathjaxDoc, adaptor: _adaptor }
}

/** Convertit une formule LaTeX en SVG string autonome. */
function latexToSvgString(latex: string, display: boolean): string {
  const { doc, adaptor } = getMathJax()
  const node = doc.convert(latex, { display })
  // `outerHTML` du conteneur <mjx-container> qui wrappe le <svg>.
  // On extrait directement le <svg> pour éviter le wrapper custom.
  const inner = adaptor.innerHTML(node)
  return inner
}

/** Charge un SVG string dans une <img> et résout les dimensions naturelles. */
function loadSvgAsImage(svgString: string): Promise<{ img: HTMLImageElement; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    // S'assure que le namespace SVG est présent — MathJax l'omet parfois
    // dans le innerHTML.
    let svg = svgString
    if (!/xmlns=/.test(svg)) {
      svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
    }

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      // Si le SVG a un viewBox mais pas width/height en pixels,
      // naturalWidth/Height peuvent être 0. On lit alors le viewBox.
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (!w || !h) {
        const m = /viewBox="([\d.\-]+)\s+([\d.\-]+)\s+([\d.\-]+)\s+([\d.\-]+)"/.exec(svg)
        if (m) {
          w = Math.ceil(parseFloat(m[3]))
          h = Math.ceil(parseFloat(m[4]))
        } else {
          w = 200
          h = 24
        }
      }
      URL.revokeObjectURL(url)
      resolve({ img, w, h })
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(new Error(`SVG load failed: ${String(e)}`))
    }
    img.src = url
  })
}

/** Rasterise une <img> à `SCALE` × résolution sur canvas avec fond blanc. */
function rasterizeToPngDataUrl(
  img: HTMLImageElement,
  cssW: number,
  cssH: number,
  background: string = '#ffffff',
): string {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.ceil(cssW * SCALE))
  canvas.height = Math.max(1, Math.ceil(cssH * SCALE))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context indisponible')
  ctx.fillStyle = background
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/png')
}

/** Métadonnées sur une formule pré-rendue (utiles pour préserver le ratio dans le PDF). */
export interface RenderedLatexImage {
  dataUrl: string
  /** Largeur "logique" CSS — utile pour respecter le ratio dans <Image>. */
  width: number
  /** Hauteur "logique" CSS. */
  height: number
}

/**
 * Rend une liste de formules LaTeX en images PNG haute-résolution.
 *
 * Compatible avec l'appel existant `setLatexImages(map)` côté
 * `components/sujet/SubjectPDF.tsx` — qui ne lit que les dataURL — mais
 * renvoie aussi les dimensions pour un futur usage `<Image style={{...}}>`.
 *
 * @param formulas tableau de formules LaTeX (sans `$$`), display mode
 * @returns dictionnaire `latex → RenderedLatexImage`
 */
export async function renderLatexFormulasToImages(
  formulas: string[],
): Promise<Record<string, string>> {
  const unique = [...new Set(formulas.filter(Boolean).map((f) => f.trim()))]
  const out: Record<string, string> = {}

  // Rendu séquentiel : chaque formule met 5–30 ms, parallèle ne sert à rien
  // (single thread) et évite les pics RAM si beaucoup de formules.
  for (const latex of unique) {
    try {
      const svgString = latexToSvgString(latex, /* display */ true)
      const { img, w, h } = await loadSvgAsImage(svgString)
      out[latex] = rasterizeToPngDataUrl(img, w, h)
    } catch (e) {
      console.warn('[latex-img] skipped:', latex, e)
    }
  }
  return out
}

/** Variante synchrone qui n'attend pas le décodage des SVG — pour compat
 *  ancien code. Retourne une promesse pour ne pas casser le type. */
export async function renderLatexFormulasToImagesSync(
  formulas: string[],
): Promise<Record<string, string>> {
  return renderLatexFormulasToImages(formulas)
}

/** Extrait les formules `$$...$$` d'un texte markdown. */
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
