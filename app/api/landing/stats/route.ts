import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET /api/landing/stats — chiffres clés affichés sur la landing.
// Reste tolérant aux erreurs (la landing est publique) : renvoie 0 plutôt
// que de casser le rendu si la DB est indisponible.
export async function GET() {
  try {
    const [subjectsRes, matieresRes, yearsRes, usersRes, aiRes, contribRes] =
      await Promise.all([
        query(`SELECT COUNT(*)::int AS count FROM "Subject" WHERE status = 'PUBLISHED'`),
        query(
          `SELECT COUNT(DISTINCT matiere)::int AS count
           FROM "Subject"
           WHERE status = 'PUBLISHED' AND matiere IS NOT NULL AND matiere <> ''`
        ),
        query(
          `SELECT MIN(annee)::text AS min, MAX(annee)::text AS max
           FROM "Subject"
           WHERE status = 'PUBLISHED' AND annee IS NOT NULL AND annee <> ''`
        ),
        query(`SELECT COUNT(*)::int AS count FROM "User"`),
        query(`SELECT COUNT(*)::int AS count FROM "AICorrection"`).catch(() => ({
          rows: [{ count: 0 }],
        })),
        query(
          `SELECT COUNT(DISTINCT "authorId")::int AS count
           FROM "Subject"
           WHERE status = 'PUBLISHED' AND "authorId" IS NOT NULL`
        ),
      ])

    const subjects = subjectsRes.rows[0]?.count ?? 0
    const matieres = matieresRes.rows[0]?.count ?? 0
    const yearMinRaw = yearsRes.rows[0]?.min ?? null
    const yearMaxRaw = yearsRes.rows[0]?.max ?? null
    const yearMin = yearMinRaw ? parseInt(yearMinRaw, 10) || null : null
    const yearMax = yearMaxRaw ? parseInt(yearMaxRaw, 10) || null : null
    const yearSpan =
      yearMin && yearMax && yearMax >= yearMin ? yearMax - yearMin + 1 : null
    const users = usersRes.rows[0]?.count ?? 0
    const aiCorrections = aiRes.rows[0]?.count ?? 0
    const contributors = contribRes.rows[0]?.count ?? 0

    return NextResponse.json({
      subjects,
      matieres,
      yearMin,
      yearMax,
      yearSpan,
      users,
      aiCorrections,
      contributors,
    })
  } catch (err) {
    console.error('GET /api/landing/stats error:', err)
    return NextResponse.json(
      {
        subjects: 0,
        matieres: 0,
        yearMin: null,
        yearMax: null,
        yearSpan: null,
        users: 0,
        aiCorrections: 0,
        contributors: 0,
      },
      { status: 200 }
    )
  }
}
