import { redirect, notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
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

  const draft = await getSubjectDraft(id)

  if (!draft) notFound()

  if (draft.status !== 'DRAFT') {
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
