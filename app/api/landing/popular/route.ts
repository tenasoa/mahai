import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET /api/landing/popular — top sujets pour la showcase de la landing.
// Tri : ventes (Purchase COMPLETED) → rating → featured → récents.
// Tolérant : renvoie [] plutôt que d'échouer si une jointure manque.
export async function GET() {
  try {
    const result = await query(
      `SELECT
         s.id,
         s.titre,
         s.type,
         s.matiere,
         s.annee,
         s.credits,
         s.badge,
         s.glyph,
         s.rating,
         s."reviewsCount",
         s.pages,
         s."hasCorrectionIa",
         COALESCE(p_count.count, 0)::int AS sales
       FROM "Subject" s
       LEFT JOIN (
         SELECT "subjectId", COUNT(*) AS count
         FROM "Purchase"
         WHERE status = 'COMPLETED'
         GROUP BY "subjectId"
       ) p_count ON p_count."subjectId" = s.id
       WHERE s.status = 'PUBLISHED'
       ORDER BY
         sales DESC,
         s.rating DESC NULLS LAST,
         s.featured DESC,
         s."createdAt" DESC
       LIMIT 6`,
      []
    )

    return NextResponse.json({
      subjects: result.rows.map((row: any) => ({
        id: row.id,
        title: row.titre,
        type: row.type,
        matiere: row.matiere,
        annee: row.annee,
        credits: Number(row.credits) || 0,
        badge: row.badge,
        glyph: row.glyph || '∑',
        rating: Number(row.rating) || 0,
        reviewsCount: Number(row.reviewsCount) || 0,
        pages: Number(row.pages) || null,
        hasCorrectionIa: Boolean(row.hasCorrectionIa),
        sales: Number(row.sales) || 0,
      })),
    })
  } catch (err) {
    console.error('GET /api/landing/popular error:', err)
    return NextResponse.json({ subjects: [] }, { status: 200 })
  }
}
