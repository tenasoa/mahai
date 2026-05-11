import { collectAICorrectionDisplayFormulas } from '@/lib/ai-correction-pdf-data'
import type { AICorrectionResult } from '@/lib/ai/schemas'

describe('collectAICorrectionDisplayFormulas', () => {
  it('collects unique display formulas from correction items and summary', () => {
    const correction: AICorrectionResult = {
      items: [
        {
          questionLabel: 'Q1',
          verdict: 'model',
          correctAnswer: 'On obtient $$x^2 + 1 = 0$$ puis $$\\frac{a}{b}$$.',
          feedback: 'Même formule répétée $$x^2 + 1 = 0$$.',
        },
        {
          questionLabel: 'Q2',
          verdict: 'model',
          correctAnswer: 'Texte sans formule bloc, seulement $x$.',
          feedback: 'Conclusion $$S = \\{1;2\\}$$',
        },
      ],
      summary: {
        totalScore: '—',
        strengths: ['Bonne méthode $$\\Delta = b^2 - 4ac$$'],
        improvements: ['Relire le résultat.'],
      },
    }

    expect(collectAICorrectionDisplayFormulas(correction)).toEqual([
      'x^2 + 1 = 0',
      '\\frac{a}{b}',
      'S = \\{1;2\\}',
      '\\Delta = b^2 - 4ac',
    ])
  })
})
