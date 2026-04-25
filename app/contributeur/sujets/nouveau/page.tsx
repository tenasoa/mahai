import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import EditorClient from './EditorClient'

export const metadata = {
  title: 'Nouveau sujet — Mah.AI',
}

export default async function NouveauSujetPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  const userRes = await query('SELECT role FROM "User" WHERE id = $1', [session.user.id])
  const user = userRes.rows[0]

  if (!user || !['CONTRIBUTEUR', 'ADMIN', 'PROFESSEUR', 'VALIDATEUR', 'VERIFICATEUR'].includes(user.role)) {
    redirect('/dashboard')
  }

  return <EditorClient isNewSubject={true} />
}
