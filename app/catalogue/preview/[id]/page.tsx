'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSubjectById } from '@/lib/supabase/subjects'
import { useAuth } from '@/lib/hooks/useAuth'
import { CataloguePageSkeleton } from '@/components/ui/PageSkeletons'
import '../../catalogue.css'

interface SubjectData {
  id: string
  titre: string
  type: string
  matiere: string
  annee: string
  credits: number
  pages?: number | null
  description?: string | null
  isUnlocked?: boolean
}

export default function CataloguePreviewPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const subjectId = params?.id
  const { userId, loading: authLoading } = useAuth()

  const [subject, setSubject] = useState<SubjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Mah.AI — Aperçu du sujet'
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!userId) {
      router.replace('/auth/login')
      return
    }
    if (!subjectId) return

    let cancelled = false
    ;(async () => {
      try {
        const data = await getSubjectById(subjectId)
        if (cancelled) return
        if (!data) {
          setError("Sujet introuvable")
        } else {
          setSubject(data as unknown as SubjectData)
        }
      } catch (e) {
        if (!cancelled) setError("Erreur de chargement")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [subjectId, userId, authLoading, router])

  if (loading || authLoading) return <CataloguePageSkeleton />

  if (error || !subject) {
    return (
      <div className="page-layout">
        <main className="main-area">
          <div className="main-content-wrapper">
            <Link href="/catalogue" className="preview-back-link">
              <ArrowLeft size={16} /> Retour au catalogue
            </Link>
            <div className="papers-empty" style={{ marginTop: '2rem' }}>
              <p>{error || "Sujet introuvable"}</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (subject.isUnlocked) {
    router.replace(`/sujet/${subject.id}`)
    return <CataloguePageSkeleton />
  }

  return (
    <div className="page-layout">
      <main className="main-area">
        <div className="main-content-wrapper">
          <Link href="/catalogue" className="preview-back-link">
            <ArrowLeft size={16} /> Retour au catalogue
          </Link>

          <h1 className="serif preview-page-title">{subject.titre}</h1>

          <div className="modal-preview modal-preview-rich preview-page-card">
            <div className="preview-sheet">
              <div className="preview-sheet-head">
                <span>{subject.type}</span>
                <span>{subject.annee}</span>
              </div>
              <div className="preview-sheet-title">{subject.matiere}</div>
              <div className="preview-sheet-lines">
                <p>
                  {subject.description ||
                    'Exercice 1 — Résoudre les questions suivantes en détaillant vos étapes.'}
                </p>
                <p>1. Identifier les données du problème et les hypothèses.</p>
                <p>2. Développer votre raisonnement dans un français clair.</p>
                <p className="preview-sheet-blurred">
                  3. Justifier votre méthode puis conclure avec le résultat attendu.
                </p>
                <p className="preview-sheet-blurred">
                  4. Barème et correction détaillée disponibles après achat.
                </p>
              </div>
              {(subject.pages ?? 1) <= 1 && (
                <div className="preview-single-page-note">
                  Sujet sur une seule page : la partie basse est volontairement floutée.
                </div>
              )}
            </div>
            <div className="preview-meta">
              <span>{subject.pages || 1} page(s)</span>
              <span>Accès total après achat</span>
            </div>
          </div>

          <button
            className="btn-buy"
            onClick={() => router.push(`/catalogue/buy/${subject.id}`)}
          >
            Acheter pour {subject.credits} crédits
          </button>
        </div>
      </main>

      <style jsx>{`
        .preview-back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-2);
          text-decoration: none;
          font-size: 0.88rem;
          font-family: var(--body);
          margin-bottom: 1.25rem;
          padding: 0.55rem 0.9rem;
          border: 1px solid var(--b1);
          border-radius: var(--r);
          background: var(--surface);
          transition: all 0.2s;
        }
        .preview-back-link:hover {
          border-color: var(--gold-line);
          color: var(--gold);
        }
        .preview-page-title {
          margin-bottom: 1.5rem;
        }
        .preview-page-card {
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  )
}
