'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CreditCard, Zap, Gift, Phone } from 'lucide-react'
import { MOBILE_MONEY_PROVIDERS } from '@/data/mobile-money-providers'

interface CreditPack {
  id: string
  name: string
  credits: number
  price: number
  bonus: number
  icon: any
  popular: boolean
}

const creditPacks: CreditPack[] = [
  {
    id: 'petit',
    name: 'Pack Starter',
    credits: 50,
    price: 5000,
    bonus: 0,
    icon: Zap,
    popular: false,
  },
  {
    id: 'moyen',
    name: 'Pack Standard',
    credits: 150,
    price: 12000,
    bonus: 20,
    icon: Gift,
    popular: true,
  },
  {
    id: 'gros',
    name: 'Pack Premium',
    credits: 500,
    price: 35000,
    bonus: 100,
    icon: CreditCard,
    popular: false,
  },
]

export default function CreditsPageClient() {
  const router = useRouter()
  const [selectedPack, setSelectedPack] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [operator, setOperator] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!selectedPack) {
      setError('Veuillez sélectionner un pack de crédits')
      setLoading(false)
      return
    }

    if (!phone || !operator) {
      setError('Veuillez remplir tous les champs')
      setLoading(false)
      return
    }

    try {
      const pack = creditPacks.find(p => p.id === selectedPack)
      if (!pack) throw new Error('Pack invalide')

      const response = await fetch('/api/payment/mobile-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: selectedPack,
          phone,
          operator,
          amount: pack.price,
          credits: pack.credits + pack.bonus,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erreur lors du paiement')
      router.push(`/credits/confirmation?transactionId=${data.transactionId}`)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-5xl mx-auto px-content py-12">
        <div className="text-center mb-12">
          <h1 className="text-h1 font-bold text-text mb-4">
            Acheter des Crédits
          </h1>
          <p className="text-text-muted text-lg">
            Choisissez votre pack et payez avec Mobile Money
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {creditPacks.map((pack) => (
            <div
              key={pack.id}
              onClick={() => setSelectedPack(pack.id)}
              className={`relative cursor-pointer transition-all hover:scale-[1.02] ${
                selectedPack === pack.id ? 'scale-[1.02]' : ''
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-teal text-bg px-4 py-1 rounded-full text-sm font-medium">
                    Plus populaire
                  </span>
                </div>
              )}
              <div className={`card h-full ${selectedPack === pack.id ? 'border-teal' : ''}`}>
                <div className="flex items-center justify-center mb-4">
                  <pack.icon className="w-12 h-12 text-teal" />
                </div>
                <h3 className="text-h3 font-bold text-text text-center mb-4">
                  {pack.name}
                </h3>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-teal">
                    {pack.credits + pack.bonus}
                  </div>
                  <div className="text-text-muted">crédits</div>
                  {pack.bonus > 0 && (
                    <div className="text-sm text-green mt-1">+{pack.bonus} crédits offerts</div>
                  )}
                </div>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-text">
                    {pack.price.toLocaleString('fr-MG')} Ar
                  </div>
                </div>
                <div className={`w-full py-3 text-center font-semibold rounded-lg transition-colors ${
                  selectedPack === pack.id
                    ? 'bg-teal text-bg'
                    : 'bg-bg3 text-text-muted'
                }`}>
                  {selectedPack === pack.id ? 'Sélectionné' : 'Choisir'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card max-w-xl mx-auto">
          <h2 className="text-h3 font-bold text-text text-center mb-6">
            Moyens de paiement
          </h2>

          <div className="grid md:grid-cols-3 gap-3 mb-6">
            {MOBILE_MONEY_PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                onClick={() => setOperator(provider.id)}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                  operator === provider.id
                    ? 'border-teal bg-bg3'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/15 bg-white/5 overflow-hidden">
                  <Image
                    src={provider.logoPath}
                    alt={provider.alt}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-sm text-text">{provider.name}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm bg-rose/10 text-rose border border-rose/20 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Numéro Mobile Money
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+261 34 XX XXX XX"
                  className="w-full pl-10 pr-4 py-3 bg-bg3 border border-white/10 rounded-lg text-text placeholder-text-muted2 focus:outline-none focus:border-teal/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 btn-primary rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Traitement...' : 'Payer maintenant'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-bg3 rounded-lg">
            <p className="text-sm text-text-muted text-center">
              💡 Paiement sécurisé via Mobile Money<br />
              MVola, Orange Money ou Airtel Money
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
