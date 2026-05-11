import type { AICorrectionResult } from '@/lib/ai/schemas'

function extractDisplayFormulasFromText(text: string | undefined): string[] {
  if (!text) return []
  const formulas: string[] = []
  const re = /\$\$([\s\S]+?)\$\$/g
  let match: RegExpExecArray | null

  while ((match = re.exec(text)) !== null) {
    const formula = match[1]?.trim()
    if (formula) formulas.push(formula)
  }

  return formulas
}

export function collectAICorrectionDisplayFormulas(
  correction: AICorrectionResult | null | undefined,
): string[] {
  if (!correction) return []

  const formulas: string[] = []
  for (const item of correction.items || []) {
    formulas.push(...extractDisplayFormulasFromText(item.userAnswer))
    formulas.push(...extractDisplayFormulasFromText(item.correctAnswer))
    formulas.push(...extractDisplayFormulasFromText(item.feedback))
  }

  for (const strength of correction.summary?.strengths || []) {
    formulas.push(...extractDisplayFormulasFromText(strength))
  }
  for (const improvement of correction.summary?.improvements || []) {
    formulas.push(...extractDisplayFormulasFromText(improvement))
  }

  return [...new Set(formulas)]
}
