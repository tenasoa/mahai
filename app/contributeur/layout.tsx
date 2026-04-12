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

  // Récupérer le rôle et toutes les stats en une seule requête pour économiser les connexions
  const dataRes = await query(
    `SELECT 
      u.role, u.prenom, u.nom, u."profilePicture",
      (SELECT COALESCE(SUM(s.credits), 0) FROM "Purchase" p JOIN "Subject" s ON p."subjectId" = s.id WHERE s."authorId" = u.id) as "totalEarnings",
      (SELECT COALESCE(SUM(s.credits), 0) FROM "Purchase" p JOIN "Subject" s ON p."subjectId" = s.id WHERE s."authorId" = u.id AND p."createdAt" >= date_trunc('month', CURRENT_DATE)) as "monthEarnings",
      (SELECT COUNT(*) FROM "Subject" WHERE "authorId" = u.id) as "totalSubjects"
     FROM "User" u
     WHERE u.id = $1 LIMIT 1`,
    [session.user.id]
  )
  
  const userData = dataRes.rows[0]

  if (!userData || !['CONTRIBUTEUR', 'PROFESSEUR', 'ADMIN', 'VALIDATEUR', 'VERIFICATEUR'].includes(userData.role)) {
    redirect('/dashboard')
  }

  const user = {
    role: userData.role,
    prenom: userData.prenom,
    nom: userData.nom,
    profilePicture: userData.profilePicture
  }

  const stats = {
    earnings: parseInt(userData.totalEarnings || 0),
    monthEarnings: parseInt(userData.monthEarnings || 0),
    totalSubjects: parseInt(userData.totalSubjects || 0)
  }

  return (
    <ContributorLayout user={user} stats={stats}>
      {children}
    </ContributorLayout>
  )
}