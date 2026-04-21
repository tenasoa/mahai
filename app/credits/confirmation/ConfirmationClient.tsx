'use client'

import { use, useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, ArrowRight, XCircle, Hash, Send } from 'lucide-react'
import { PaymentConfirmationSkeleton } from '@/components/ui/PageSkeletons'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [transaction, setTransaction] = useState<any>(null)
  const [transactionCode, setTransactionCode] = useState('')
  const [submittingCode, setSubmittingCode] = useState(false)
  const [codeError, setCodeError] = useState('')
  const transactionId = searchParams.get('transactionId')

  useEffect(() => {
    async function fetchTransaction() {
      if (!transactionId) return

      try {
        const response = await fetch(`/api/payment/transaction/${transactionId}`)
        const data = await response.json()
        setTransaction(data)
      } catch (error) {
        console.error('Erreur lors de la récupération de la transaction :', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransaction()
  }, [transactionId])

  if (loading) {
    return <PaymentConfirmationSkeleton />
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl border border-gold-line/30 p-6 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>
        
        {transaction?.status === 'COMPLETED' ? (
          <>
            <div className="flex justify-center mb-5 relative">
              <div className="w-20 h-20 rounded-full bg-gold-dim border border-gold-line flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-gold" />
              </div>
              <div className="absolute inset-0 bg-gold blur-2xl opacity-20 -z-10"></div>
            </div>

            <h1 className="text-3xl font-display font-medium text-text mb-4">
              Paiement <em className="text-gold not-italic font-serif">Réussi</em> !
            </h1>

            <p className="text-text-3 mb-6 text-sm leading-relaxed">
              Félicitations ! Vos crédits ont été ajoutés à votre compte Mah.AI.
            </p>

            <div className="bg-surface rounded-2xl p-5 mb-6 border border-gold-line/10">
              <p className="text-[0.65rem] font-mono text-text-3 uppercase tracking-widest mb-3">Référence de transaction</p>
              <p className="font-mono text-[0.7rem] text-gold mb-4 border border-gold-line/10 py-2 px-4 rounded-lg bg-void overflow-hidden text-ellipsis">
                {transaction?.id}
              </p>
              <div className="text-4xl font-display font-bold text-text mb-1 tracking-tight">
                +{transaction?.amount}
              </div>
              <p className="text-xs font-mono text-text-3 uppercase tracking-widest">Crédits ajoutés</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/catalogue')}
                className="w-full py-3 px-6 border border-gold bg-gradient-to-r from-gold to-gold-hi text-void font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
              >
                Parcourir le catalogue
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 px-6 border border-gold-line/30 bg-gold-dim/30 text-text font-semibold rounded-xl hover:bg-gold-dim/60 transition-all"
              >
                Retour au tableau de bord
              </button>
            </div>
          </>
        ) : transaction?.status === 'PENDING' ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-gold-line/20 border-t-gold animate-spin"></div>
            </div>

            <h1 className="text-2xl font-display font-medium text-text mb-3">
              Paiement en <em className="text-gold not-italic font-serif">attente</em>
            </h1>

            <p className="text-text-3 mb-5 text-sm">
              Effectuez le paiement via USSD sur votre téléphone, puis entrez le code de transaction ci-dessous.
            </p>

            <div className="bg-gold-dim/40 border border-gold-line/30 rounded-xl p-4 mb-5">
              <p className="text-xs text-gold leading-relaxed">
                1.Composez le code USSD de votre opérateur sur votre téléphone<br/>
                2.Effectuez le transfert vers le numéro Mah.AI<br/>
                3.Relevez le code de confirmation reçu par SMS<br/>
                4.Collez-le dans le champ ci-dessous
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-text-3 mb-2 text-left">
                Code de transaction USSD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Hash className="h-4 w-4 text-text-4" />
                </div>
                <input
                  type="text"
                  value={transactionCode}
                  onChange={(e) => {
                    setTransactionCode(e.target.value)
                    setCodeError('')
                  }}
                  placeholder="Ex: TX20240420123456"
                  className="w-full rounded-xl border border-border-1 bg-surface py-3 pl-10 pr-4 font-mono text-sm text-text outline-none transition focus:border-gold focus:ring-4 focus:ring-gold-dim"
                />
              </div>
              {codeError && (
                <p className="mt-1.5 text-xs text-ruby text-left">{codeError}</p>
              )}
            </div>

            <button
              onClick={async () => {
                if (!transactionCode.trim()) {
                  setCodeError('Veuillez entrer le code de transaction')
                  return
                }
                setSubmittingCode(true)
                try {
                  const res = await fetch(`/api/payment/transaction/${transactionId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactionCode: transactionCode.trim() }),
                  })
                  if (res.ok) {
                    const data = await res.json()
                    setTransaction(data)
                  } else {
                    const err = await res.json()
                    setCodeError(err.error || 'Erreur lors de la soumission')
                  }
                } catch {
                  setCodeError('Erreur réseau')
                } finally {
                  setSubmittingCode(false)
                }
              }}
              disabled={submittingCode}
              className="w-full py-3 border border-gold bg-gradient-to-r from-gold to-gold-hi text-void font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {submittingCode ? 'Envoi...' : 'Valider le code'}
            </button>

            <button
              onClick={() => router.push('/credits')}
              className="w-full py-3 mt-3 border border-gold-line/30 bg-gold-dim/30 text-gold font-semibold rounded-xl hover:bg-gold-dim/60 transition-all"
            >
              Retour aux crédits
            </button>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-ruby-dim border border-ruby-line flex items-center justify-center">
                <XCircle className="w-10 h-10 text-ruby" />
              </div>
            </div>

            <h1 className="text-3xl font-display font-medium text-text mb-4">
              <em className="text-ruby not-italic font-serif">Échec</em> de paiement
            </h1>

            <p className="text-text-3 mb-6 text-sm">
              Une erreur est survenue lors du paiement.
            </p>

            <button
              onClick={() => router.push('/credits')}
              className="w-full py-3 border border-ruby bg-ruby text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all"
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
  return <PaymentConfirmationSkeleton />
}

export default function ConfirmationClient() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmationContent />
    </Suspense>
  )
}
