'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CreditCard, Gift, Phone, ShieldCheck, Sparkles, Zap, ChevronDown } from 'lucide-react'
import { MOBILE_MONEY_PROVIDERS, type MobileMoneyProviderId } from '@/data/mobile-money-providers'

function detectOperator(phone: string): MobileMoneyProviderId | '' {
  const p = phone.replace(/\s/g, '')
  const prefix3 = p.substring(0, 3)
  if (['034', '038'].includes(prefix3)) return 'mvola'
  if (['032', '037'].includes(prefix3)) return 'orange'
  if (prefix3 === '033') return 'airtel'
  return ''
}

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
  const [selectedPack, setSelectedPack] = useState<string>('moyen')
  const [phone, setPhone] = useState('')
  const [operator, setOperator] = useState<MobileMoneyProviderId | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userPhones, setUserPhones] = useState<{id: string, phone: string, provider: string, label?: string}[]>([])

  // Charger les numéros de l'utilisateur
  useEffect(() => {
    async function fetchUserPhones() {
      try {
        const response = await fetch('/api/user/phones')
        if (response.ok) {
          const data = await response.json()
          setUserPhones(data)
          if (data.length > 0) {
            const first = data[0]
            setPhone(first.phone)
            const detected = detectOperator(first.phone)
            setOperator(detected || first.provider)
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des numéros', err)
      }
    }
    fetchUserPhones()
  }, [])

  const selectedPackData = useMemo(
    () => creditPacks.find((pack) => pack.id === selectedPack) ?? null,
    [selectedPack],
  )

  const selectedOperator = useMemo(
    () => MOBILE_MONEY_PROVIDERS.find((provider) => provider.id === operator),
    [operator],
  )

  const totalCredits = selectedPackData
    ? selectedPackData.credits + selectedPackData.bonus
    : 0

  const formatAmount = (value: number) => `${value.toLocaleString('fr-MG')} Ar`

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
    <div className="min-h-screen bg-void">
      <div className="mx-auto max-w-[1180px] px-4 pb-14 pt-1 md:px-8">
        <div className="mb-4 text-center">
          <p className="mb-1 inline-flex items-center gap-2 rounded-full border border-gold-line bg-gold-dim px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-gold">
            <Sparkles className="h-3.5 w-3.5" />
            Recharge de crédits
          </p>
          <h1 className="mb-1 text-h1 font-semibold text-text">
            Acheter des Crédits
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-text-2">
            Sélectionnez un pack, choisissez votre numéro, puis confirmez le paiement.
          </p>
        </div>

        <div className="mb-3 grid gap-3 md:grid-cols-3">
          {creditPacks.map((pack) => (
            <article
              key={pack.id}
              onClick={() => setSelectedPack(pack.id)}
              className={`relative overflow-hidden rounded-2xl border bg-card p-3 transition-all cursor-pointer ${
                selectedPack === pack.id
                  ? 'border-gold shadow-[0_0_30px_rgba(168,120,42,0.15)] ring-1 ring-gold'
                  : 'border-border-1 hover:-translate-y-0.5 hover:border-gold-line'
              }`}
            >
              {pack.popular && (
                <div className="absolute right-3 top-3 z-10">
                  <span className="rounded-full border border-gold-line bg-gold-dim px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-gold">
                    Plus populaire
                  </span>
                </div>
              )}

              <div className="mb-2 flex items-center justify-between">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gold-line bg-gold-dim">
                  <pack.icon className="h-4 w-4 text-gold" />
                </div>
              </div>

              <h3 className="mb-1 text-h3 font-semibold text-text">{pack.name}</h3>
              <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-text-3">
                {pack.credits} crédits de base
              </p>

              <div className="mb-2">
                <div className="text-2xl font-semibold leading-none text-gold">{pack.credits + pack.bonus}</div>
                <p className="mt-1 text-sm text-text-2">crédits utilisables</p>
                {pack.bonus > 0 && (
                  <p className="mt-2 inline-flex items-center rounded-full bg-sage-dim px-2.5 py-1 text-xs font-medium text-sage">
                    +{pack.bonus} offerts
                  </p>
                )}
              </div>

              <p className="mb-2 text-lg font-semibold text-text">{formatAmount(pack.price)}</p>

              <button
                type="button"
                onClick={() => setSelectedPack(pack.id)}
                className={`group relative w-full overflow-hidden rounded-xl border py-2.5 transition-all duration-500 ${
                  selectedPack === pack.id
                    ? 'border-gold bg-gradient-to-r from-gold to-gold-hi text-void shadow-[0_10px_20px_rgba(168,120,42,0.3)]'
                    : 'border-gold-line bg-gold-dim text-text-2 hover:border-gold hover:bg-gold-dim/80 hover:text-gold'
                }`}
              >
                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {selectedPack === pack.id ? 'Pack Sélectionné' : 'Choisir ce pack'}
                  </span>
                  <span className={`font-display text-lg font-medium ${selectedPack === pack.id ? 'opacity-90' : 'text-gold'}`}>
                    {formatAmount(pack.price)}
                  </span>
                </div>
                {selectedPack === pack.id && (
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:200%_100%] animate-shimmer"></div>
                )}
              </button>
            </article>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 rounded-2xl border border-border-1 bg-card p-3 md:grid-cols-[1.35fr,1fr] md:p-4"
        >
          <section>
            <h2 className="mb-1 text-h3 font-semibold text-text">Moyen de paiement</h2>
            <p className="mb-2 text-sm text-text-2">Choisissez votre numéro — l'opérateur est détecté automatiquement.</p>

            <div className="space-y-2">
              <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-text-3">
                Numéro de téléphone
              </label>

              <div className="relative">
                <select
                  value={phone}
                  onChange={(e) => {
                    const selected = e.target.value
                    setPhone(selected)
                    const detected = detectOperator(selected)
                    if (detected) setOperator(detected)
                  }}
                  className="w-full appearance-none rounded-xl border border-border-1 bg-surface py-2.5 pl-10 pr-10 font-mono text-sm text-text outline-none transition focus:border-gold focus:ring-4 focus:ring-gold-dim"
                >
                  <option value="">— Choisir un numéro —</option>
                  {userPhones.map((up) => (
                    <option key={up.id || up.phone} value={up.phone}>
                      {up.phone}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Phone className="h-4 w-4 text-text-4" />
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-text-4" />
                </div>
              </div>

              {userPhones.length === 0 && (
                <p className="text-xs text-text-3 italic">Aucun numéro enregistré. Ajoutez-en depuis votre profil.</p>
              )}

              {operator && (
                <div className="flex items-center gap-2 rounded-xl border border-gold-line bg-gold-dim px-3 py-2">
                  {(() => {
                    const prov = MOBILE_MONEY_PROVIDERS.find(p => p.id === operator)
                    return prov ? (
                      <>
                        <div className="h-7 w-7 overflow-hidden rounded-full border border-gold-line bg-void">
                          <Image src={prov.logoPath} alt={prov.alt} width={28} height={28} className="h-full w-full object-cover" />
                        </div>
                        <span className="text-xs font-semibold tracking-wider text-gold uppercase">{prov.name}</span>
                        <span className="ml-auto text-[0.6rem] font-mono text-gold/60 uppercase">détecté auto</span>
                      </>
                    ) : null
                  })()}
                </div>
              )}
            </div>

            {error && (
              <div className="mt-3 rounded-xl border border-ruby-line bg-ruby-dim px-4 py-3 text-sm text-ruby">
                {error}
              </div>
            )}
          </section>

          <aside className="rounded-2xl border border-gold-line bg-gradient-to-b from-gold-dim to-transparent p-3 md:p-4 flex flex-col justify-between">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-text">Résumé de paiement</h3>
              <div className="space-y-2 rounded-xl border border-border-1 bg-card p-3">
                <div className="flex justify-between items-center">
                  <p className="text-[0.6rem] uppercase tracking-[0.15em] text-text-3">Pack sélectionné</p>
                  <p className="font-medium text-text text-sm">{selectedPackData?.name}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[0.6rem] uppercase tracking-[0.15em] text-text-3">Via l'opérateur</p>
                  <p className="font-medium text-text text-sm">{selectedOperator?.name || '—'}</p>
                </div>
                <div className="border-t border-border-1 pt-2">
                  <p className="text-[0.6rem] uppercase tracking-[0.15em] text-text-3 mb-1">Total crédits</p>
                  <p className="text-3xl font-semibold text-gold tracking-tight">{totalCredits} <span className="text-xs uppercase tracking-widest font-mono text-text-3">crédits</span></p>
                </div>
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.15em] text-text-3 mb-1">Montant à payer</p>
                  <p className="text-xl font-semibold text-text">{selectedPackData ? formatAmount(selectedPackData.price) : '—'}</p>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gold bg-gradient-to-r from-gold to-gold-hi px-5 py-3 text-base font-bold text-void shadow-[0_10px_30px_rgba(168,120,42,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShieldCheck className="h-5 w-5" />
                {loading ? 'Traitement...' : `Payer ${selectedPackData ? formatAmount(selectedPackData.price) : ''}`}
              </button>

              <p className="mt-2 text-center text-[0.65rem] text-text-3 uppercase tracking-widest">
                Sécurisé par protocole SSL/TLS
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  )
}
