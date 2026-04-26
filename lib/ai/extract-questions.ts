/**
 * Extrait la liste des questions d'un sujet TipTap pour générer un formulaire
 * d'exercice (mode SUBMISSION). Renvoie un identifiant unique par question
 * (utilisé comme clé pour `userAnswers` envoyé à l'IA).
 */

export interface ExtractedQuestion {
  /** Clé stable utilisée comme champ formulaire et identifiant pour l'IA. */
  key: string
  /** Libellé court à afficher (ex: "Partie A — Exercice 1 — Q3"). */
  label: string
  /** Texte complet de la question (énoncé). */
  text: string
  /** Points associés (si déclarés sur le node). */
  points?: number | string
}

interface Ctx {
  partie?: string | number
  exercice?: string | number
}

export function extractQuestions(content: any): ExtractedQuestion[] {
  if (!content || !content.content) return []

  const result: ExtractedQuestion[] = []

  function walk(node: any, ctx: Ctx) {
    if (!node) return
    const { type, attrs, content: children } = node

    let nextCtx = ctx
    if (type === 'partie') {
      nextCtx = { ...ctx, partie: attrs?.numero ?? attrs?.titre ?? '?' }
    } else if (type === 'exercice') {
      nextCtx = { ...ctx, exercice: attrs?.numero ?? '?' }
    } else if (type === 'question') {
      const num = attrs?.numero ?? result.length + 1
      const text = (children || []).map((c: any) => c?.text || '').join('').trim()
      const labelParts: string[] = []
      if (ctx.partie) labelParts.push(`Partie ${ctx.partie}`)
      if (ctx.exercice) labelParts.push(`Ex. ${ctx.exercice}`)
      labelParts.push(`Q${num}`)
      result.push({
        key: `q_${ctx.partie ?? '_'}_${ctx.exercice ?? '_'}_${num}_${result.length}`,
        label: labelParts.join(' — '),
        text: text || `Question ${num}`,
        points: attrs?.points,
      })
      return
    }

    if (Array.isArray(children)) {
      for (const child of children) walk(child, nextCtx)
    }
  }

  walk(content, {})
  return result
}
