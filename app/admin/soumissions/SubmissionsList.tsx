'use client'

import { useState } from 'react'
import { SubmissionDetailModal } from './SubmissionDetailModal'
import { Clock, User, BookOpen, ChevronRight } from 'lucide-react'

interface Submission {
  id: string
  title: string
  matiere: string
  examType: string
  anneeScolaire: string
  serie?: string
  duree?: string
  coefficient?: number
  prix: number
  prixMode: string
  visibilite: string
  authorPrenom: string
  authorNom: string
  authorEmail: string
  authorId: string
  createdAt: string
  updatedAt: string
}

interface SubmissionsListProps {
  submissions: Submission[]
}

export function SubmissionsList({ submissions }: SubmissionsListProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  if (submissions.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Aucune soumission en attente
        </h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Les sujets soumis par les contributeurs apparaîtront ici pour validation.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {submissions.map((submission) => (
          <SubmissionCard 
            key={submission.id} 
            submission={submission}
            onReview={() => setSelectedSubmission(submission)}
          />
        ))}
      </div>

      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </>
  )
}

interface SubmissionCardProps {
  submission: Submission
  onReview: () => void
}

function SubmissionCard({ submission, onReview }: SubmissionCardProps) {
  const submittedAt = new Date(submission.createdAt)
  const timeAgo = getTimeAgo(submittedAt)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              En attente
            </span>
            <span className="text-sm text-slate-500">
              {submission.matiere} • {submission.examType}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-slate-900 mb-2 truncate">
            {submission.title || 'Sans titre'}
          </h3>
          
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{submission.authorPrenom} {submission.authorNom}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
            {submission.serie && (
              <span className="text-slate-400">Série {submission.serie}</span>
            )}
            <span className="text-slate-400">Année {submission.anneeScolaire}</span>
          </div>
        </div>

        <button
          onClick={onReview}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Réviser
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  }
  if (hours > 0) {
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  }
  return "À l'instant"
}
