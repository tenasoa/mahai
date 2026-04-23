'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSubjectById } from '@/lib/supabase/subjects'
import { purchaseCurrentUserSubject } from '@/actions/user'
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

export default function CatalogueBuyPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const subjectId = params?.id
  const { userId, appUser, loading: authLoading } = useAuth()

  const [subject, setSubject] = useState<SubjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)

  useEffect(() => {
    document.title = "Mah.AI — Confirmer l'achat"
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

  const confirmBuy = async () => {
    if (!subject || !userId) return
    setIsPurchasing(true)
    setPurchaseError(null)
    try {
      const result = await purchaseCurrentUserSubject(subject.id)
      if (result.success) {
        router.push(`/sujet/${subject.id}`)
      } else {
        setPurchaseError(result.error || "Impossible de finaliser l'achat")
        setIsPurchasing(false)
      }
    } catch {
      setPurchaseError("Une erreur inattendue est survenue")
      setIsPurchasing(false)
    }
  }

  if (loading || authLoading) return <CataloguePageSkeleton />

  if (error || !subject) {
    return (
      <div className="page-layout">
        <main className="main-area">
          <div className="main-content-wrapper">
            <Link href="/catalogue" className="buy-back-link">
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

  const currentCredits = appUser?.credits ?? 0
  const newBalance = currentCredits - subject.credits
  const insufficient = newBalance < 0

  return (
    <div className="page-layout">
      <main className="main-area">
        <div className="main-content-wrapper">
          <Link href={`/catalogue/preview/${subject.id}`} className="buy-back-link">
            <ArrowLeft size={16} /> Retour à l'aperçu
          </Link>

          <h1 className="serif buy-page-title">Confirmer l'achat</h1>

          <div className="modal-buy-info buy-page-card">
            <p className="modal-buy-heading">{subject.titre}</p>
            <div className="modal-buy-row">
              <span>Prix du sujet</span>
              <strong>{subject.credits} crédits</strong>
            </div>
            <div className="modal-buy-row">
              <span>Votre solde actuel</span>
              <strong>{currentCredits} crédits</strong>
            </div>
            <div className="modal-buy-row total">
              <span>Solde après achat</span>
              <strong>{newBalance} crédits</strong>
            </div>
          </div>

          <p className="modal-buy-footnote">
            Achat immédiat, accès permanent, correction IA incluse.
          </p>

          {insufficient && (
            <div className="buy-alert">
              Crédits insuffisants.{' '}
              <Link href="/recharge" className="buy-alert-link">
                Recharger votre compte
              </Link>
            </div>
          )}

          {purchaseError && (
            <div className="buy-alert buy-alert-error">{purchaseError}</div>
          )}

          <div className="modal-actions">
            <button
              className="btn-cancel"
              onClick={() => router.back()}
              disabled={isPurchasing}
            >
              Annuler
            </button>
            <button
              className="btn-confirm"
              onClick={confirmBuy}
              disabled={isPurchasing || insufficient}
            >
              {isPurchasing ? 'Traitement…' : 'Confirmer'}
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        .buy-back-link {
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
        .buy-back-link:hover {
          border-color: var(--gold-line);
          color: var(--gold);
        }
        .buy-page-title {
          margin-bottom: 1.5rem;
        }
        .buy-page-card {
          margin-bottom: 1rem;
        }
        .buy-alert {
          padding: 0.85rem 1rem;
          background: var(--amber-dim, rgba(251, 191, 36, 0.1));
          border: 1px solid var(--amber-line, rgba(251, 191, 36, 0.3));
          border-radius: var(--r);
          color: var(--amber, #F5B962);
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
        .buy-alert-error {
          background: var(--ruby-dim, rgba(239, 68, 68, 0.1));
          border-color: var(--ruby-line, rgba(239, 68, 68, 0.3));
          color: var(--ruby, #EF4444);
        }
        .buy-alert-link {
          color: inherit;
          text-decoration: underline;
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}
