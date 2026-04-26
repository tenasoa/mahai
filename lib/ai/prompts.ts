/**
 * Prompts système pour les corrections IA Mah.AI.
 *
 * Règles communes appliquées par les deux modes :
 *  - Réponses en français, sans citations [1] [2] (typique de Perplexity).
 *  - Équations en LaTeX : `$x^2$` inline, `$$\int_0^1 f(x)\,dx$$` blocs.
 *  - Markdown léger autorisé (gras, listes, titres ###).
 *  - Sortie JSON strictement conforme au schéma fourni (cf. lib/ai/schemas.ts).
 */

export const COMMON_RULES = `RÈGLES DE FORMATAGE OBLIGATOIRES :
- Tu réponds UNIQUEMENT en français.
- N'inclus JAMAIS de marqueurs de citation [1], [2], (Source), URL, ou références bibliographiques. Tu n'as pas besoin de citer de sources externes — tu corriges un sujet d'examen.
- Toutes les équations / formules mathématiques DOIVENT être en LaTeX :
  • inline avec un seul \`$\` : \`$f(x) = ax^2 + b$\`
  • bloc / centré avec deux \`$$\` : \`$$\\int_0^{1} e^{-x^2}\\,dx$$\`
- Pour les unités physiques avec exposant : \`$\\mathrm{m \\cdot s^{-2}}$\`.
- Pour les vecteurs : \`$\\vec{u}$\`.
- Markdown autorisé : **gras**, *italique*, listes \`-\`, sous-titres \`###\`.
- Pour la chimie : \`$\\ce{H2SO4}$\` (paquet mhchem) ou notation classique.
- Sois précis, pédagogique, structuré. Adapte le niveau (CEPE / BEPC / BAC).`

export const SYSTEM_PROMPT_SUBMISSION = `Tu es un correcteur expert pour les examens nationaux malgaches (BAC, BEPC, CEPE).

L'utilisateur t'envoie :
  1. L'énoncé d'un sujet d'examen (au format texte structuré).
  2. Ses propres réponses à chaque question.

Pour CHAQUE question, tu dois retourner :
  - "questionLabel" : un identifiant court de la question (ex: "Exercice 2 — Q1").
  - "userAnswer"    : la réponse fournie par l'élève (recopiée pour repère).
  - "verdict"       : "correct" | "partial" | "incorrect" | "missing".
  - "score"         : note proposée sur le barème de la question (ex: 1.5/2).
  - "feedback"      : explication pédagogique (ce qui marche, ce qui manque).
  - "correctAnswer" : la solution attendue, étape par étape, avec les équations en LaTeX.

À la fin, ajoute un bloc "summary" avec :
  - "totalScore"    : note globale (ex: "12/20").
  - "strengths"     : 1-3 points forts.
  - "improvements"  : 1-3 axes de progrès concrets.

${COMMON_RULES}`

export const SYSTEM_PROMPT_DIRECT = `Tu es un correcteur expert pour les examens nationaux malgaches (BAC, BEPC, CEPE).

L'utilisateur t'envoie l'énoncé complet d'un sujet d'examen. Tu dois fournir
la correction modèle attendue, comme si tu étais le professeur qui rédige le
corrigé officiel — clair, structuré, complet.

Pour CHAQUE question (et chaque sous-question) :
  - "questionLabel" : identifiant (ex: "Partie A — Exercice 1 — Q3").
  - "verdict"       : toujours "model" (c'est une correction modèle, pas une évaluation).
  - "correctAnswer" : la solution complète, raisonnée, avec toutes les étapes intermédiaires en LaTeX.
  - "feedback"      : conseil méthodologique pour l'élève (piège classique, astuce, raccourci).

À la fin, ajoute un bloc "summary" avec :
  - "totalScore"    : laisse vide ou "—" (pas d'évaluation ici).
  - "strengths"     : laisse vide.
  - "improvements"  : 2-3 conseils méthodologiques généraux pour ce type de sujet.

${COMMON_RULES}`

/**
 * Convertit le contenu TipTap (JSON) en texte lisible pour le modèle.
 * On garde la structure (parties, exercices, énoncés, questions, formules)
 * mais on aplatit en texte que Claude peut analyser.
 */
export function tiptapToText(content: any): string {
  if (!content) return ''
  const lines: string[] = []

  function walk(node: any, depth = 0) {
    if (!node) return
    const { type, attrs, content: children, text } = node

    switch (type) {
      case 'doc':
        children?.forEach((c: any) => walk(c, depth))
        break
      case 'partie':
        lines.push(`\n## PARTIE ${attrs?.numero ?? ''}${attrs?.titre ? ` — ${attrs.titre}` : ''}`)
        children?.forEach((c: any) => walk(c, depth + 1))
        break
      case 'exercice':
        lines.push(`\n### EXERCICE ${attrs?.numero ?? ''}${attrs?.points ? ` (${attrs.points} pts)` : ''}`)
        children?.forEach((c: any) => walk(c, depth + 1))
        break
      case 'enonce':
        lines.push(`\n[ÉNONCÉ]`)
        children?.forEach((c: any) => walk(c, depth + 1))
        break
      case 'question': {
        const num = attrs?.numero ?? '?'
        const pts = attrs?.points ? ` (${attrs.points} pts)` : ''
        const inline = (children || [])
          .map((c: any) => {
            if (c?.type === 'text') return c.text || ''
            if (c?.type === 'inlineMath') return `$${c.attrs?.latex || ''}$`
            return c?.text || ''
          })
          .join('')
        lines.push(`Q${num}.${pts ? ' ' + pts : ''} ${inline}`)
        break
      }
      case 'annotation':
        lines.push(`[${(attrs?.type || 'note').toUpperCase()}]`)
        children?.forEach((c: any) => walk(c, depth + 1))
        break
      case 'formula':
        if (attrs?.latex) lines.push(`$$${attrs.latex}$$`)
        break
      case 'schema':
        lines.push(`[Schéma : ${attrs?.filename || 'image'}]`)
        break
      case 'heading': {
        const level = attrs?.level || 1
        const inline = (children || []).map((c: any) => c?.text || '').join('')
        lines.push(`${'#'.repeat(level)} ${inline}`)
        break
      }
      case 'paragraph': {
        // Sérialise le contenu inline en gardant les formules KaTeX inline
        // sous leur forme `$latex$` pour que le modèle puisse les lire
        // exactement comme l'utilisateur les a écrites.
        const inline = (children || [])
          .map((c: any) => {
            if (c?.type === 'text') return c.text || ''
            if (c?.type === 'inlineMath') return `$${c.attrs?.latex || ''}$`
            return c?.text || ''
          })
          .join('')
        if (inline.trim()) lines.push(inline)
        break
      }
      case 'bulletList':
      case 'orderedList':
        children?.forEach((item: any, i: number) => {
          const bullet = type === 'orderedList' ? `${i + 1}.` : '•'
          const inline = item?.content?.[0]?.content?.map((c: any) => c?.text || '').join('') || ''
          lines.push(`  ${bullet} ${inline}`)
        })
        break
      case 'codeBlock':
        lines.push('```')
        children?.forEach((c: any) => walk(c, depth + 1))
        lines.push('```')
        break
      case 'table': {
        // Rendu Markdown-like : chaque ligne séparée par |
        const rows: string[][] = []
        let isFirstRow = true
        ;(children || []).forEach((row: any) => {
          const cells = (row?.content || []).map((cell: any) =>
            (cell?.content || [])
              .map((c: any) => {
                if (!c) return ''
                if (c.type === 'paragraph') {
                  return (c.content || [])
                    .map((x: any) => {
                      if (x?.type === 'text') return x.text || ''
                      if (x?.type === 'inlineMath') return `$${x.attrs?.latex || ''}$`
                      return ''
                    })
                    .join('')
                }
                return ''
              })
              .join(' ')
              .trim()
          )
          rows.push(cells)
          if (isFirstRow) {
            isFirstRow = false
          }
        })
        if (rows.length > 0) {
          rows.forEach((cells, i) => {
            lines.push('| ' + cells.join(' | ') + ' |')
            if (i === 0) lines.push('|' + cells.map(() => '---').join('|') + '|')
          })
        }
        break
      }
      case 'blockquote':
        ;(children || []).forEach((c: any) => {
          const innerLines: string[] = []
          // Walk inside blockquote to extract text
          if (c?.content) {
            c.content.forEach((x: any) => {
              if (x?.type === 'text') innerLines.push(x.text || '')
            })
          }
          if (innerLines.length) lines.push('> ' + innerLines.join(''))
        })
        break
      case 'horizontalRule':
        lines.push('---')
        break
      case 'text':
        if (text) lines.push(text)
        break
      default:
        children?.forEach((c: any) => walk(c, depth + 1))
    }
  }

  walk(content)
  return lines.join('\n').trim()
}
