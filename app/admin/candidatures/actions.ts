'use server'

import { revalidatePath } from 'next/cache'
import { query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'

async function assertAdminUser(userId: string) {
  const adminResult = await query('SELECT role FROM "User" WHERE id = $1 LIMIT 1', [userId])
  const adminUser = adminResult.rows[0]
  return adminUser?.role === 'ADMIN'
}

async function contributorApplicationTableExists() {
  const result = await query(
    `SELECT 1
     FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'ContributorApplication'
     LIMIT 1`,
  )
  return result.rows.length > 0
}

export async function reviewContributorApplicationAction(formData: FormData) {
  const applicationId = String(formData.get('applicationId') || '')
  const decision = String(formData.get('decision') || '')
  const adminNotes = String(formData.get('adminNotes') || '')

  if (!applicationId || !['APPROVED', 'REJECTED'].includes(decision)) {
    return
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return
  }

  const isAdmin = await assertAdminUser(session.user.id)
  if (!isAdmin) {
    return
  }

  const hasApplicationTable = await contributorApplicationTableExists()
  if (!hasApplicationTable) {
    return
  }

  const applicationResult = await query(
    'SELECT id, "userId" FROM "ContributorApplication" WHERE id = $1 LIMIT 1',
    [applicationId],
  )
  const application = applicationResult.rows[0]

  if (!application) {
    return
  }

  await query(
    `
    UPDATE "ContributorApplication"
    SET
      status = $2,
      "adminNotes" = $3,
      "reviewedBy" = $4,
      "reviewedAt" = NOW(),
      "updatedAt" = NOW()
    WHERE id = $1
    `,
    [applicationId, decision, adminNotes || null, session.user.id],
  )

  if (decision === 'APPROVED') {
    await query('UPDATE "User" SET role = $2, "updatedAt" = NOW() WHERE id = $1', [
      application.userId,
      'CONTRIBUTEUR',
    ])
  }

  revalidatePath('/admin/candidatures')
  revalidatePath('/admin')
  revalidatePath('/devenir-contributeur')
}
