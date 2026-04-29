'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const txId = searchParams.get('tx')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    // Vérifier le statut de la session
    fetch(`/api/payment/stripe?session_id=${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'paid') {
          setStatus('success')
          setDetails(data)
        } else {
          setStatus('loading')
        }
      })
      .catch(() => setStatus('error'))
  }, [sessionId])

  if (status === 'loading') {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Vérification du paiement...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-2">Erreur</h1>
        <p className="text-gray-600">Impossible de vérifier le paiement.</p>
        <a href="/recharge/stripe" className="text-blue-600 hover:underline mt-4 block">
          Réessayer
        </a>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-20 text-center max-w-md">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-2">Paiement réussi !</h1>
      <p className="text-gray-600 mb-6">
        Vos crédits ont été ajoutés à votre compte.
      </p>
      
      {details && (
        <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
          <p className="text-sm text-gray-600">Montant: <span className="font-semibold">{(details.amount_total / 100).toFixed(2)} {details.currency?.toUpperCase()}</span></p>
          <p className="text-sm text-gray-600">Session: <code className="text-xs">{details.id}</code></p>
        </div>
      )}

      <div className="space-y-3">
        <a 
          href="/profil" 
          className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Voir mon profil
        </a>
        <a 
          href="/recharge/stripe" 
          className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
        >
          Recharger à nouveau
        </a>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-20 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
