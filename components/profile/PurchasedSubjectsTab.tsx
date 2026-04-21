'use client'

import { useRouter } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { type PurchasedSubjectItem } from '@/actions/profile'

interface PurchasedSubjectsTabProps {
  subjects: PurchasedSubjectItem[]
  loading: boolean
}

export function PurchasedSubjectsTab({
  subjects,
  loading,
}: PurchasedSubjectsTabProps) {
  const router = useRouter()

  return (
    <>
      <div className="section-header">
        <h3 className="section-title-with-icon">
          <BookOpen size={18} />
          Mes <em>Sujets</em>
        </h3>
      </div>

      {loading ? (
        <div className="subjects-grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="subject-card-skeleton">
              <div className="subject-line w-70"></div>
              <div className="subject-line w-45"></div>
              <div className="subject-line w-30"></div>
            </div>
          ))}
        </div>
      ) : subjects.length > 0 ? (
        <>
          <div className="subjects-summary">
            <span>
              <strong>{subjects.length}</strong> sujet
              {subjects.length > 1 ? "s" : ""} débloqué
              {subjects.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="subjects-grid">
            {subjects.map((subject) => (
              <article
                key={`${subject.id}-${subject.purchasedAt}`}
                className="subject-card"
              >
                <div className="subject-card-head">
                  <span className="subject-badge">{subject.type}</span>
                  <span className="subject-credits">
                    -{subject.creditsAmount} cr
                  </span>
                </div>
                <h4 className="subject-title">{subject.titre}</h4>
                <p className="subject-meta">
                  {subject.matiere} · {subject.annee}
                  {subject.serie ? ` · ${subject.serie}` : ""}
                </p>
                <p className="subject-date">
                  Débloqué le{" "}
                  {new Date(subject.purchasedAt).toLocaleDateString(
                    "fr-FR",
                    { day: "2-digit", month: "long", year: "numeric" },
                  )}
                </p>
                <button
                  className="btn-card-action mt-4"
                  onClick={() => router.push(`/sujet/${subject.id}`)}
                >
                  Ouvrir le sujet
                </button>
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="empty-section-title">
            Aucun sujet débloqué pour le moment.
          </p>
          <p className="empty-section-text">
            Quand vous achetez un sujet avec vos crédits, il apparaît
            automatiquement ici.
          </p>
          <button
            className="btn-card-action mt-4"
            onClick={() => router.push("/catalogue")}
          >
            Explorer le catalogue
          </button>
        </>
      )}
    </>
  )
}
