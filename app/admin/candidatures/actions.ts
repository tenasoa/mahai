'use server'

import { revalidatePath } from 'next/cache'
import { query } from '@/lib/db'
import { notify } from '@/lib/notifications'
import { requireAdmin, isAuthFailure } from '@/lib/auth-guards'

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

  const admin = await requireAdmin()
  if (isAuthFailure(admin)) {
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
    [applicationId, decision, adminNotes || null, admin.userId],
  )

  if (decision === 'APPROVED') {
    await query('UPDATE "User" SET role = $2, "updatedAt" = NOW() WHERE id = $1', [
      application.userId,
      'CONTRIBUTEUR',
    ])

    await notify({
      userId: application.userId,
      type: 'APPLICATION_APPROVED',
      title: 'Candidature acceptée',
      body: 'Bienvenue parmi les contributeurs Mah.AI — votre espace contributeur est maintenant accessible.',
      link: '/contributeur',
      metadata: { applicationId },
    })
  } else {
    await notify({
      userId: application.userId,
      type: 'APPLICATION_REJECTED',
      title: 'Candidature non retenue',
      body: adminNotes
        ? `Votre candidature n'a pas été retenue — ${adminNotes}`
        : `Votre candidature n'a pas été retenue. Vous pourrez la soumettre à nouveau plus tard.`,
      link: '/devenir-contributeur',
      metadata: { applicationId, adminNotes: adminNotes || null },
    })
  }

  revalidatePath('/admin/candidatures')
  revalidatePath('/admin')
  revalidatePath('/devenir-contributeur')
}
