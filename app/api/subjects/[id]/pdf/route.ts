import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import { generateSubjectPDF } from '@/lib/subject-to-pdf'
import { recordSubjectDownload } from '@/actions/subject-download'
import type { SubjectMeta } from '@/lib/subject-to-pdf'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    // Auth
    const supabase = await createSupabaseServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const userId = session.user.id

    // Vérifier l'accès
    const accessRes = await query(
      `SELECT
         u.role,
         (SELECT 1 FROM "Purchase"
            WHERE "userId" = u.id AND "subjectId" = $2 AND status = 'COMPLETED'
            LIMIT 1) AS "hasPurchase",
         (SELECT 1 FROM "Subject" WHERE id = $2 AND "authorId" = u.id LIMIT 1) AS "isAuthor"
       FROM "User" u WHERE u.id = $1 LIMIT 1`,
      [userId, id],
    )

    const userRow = accessRes.rows[0]
    if (!userRow) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const isPrivileged = ['ADMIN', 'VALIDATEUR', 'VERIFICATEUR'].includes(userRow.role)
    if (!userRow.hasPurchase && !userRow.isAuthor && !isPrivileged) {
      return NextResponse.json({ error: 'Accès refusé. Achetez le sujet.' }, { status: 403 })
    }

    // Charger le sujet
    const subjectRes = await query(
      `SELECT
         id, titre, type, matiere, annee, serie, pages, prix,
         difficulte, duree, coefficient, etablissement,
         description, content
         u.prenom || ' ' || u.nom AS "authorName"
       FROM "Subject" s
       LEFT JOIN "User" u ON s."authorId" = u.id
       WHERE s.id = $1 LIMIT 1`,
      [id],
    )

    const subjectRow = subjectRes.rows[0]
    if (!subjectRow) {
      return NextResponse.json({ error: 'Sujet introuvable' }, { status: 404 })
    }

    // Enregistrer le téléchargement (traçabilité)
    const trace = await recordSubjectDownload(id)
    const traceCode = trace.success ? trace.data.watermarkCode : undefined

    // Construire le meta
    const meta: SubjectMeta = {
      titre: subjectRow.titre,
      matiere: subjectRow.matiere,
      type: subjectRow.type,
      annee: subjectRow.annee,
      serie: subjectRow.serie,
      pages: subjectRow.pages,
      duree: subjectRow.duree,
      coefficient: subjectRow.coefficient,
      difficulte: subjectRow.difficulte,
      authorName: subjectRow.authorName,
      etablissement: subjectRow.etablissement,
      description: subjectRow.description,
    }

    // Générer le PDF vectoriel
    const pdfBuffer = await generateSubjectPDF(meta, subjectRow.content, traceCode)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeURIComponent(subjectRow.titre || 'sujet')}.pdf"`,
      },
    })
  } catch (error) {
    console.error('[subject-pdf] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 },
    )
  }
}