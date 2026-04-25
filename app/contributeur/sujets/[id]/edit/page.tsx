import { redirect, notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import { getSubjectDraft } from '../../editor-actions'
import EditorClient from '../../nouveau/EditorClient'

export const metadata = {
  title: 'Modifier le sujet — Mah.AI',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditSubjectPage({ params }: Props) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  const userRes = await query('SELECT role FROM "User" WHERE id = $1', [session.user.id])
  const user = userRes.rows[0]

  if (!user || !['CONTRIBUTEUR', 'ADMIN', 'PROFESSEUR', 'VALIDATEUR', 'VERIFICATEUR'].includes(user.role)) {
    redirect('/dashboard')
  }

  const draft = await getSubjectDraft(id)

  if (!draft) notFound()

  // Éditable si brouillon, ou si l'admin a demandé une révision
  if (draft.status !== 'DRAFT' && draft.status !== 'REVISION_REQUESTED') {
    redirect('/contributeur/sujets')
  }

  return (
    <EditorClient
      isNewSubject={false}
      initialDraftId={id}
      initialData={{
        title:          draft.title,
        matiere:        draft.matiere,
        examType:       draft.examType || '',
        bepcOption:     draft.bepcOption || '',
        baccType:       draft.baccType || '',
        serie:          draft.serie || '',
        concoursType:   draft.concoursType || '',
        etablissement:  draft.etablissement || '',
        semestre:       draft.semestre || '',
        filiere:        draft.filiere || '',
        anneeScolaire:  draft.anneeScolaire || '',
        dateOfficielle: draft.dateOfficielle || '',
        duree:          draft.duree || '',
        coefficient:    draft.coefficient ? String(draft.coefficient) : '2',
        tags:           draft.tags || [],
        customMeta:     draft.customMeta || [],
        contentType:    draft.contentType || 'sujet_seul',
        prix:           draft.prix || 0,
        prixMode:       draft.prixMode || 'forfait',
        visibilite:     draft.visibilite || 'public',
        content:        draft.content || {},
      }}
    />
  )
}
