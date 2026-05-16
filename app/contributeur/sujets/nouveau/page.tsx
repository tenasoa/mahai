import { redirect } from 'next/navigation'
import { query } from '@/lib/db'
import { requireAuth, isAuthFailure } from '@/lib/auth-guards'
import EditorClient from './EditorClient'

export const metadata = {
  title: 'Nouveau sujet — Mah.AI',
}

export default async function NouveauSujetPage() {
  const auth = await requireAuth()
  if (isAuthFailure(auth)) redirect('/auth/login')

  const userRes = await query('SELECT role FROM "User" WHERE id = $1', [auth.userId])
  const user = userRes.rows[0]

  if (!user || !['CONTRIBUTEUR', 'ADMIN', 'PROFESSEUR', 'VALIDATEUR', 'VERIFICATEUR'].includes(user.role)) {
    redirect('/dashboard')
  }

  return <EditorClient isNewSubject={true} />
}
