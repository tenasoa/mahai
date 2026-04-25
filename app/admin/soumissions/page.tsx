import { Suspense } from 'react'
import { getPendingSubmissions, getSubmissionsStats } from '@/actions/admin/submissions'
import { SubmissionsList } from './SubmissionsList'
import { SubmissionsHeader } from './SubmissionsHeader'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'

async function checkAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null
  
  const result = await query('SELECT id, role FROM "User" WHERE id = $1', [session.user.id])
  const user = result.rows[0]
  
  return user?.role === 'ADMIN' ? user : null
}

export default async function AdminSubmissionsPage() {
  const adminUser = await checkAdmin()
  
  if (!adminUser) {
    redirect('/login')
  }

  const [submissions, stats] = await Promise.all([
    getPendingSubmissions(),
    getSubmissionsStats()
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      <SubmissionsHeader stats={stats} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<SubmissionsLoading />}>
          <SubmissionsList submissions={submissions} />
        </Suspense>
      </main>
    </div>
  )
}

function SubmissionsLoading() {
  return (
    <div className="grid gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  )
}
