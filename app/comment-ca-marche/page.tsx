'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Eye, Smartphone, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LegalPageSkeleton } from '@/components/ui/PageSkeletons'

export default function CommentCaMarchePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "Mah.AI — Comment ça marche"
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <LegalPageSkeleton />
  }

  const steps = [
    {
      num: '01',
      icon: <Search className="w-8 h-8" />,
      title: 'Cherchez',
      description: 'Filtrez par matière, niveau, année et difficulté. Plus de 2 138 sujets vous attendent.',
      details: [
        'BAC, BEPC, CEPE',
        '47 matières disponibles',
        'Archives 2003–2024'
      ]
    },
    {
      num: '02',
      icon: <Eye className="w-8 h-8" />,
      title: 'Prévisualisez',
      description: 'Consultez les premières pages gratuitement avant tout achat. Zéro surprise.',
      details: [
        'Aperçu gratuit',
        'Table des matières visible',
        'Découvrez avant d\'acheter'
      ]
    },
    {
      num: '03',
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Payez via Mobile Money',
      description: 'Rechargez votre wallet en crédits depuis votre téléphone via MVola, Orange Money ou Airtel Money.',
      details: [
        'MVola, Orange Money, Airtel Money',
        'Paiement sécurisé',
        'Crédits instantanés'
      ]
    },
    {
      num: '04',
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Correction IA',
      description: 'Soumettez vos réponses. Notre IA analyse, corrige et vous note en temps réel.',
      details: [
        'Correction par GPT-4o mini',
        'Feedback détaillé',
        'Note instantanée'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-void text-text">
      <LuxuryCursor />
      <LuxuryNavbar />

      {/* Hero */}
      <section className="relative py-24 px-6 border-b border-b1 bg-depth">
        <div className="max-w-7xl mx-auto">
          <div className="font-mono text-xs text-gold flex items-center gap-2 mb-4">
            <div className="w-5 h-px bg-gold"></div>
            Guide utilisateur
          </div>
          <h1 className="font-display font-normal text-5xl md:text-6xl text-text leading-tight mb-6">
            Comment ça <em className="text-gold">marche</em>
          </h1>
          <p className="text-text2 text-lg max-w-2xl leading-relaxed mb-8">
            Découvrez comment utiliser Mah.AI pour accéder aux sujets d'examens, les acheter avec Mobile Money, et obtenir des corrections IA instantanées.
          </p>
          <Link
            href="/catalogue?guest=true"
            className="inline-flex items-center gap-2 font-body text-sm font-medium px-6 py-3 rounded bg-gradient-to-r from-gold to-gold-hi text-void border-none transition-all hover:-translate-y-0.5 hover:shadow-gold-md tracking-[0.04em]"
          >
            Parcourir le catalogue
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-b1 border border-b1 rounded-lg overflow-hidden">
            {steps.map((step, index) => (
              <div
                key={step.num}
                className="bg-card p-8 hover:bg-card-hover transition-colors"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="font-display text-5xl font-light text-gold-lo leading-none">
                    {step.num}
                  </div>
                  <div className="w-12 h-12 bg-gold-dim border border-gold-line rounded flex items-center justify-center text-gold">
                    {step.icon}
                  </div>
                </div>
                <h3 className="font-display text-2xl text-text mb-3">
                  {step.title}
                </h3>
                <p className="text-text2 text-sm leading-relaxed mb-6">
                  {step.description}
                </p>
                <ul className="space-y-2">
                  {step.details.map((detail, i) => (
                    <li key={i} className="font-mono text-xs text-text3 flex items-center gap-2">
                      <span className="w-1 h-1 bg-gold rounded-full"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed explanation */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-8 text-center">
            En <em className="text-gold">détail</em>
          </h2>

          <div className="space-y-8">
            <div className="bg-card border border-b1 rounded-lg p-8">
              <h3 className="font-display text-xl text-text mb-4">1. Recherche de sujets</h3>
              <p className="text-text2 leading-relaxed mb-4">
                Utilisez notre catalogue pour trouver exactement le sujet dont vous avez besoin. Filtrez par :
              </p>
              <ul className="space-y-2 text-text2">
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1">✦</span>
                  <span><strong>Niveau d'examen :</strong> BAC, BEPC, CEPE</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1">✦</span>
                  <span><strong>Matière :</strong> Mathématiques, Physique, Français, etc.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1">✦</span>
                  <span><strong>Année :</strong> De 2003 à 2024</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1">✦</span>
                  <span><strong>Difficulté :</strong> Facile, Moyen, Difficile</span>
                </li>
              </ul>
            </div>

            <div className="bg-card border border-b1 rounded-lg p-8">
              <h3 className="font-display text-xl text-text mb-4">2. Achat de crédits</h3>
              <p className="text-text2 leading-relaxed mb-4">
                Mah.AI fonctionne avec un système de crédits. Pour acheter des sujets, vous devez d'abord recharger votre wallet :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-lift border border-b3 rounded p-4 text-center">
                  <div className="font-display text-2xl text-gold mb-1">50 cr</div>
                  <div className="font-mono text-xs text-text3">2 500 Ar</div>
                </div>
                <div className="bg-lift border border-b3 rounded p-4 text-center border-gold">
                  <div className="font-display text-2xl text-gold mb-1">150 cr</div>
                  <div className="font-mono text-xs text-text3">7 500 Ar</div>
                  <div className="font-mono text-[0.6rem] text-gold mt-1">+10 bonus</div>
                </div>
                <div className="bg-lift border border-b3 rounded p-4 text-center">
                  <div className="font-display text-2xl text-gold mb-1">300 cr</div>
                  <div className="font-mono text-xs text-text3">15 000 Ar</div>
                  <div className="font-mono text-[0.6rem] text-gold mt-1">+25 bonus</div>
                </div>
              </div>
              <p className="text-text2 text-sm leading-relaxed mt-4">
                Paiement accepté via MVola, Orange Money et Airtel Money. Validation sous 12h maximum.
              </p>
            </div>

            <div className="bg-card border border-b1 rounded-lg p-8">
              <h3 className="font-display text-xl text-text mb-4">3. Achat de sujets</h3>
              <p className="text-text2 leading-relaxed mb-4">
                Chaque sujet a un prix en crédits indiqué clairement. Après achat, vous pouvez :
              </p>
              <ul className="space-y-2 text-text2">
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1">✦</span>
                  <span>Télécharger le sujet complet en PDF</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1">✦</span>
                  <span>Accéder à la correction officielle (si disponible)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1">✦</span>
                  <span>Utiliser la correction IA pour vos réponses</span>
                </li>
              </ul>
            </div>

            <div className="bg-card border border-b1 rounded-lg p-8">
              <h3 className="font-display text-xl text-text mb-4">4. Correction IA</h3>
              <p className="text-text2 leading-relaxed mb-4">
                Notre IA analyse vos réponses et vous fournit :
              </p>
              <ul className="space-y-2 text-text2">
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1">✦</span>
                  <span><strong>Note sur 20 :</strong> Estimation précise de votre performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1">✦</span>
                  <span><strong>Feedback détaillé :</strong> Explications pour chaque erreur</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1">✦</span>
                  <span><strong>Suggestions :</strong> Pistes d'amélioration personnalisées</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1">✦</span>
                  <span><strong>Traduction :</strong> Disponible en malgache sur demande</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-4">
            Prêt à <em className="text-gold">commencer</em> ?
          </h2>
          <p className="text-text2 mb-8">
            Rejoignez des milliers d'élèves malgaches qui préparent leurs examens avec Mah.AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 font-body text-sm font-medium px-8 py-3 rounded bg-gradient-to-r from-gold to-gold-hi text-void border-none transition-all hover:-translate-y-0.5 hover:shadow-gold-md tracking-[0.04em]"
            >
              Créer un compte gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/catalogue?guest=true"
              className="inline-flex items-center justify-center gap-2 font-body text-sm font-medium px-8 py-3 rounded border border-b1 text-text hover:border-gold hover:text-gold transition-all tracking-[0.04em]"
            >
              Voir le catalogue
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
