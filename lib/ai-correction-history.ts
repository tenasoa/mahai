import type { AICorrectionResult } from '@/lib/ai/schemas'

export type AICorrectionHistoryMode = 'SUBMISSION' | 'DIRECT'

export interface AICorrectionHistoryItem {
  correctionId: string
  mode: AICorrectionHistoryMode
  result: AICorrectionResult
  costAr: number
  model: string | null
  fromCache: boolean
  createdAt: string
}

interface AICorrectionHistoryRow {
  id: string
  mode: AICorrectionHistoryMode
  aiResult: AICorrectionResult
  costAr: number | string | null
  model: string | null
  cachedFromPoolId: string | null
  createdAt: Date | string
}

export function mapAICorrectionHistoryRows(
  rows: AICorrectionHistoryRow[],
): AICorrectionHistoryItem[] {
  return rows.map((row) => ({
    correctionId: row.id,
    mode: row.mode,
    result: row.aiResult,
    costAr: Number(row.costAr || 0),
    model: row.model,
    fromCache: Boolean(row.cachedFromPoolId),
    createdAt: new Date(row.createdAt).toISOString(),
  }))
}
