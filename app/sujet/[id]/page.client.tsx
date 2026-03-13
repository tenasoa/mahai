'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Calendar, FileText, Star, ShoppingCart, Download, ChevronLeft } from 'lucide-react'

interface Subject {
  id: string
  titre: string
  type: string
  matiere: string
  annee: string
  serie?: string | null
  description?: string | null
  pages: number
  credits: number
  hasCorrectionIa: boolean
  hasCorrectionProf: boolean
  author?: { prenom: string; nom?: string | null }
}

export default function SubjectDetailClient({ subject, userCredits, hasPurchased }: { subject: Subject; userCredits: number; hasPurchased: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [wishlist, setWishlist] = useState(false)

  const canAfford = userCredits >= subject.credits

  const handlePurchase = async () => {
    if (!canAfford) { router.push('/credits'); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/subjects/${subject.id}/purchase`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/sujet/${subject.id}/consult`)
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const icons: Record<string, string> = { 'Maths': '📐', 'Physique': '⚡', 'SVT': '🧬', 'Histoire': '📜', 'Français': '📚', 'Philosophie': '💭', 'Économie': '📊' }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-content py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-text-muted hover:text-text mb-6">
          <ChevronLeft className="w-5 h-5" /> Retour
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{icons[subject.matiere] || '📖'}</span>
                  <div>
                    <h1 className="text-h2 font-bold text-text">{subject.titre}</h1>
                    <p className="text-text-muted">{subject.matiere}</p>
                  </div>
                </div>
                <button onClick={() => setWishlist(!wishlist)} className={`p-2 rounded-full ${wishlist ? 'text-rose bg-rose/10' : 'text-text-muted hover:text-rose'}`}>
                  <Star className="w-6 h-6" fill={wishlist ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-teal/10 text-teal text-sm rounded-full">{subject.type}</span>
                <span className="px-3 py-1 bg-green/10 text-green text-sm rounded-full">{subject.annee}</span>
                {subject.serie && <span className="px-3 py-1 bg-purple/10 text-purple text-sm rounded-full">Série {subject.serie}</span>}
              </div>
              {subject.description && <p className="text-text-muted">{subject.description}</p>}
            </div>

            <div className="card">
              <h2 className="text-h3 font-bold text-text mb-4">Détails</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-text-muted" /><div><div className="text-sm text-text-muted">Pages</div><div className="font-semibold text-text">{subject.pages}</div></div></div>
                <div className="flex items-center gap-3"><BookOpen className="w-5 h-5 text-text-muted" /><div><div className="text-sm text-text-muted">Correction IA</div><div className={`font-semibold ${subject.hasCorrectionIa ? 'text-green' : 'text-text-muted2'}`}>{subject.hasCorrectionIa ? 'Disponible' : 'Non'}</div></div></div>
                <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-text-muted" /><div><div className="text-sm text-text-muted">Année</div><div className="font-semibold text-text">{subject.annee}</div></div></div>
                <div className="flex items-center gap-3"><Star className="w-5 h-5 text-text-muted" /><div><div className="text-sm text-text-muted">Correction Prof</div><div className={`font-semibold ${subject.hasCorrectionProf ? 'text-green' : 'text-text-muted2'}`}>{subject.hasCorrectionProf ? 'Disponible' : 'Non'}</div></div></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h2 className="text-h3 font-bold text-text mb-2">{subject.credits} crédits</h2>
              <p className="text-text-muted text-sm mb-6">Prix du sujet</p>
              {error && <div className="p-3 text-sm bg-rose/10 text-rose rounded-lg mb-4">{error}</div>}
              <div className="mb-4"><div className="text-sm text-text-muted mb-1">Votre solde</div><div className={`text-2xl font-bold ${canAfford ? 'text-green' : 'text-rose'}`}>{userCredits} crédits</div></div>
              {!canAfford && <div className="p-3 bg-rose/10 text-rose text-sm rounded-lg mb-4">Solde insuffisant. <a href="/credits" className="underline">Acheter des crédits</a></div>}
              <button onClick={handlePurchase} disabled={loading || hasPurchased}
                className={`w-full py-3 font-semibold rounded-lg transition-colors ${hasPurchased ? 'bg-green text-bg' : canAfford ? 'btn-primary' : 'bg-bg3 text-text-muted cursor-not-allowed'}`}>
                {hasPurchased ? '✓ Acheté' : loading ? '...' : 'Acheter'}
              </button>
              {hasPurchased && <button onClick={() => router.push(`/sujet/${subject.id}/consult`)} className="w-full mt-2 py-2 bg-green/10 text-green font-medium rounded-lg">Consulter</button>}
              <div className="mt-6 pt-4 border-t border-white/10">
                <h3 className="font-semibold text-text mb-3">Inclus</h3>
                <ul className="space-y-2 text-sm text-text-muted">
                  <li className="flex items-center gap-2">✓ Sujet complet PDF</li>
                  {subject.hasCorrectionIa && <li className="flex items-center gap-2">✓ Correction IA</li>}
                  {subject.hasCorrectionProf && <li className="flex items-center gap-2">✓ Correction Prof</li>}
                  <li className="flex items-center gap-2">✓ Accès illimité</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
