import { getSubmissionForReview } from '@/actions/admin/submissions'
import { ReviewForm } from './ReviewForm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const submission = await getSubmissionForReview(id)
  
  if (!submission) redirect('/admin/sujets?status=PENDING')
  
  return (
    <div className="admin-page-content">
      <div className="admin-header">
        <div>
          <Link href="/admin/sujets?status=PENDING" className="admin-back-link">
            <ArrowLeft size={16}/> Retour aux soumissions
          </Link>
          <h1 className="admin-title">Révision de la soumission</h1>
          <p className="admin-subtitle">Par {submission.authorPrenom} {submission.authorNom} • {submission.authorEmail}</p>
        </div>
      </div>
      <ReviewForm submission={submission} />
    </div>
  )
}
