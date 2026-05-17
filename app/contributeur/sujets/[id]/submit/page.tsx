import { redirect, notFound } from 'next/navigation'
import { query } from '@/lib/db'
import { requireAuth, isAuthFailure } from '@/lib/auth-guards'
import { getSubjectDraft } from '../../editor-actions'
import SubmitWizardClient from './SubmitWizardClient'

export const metadata = {
  title: 'Publier le sujet — Mah.AI',
}

interface Props {
  params: Promise<{ id: string }>
}

/**
 * Page wizard post-édition : 4 étapes (Aperçu → Validation → Tarification →
 * Confirmation) avant la soumission à la modération admin. Inspirée de
 * widgets/mah-ai-editor.html (Validation + Tarif & Publication).
 */
export default async function SubmitSubjectPage({ params }: Props) {
  const { id } = await params

  const auth = await requireAuth()
  if (isAuthFailure(auth)) redirect('/auth/login')

  const userRes = await query('SELECT role FROM "User" WHERE id = $1', [auth.userId])
  const user = userRes.rows[0]
  if (!user || !['CONTRIBUTEUR', 'ADMIN', 'PROFESSEUR'].includes(user.role)) {
    redirect('/dashboard')
  }

  const draft = await getSubjectDraft(id)
  if (!draft) notFound()

  // Si déjà soumis ou publié → on redirige vers la liste contributeur
  if (draft.status !== 'DRAFT' && draft.status !== 'REVISION_REQUESTED') {
    redirect('/contributeur/sujets')
  }

  return (
    <SubmitWizardClient
      draftId={id}
      draft={{
        title: draft.title || '',
        matiere: draft.matiere || '',
        examType: draft.examType || '',
        baccType: draft.baccType || '',
        bepcOption: draft.bepcOption || '',
        serie: draft.serie || '',
        concoursType: draft.concoursType || '',
        anneeScolaire: draft.anneeScolaire || '',
        duree: draft.duree || '',
        coefficient: draft.coefficient ? String(draft.coefficient) : '',
        contentType: draft.contentType || 'sujet_seul',
        tags: draft.tags || [],
        prix: draft.prix || 0,
        prixMode: draft.prixMode || 'forfait',
        visibilite: draft.visibilite || 'public',
        content: draft.content || {},
        status: draft.status || 'DRAFT',
      }}
    />
  )
}
