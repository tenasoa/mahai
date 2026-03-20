import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import './admin.css'

export const metadata = {
  title: 'Admin — Mah.AI',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Vérifier le rôle ADMIN avec query native pour contourner RLS
  const result = await query('SELECT role, prenom, nom, "profilePicture" FROM "User" WHERE id = $1 LIMIT 1', [session.user.id])
  const user = result.rows[0]

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const initials = `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`.toUpperCase() || 'A'

  return (
    <div className="admin-body">
      <div className="admin-noise" />
      <div className="admin-layout">
        <AdminSidebar user={user} initials={initials} />

        <div className="admin-main">
          {children}
        </div>
      </div>
    </div>
  )
}
