'use client'

import { use, useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [transaction, setTransaction] = useState<any>(null)
  const transactionId = searchParams.get('transactionId')

  useEffect(() => {
    async function fetchTransaction() {
      if (!transactionId) return

      try {
        const response = await fetch(`/api/payment/transaction/${transactionId}`)
        const data = await response.json()
        setTransaction(data)
      } catch (error) {
        console.error('Error fetching transaction:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransaction()
  }, [transactionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-teal animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-bg2 rounded-2xl border border-white/5 p-8 text-center">
        {transaction?.status === 'COMPLETED' ? (
          <>
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-20 h-20 text-green" />
            </div>

            <h1 className="text-3xl font-bold text-text mb-4">
              Paiement Réussi !
            </h1>

            <p className="text-text-muted mb-8">
              Vos crédits ont été ajoutés à votre compte.
            </p>

            <div className="bg-bg3 rounded-lg p-6 mb-8">
              <div className="text-sm text-text-muted mb-2">Transaction ID</div>
              <div className="font-mono text-sm text-text mb-4">
                {transaction?.id}
              </div>
              <div className="text-4xl font-bold text-teal">
                +{transaction?.amount} crédits
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => router.push('/catalogue')}
                className="w-full py-3 px-6 bg-teal text-bg font-semibold rounded-lg hover:bg-teal-secondary transition-colors flex items-center justify-center gap-2"
              >
                Parcourir le catalogue
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 px-6 bg-bg3 border border-white/10 text-text font-semibold rounded-lg hover:border-teal/30 transition-colors"
              >
                Voir mon solde
              </button>
            </div>
          </>
        ) : transaction?.status === 'PENDING' ? (
          <>
            <div className="flex justify-center mb-6">
              <Loader2 className="w-20 h-20 text-gold animate-spin" />
            </div>

            <h1 className="text-3xl font-bold text-text mb-4">
              Paiement en attente
            </h1>

            <p className="text-text-muted mb-8">
              Veuillez confirmer le paiement sur votre téléphone.
            </p>

            <div className="bg-gold/10 rounded-lg p-4 mb-8">
              <p className="text-sm text-gold">
                Vous devriez recevoir une notification USSD sur votre téléphone pour confirmer le paiement.
              </p>
            </div>

            <button
              onClick={() => router.push('/credits')}
              className="w-full py-3 px-6 bg-teal text-bg font-semibold rounded-lg hover:bg-teal-secondary transition-colors"
            >
              Retour aux crédits
            </button>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <svg className="w-20 h-20 text-rose" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-text mb-4">
              Paiement Échoué
            </h1>

            <p className="text-text-muted mb-8">
              Une erreur est survenue lors du paiement.
            </p>

            <button
              onClick={() => router.push('/credits')}
              className="w-full py-3 px-6 bg-teal text-bg font-semibold rounded-lg hover:bg-teal-secondary transition-colors"
            >
              Réessayer
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-teal animate-spin mx-auto mb-4" />
        <p className="text-text-muted">Chargement...</p>
      </div>
    </div>
  )
}

export default function ConfirmationClient() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmationContent />
    </Suspense>
  )
}
