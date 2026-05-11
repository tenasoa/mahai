import { mapAICorrectionHistoryRows } from '@/lib/ai-correction-history'

describe('mapAICorrectionHistoryRows', () => {
  it('normalizes correction rows for the user-facing history list', () => {
    const rows = [
      {
        id: 'corr-1',
        mode: 'DIRECT' as const,
        aiResult: { items: [], summary: { totalScore: '—', strengths: [], improvements: [] } },
        costAr: '120',
        model: 'cached',
        cachedFromPoolId: 'pool-1',
        createdAt: new Date('2026-05-12T08:30:00.000Z'),
      },
    ]

    expect(mapAICorrectionHistoryRows(rows)).toEqual([
      {
        correctionId: 'corr-1',
        mode: 'DIRECT',
        result: rows[0].aiResult,
        costAr: 120,
        model: 'cached',
        fromCache: true,
        createdAt: '2026-05-12T08:30:00.000Z',
      },
    ])
  })
})
