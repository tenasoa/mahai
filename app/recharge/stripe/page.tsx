'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PACKS = [
  { id: 'starter', name: 'Starter', credits: 100, amount: 500, price: '5.00€' },
  { id: 'standard', name: 'Standard', credits: 500, amount: 2000, price: '20.00€' },
  { id: 'premium', name: 'Premium', credits: 1500, amount: 5000, price: '50.00€' },
]

export default function StripeRechargePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedPack, setSelectedPack] = useState<string | null>(null)

  async function handlePayment(packId: string) {
    setLoading(true)
    setSelectedPack(packId)

    const pack = PACKS.find(p => p.id === packId)
    if (!pack) return

    try {
      const res = await fetch('/api/payment/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: pack.id,
          credits: pack.credits,
          amount: pack.amount, // en centimes
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur création session')
      }

      // Rediriger vers Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur')
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Recharger avec Stripe</h1>
      <p className="text-gray-600 mb-8">Paiement sécurisé par carte bancaire</p>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-yellow-800 mb-2">🧪 Mode Test</h3>
        <p className="text-sm text-yellow-700">
          Utilisez une carte de test Stripe. Aucun vrai argent ne sera débité.
        </p>
        <code className="block mt-2 bg-yellow-100 px-2 py-1 rounded text-sm">
          Carte: 4242 4242 4242 4242 | Date: 12/30 | CVC: 123
        </code>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PACKS.map((pack) => (
          <div
            key={pack.id}
            className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
              selectedPack === pack.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handlePayment(pack.id)}
          >
            <h3 className="text-xl font-bold mb-2">{pack.name}</h3>
            <p className="text-3xl font-bold text-blue-600 mb-4">{pack.price}</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {pack.credits} crédits
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Paiement sécurisé
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Crédits instantanés
              </li>
            </ul>
            <button
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && selectedPack === pack.id
                ? 'Chargement...'
                : 'Payer avec Stripe'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a href="/recharge" className="text-blue-600 hover:underline">
          ← Retour aux autres méthodes de paiement
        </a>
      </div>
    </div>
  )
}
