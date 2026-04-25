import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { SujetDetailSkeleton } from '@/components/ui/PageSkeletons'
import { ConsultClient } from './ConsultClient'

interface ConsultPageProps {
  params: Promise<{ id: string }>
}

export default async function ConsultPage({ params }: ConsultPageProps) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Vérifie l'accès et charge le sujet en une requête.
  // Accès accordé si :
  //   - achat COMPLETED OU
  //   - utilisateur auteur OU
  //   - rôle privilégié (ADMIN/VALIDATEUR/VERIFICATEUR)
  const accessRes = await query(
    `SELECT
       s.*,
       (SELECT 1 FROM "Purchase"
          WHERE "userId" = $1 AND "subjectId" = s.id AND status = 'COMPLETED'
          LIMIT 1) AS "hasPurchase",
       u.role AS "viewerRole",
       (TRIM(CONCAT_WS(' ', auth_u.prenom, auth_u.nom))) AS "authorName"
     FROM "Subject" s
     LEFT JOIN "User" u ON u.id = $1
     LEFT JOIN "User" auth_u ON auth_u.id = s."authorId"
     WHERE s.id = $2
     LIMIT 1`,
    [user.id, id]
  )

  const row = accessRes.rows[0]
  if (!row) notFound()

  const isAuthor = row.authorId === user.id
  const isPrivileged = ['ADMIN', 'VALIDATEUR', 'VERIFICATEUR'].includes(row.viewerRole)
  const hasAccess = !!row.hasPurchase || isAuthor || isPrivileged

  if (!hasAccess) {
    redirect(`/sujet/${id}`)
  }

  const subject = {
    id: row.id,
    titre: row.title || row.titre,
    matiere: row.matiere,
    annee: row.annee ? String(row.annee) : '',
    type: row.type || row.examType || row.niveau,
    serie: row.serie,
    pages: row.pages,
    duree: row.duree,
    coefficient: row.coefficient,
    examType: row.examType,
    baccType: row.baccType,
    bepcOption: row.bepcOption,
    concoursType: row.concoursType,
    etablissement: row.etablissement,
    filiere: row.filiere,
    semestre: row.semestre,
    anneeScolaire: row.anneeScolaire,
    dateOfficielle: row.dateOfficielle,
    authorName: row.authorName || null,
    hasCorrectionIa: row.hasCorrectionIa,
    hasCorrectionProf: row.hasCorrectionProf,
    content: row.content,
  }

  return (
    <Suspense fallback={<SujetDetailSkeleton />}>
      <ConsultClient subject={subject} />
    </Suspense>
  )
}
