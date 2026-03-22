import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import { ContributorLayout } from './ContributorLayout'
import './contributeur.css'

export const metadata = {
  title: 'Contributeur — Mah.AI',
}

export default async function ContributorRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Vérifier le rôle contributeur
  const userResult = await query(
    'SELECT role, prenom, nom, "profilePicture" FROM "User" WHERE id = $1 LIMIT 1', 
    [session.user.id]
  )
  const user = userResult.rows[0]

  if (!user || !['CONTRIBUTEUR', 'PROFESSEUR', 'ADMIN', 'VALIDATEUR', 'VERIFICATEUR'].includes(user.role)) {
    redirect('/dashboard')
  }

  // Get stats for sidebar
  const earningsRes = await query(
    `SELECT COALESCE(SUM(s.credits), 0) as total 
     FROM "Purchase" p 
     JOIN "Subject" s ON p."subjectId" = s.id 
     WHERE s."authorId" = $1`,
    [session.user.id]
  )
  
  const monthEarningsRes = await query(
    `SELECT COALESCE(SUM(s.credits), 0) as total 
     FROM "Purchase" p 
     JOIN "Subject" s ON p."subjectId" = s.id 
     WHERE s."authorId" = $1 
     AND p."createdAt" >= date_trunc('month', CURRENT_DATE)`,
    [session.user.id]
  )

  const subjectsCountRes = await query(
    'SELECT COUNT(*) as count FROM "Subject" WHERE "authorId" = $1',
    [session.user.id]
  )

  const stats = {
    earnings: parseInt(earningsRes.rows[0]?.total || 0),
    monthEarnings: parseInt(monthEarningsRes.rows[0]?.total || 0),
    totalSubjects: parseInt(subjectsCountRes.rows[0]?.count || 0)
  }

  return (
    <ContributorLayout user={user} stats={stats}>
      {children}
    </ContributorLayout>
  )
}