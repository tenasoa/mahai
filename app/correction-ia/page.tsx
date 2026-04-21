'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, Zap, Brain, Target, Languages, Clock, Shield, CheckCircle, ArrowRight } from 'lucide-react'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryFooter } from '@/components/layout/LuxuryFooter'
import { LegalPageSkeleton } from '@/components/ui/PageSkeletons'

export default function CorrectionIAPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "Mah.AI — Correction IA par Perplexity"
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <LegalPageSkeleton />
  }

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Propulsé par Perplexity AI",
      description: "Notre moteur de correction utilise l'API Perplexity, reconnue pour sa précision et sa capacité de raisonnement avancée.",
      details: [
        "Accès en temps réel à des informations vérifiées",
        "Compréhension contextuelle approfondie",
        "Raisonnement logique et analytique"
      ]
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Précision pédagogique",
      description: "La correction est adaptée au contexte scolaire malgache, avec une compréhension des programmes officiels.",
      details: [
        "Alignement avec les programmes BAC/BEPC/CEPE",
        "Respect des barèmes officiels",
        "Feedback constructif et motivant"
      ]
    },
    {
      icon: <Languages className="w-6 h-6" />,
      title: "Bilingue Français-Malgache",
      description: "Les corrections et explications sont disponibles en français, avec possibilité de traduction en malgache.",
      details: [
        "Correction native en français",
        "Traduction automatique en malgache",
        "Adaptation culturelle locale"
      ]
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Rapidité extrême",
      description: "Obtenez votre correction en moins de 10 secondes, sans attente ni file d'attente.",
      details: [
        "Correction instantanée",
        "Disponible 24h/24 et 7j/7",
        "Aucune limite de volume"
      ]
    }
  ]

  const advantages = [
    {
      title: "Vs Correction manuelle",
      items: [
        { ours: "10 secondes", theirs: "Plusieurs jours", label: "Délai" },
        { ours: "Gratuit (crédits)", theirs: "Coûteux", label: "Coût" },
        { ours: "24h/24", theirs: "Horaires limités", label: "Disponibilité" },
        { ours: "Consistant", theirs: "Variable", label: "Qualité" }
      ]
    },
    {
      title: "Vs Autres IA (GPT, Claude)",
      items: [
        { ours: "Programmes MG", theirs: "Générique", label: "Contexte" },
        { ours: "Barèmes officiels", theirs: "Estimé", label: "Précision" },
        { ours: "Vérifié", theirs: "Hallucinations", label: "Fiabilité" },
        { ours: "Pédagogique", theirs: "Technique", label: "Approche" }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-void text-text">
      <LuxuryCursor />
      <LuxuryNavbar />

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-6 border-b border-border-1 bg-depth overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="font-mono text-xs text-gold flex items-center gap-2 mb-4">
            <div className="w-5 h-px bg-gold"></div>
            Technologie
          </div>
          <h1 className="font-display font-normal text-5xl md:text-6xl text-text leading-tight mb-6">
            Correction IA par <em className="text-gold">Perplexity</em>
          </h1>
          <p className="text-text-2 text-lg max-w-3xl leading-relaxed mb-8">
            Découvrez comment notre technologie de correction alimentée par Perplexity AI offre des précisions pédagogiques inégalées pour les examens malgaches.
          </p>
          <Link
            href="/catalogue?guest=true"
            className="inline-flex items-center gap-2 font-body text-sm font-medium px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-hi text-void border-none transition-all hover:-translate-y-0.5 hover:shadow-gold-md tracking-[0.04em]"
          >
            Essayer la correction IA
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Why Perplexity */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-4 text-center">
            Pourquoi <em className="text-gold">Perplexity</em> ?
          </h2>
          <p className="text-text-2 text-center max-w-2xl mx-auto mb-12">
            Perplexity AI se distingue des autres modèles de langage par sa capacité à accéder à des informations en temps réel et à raisonner de manière plus précise et fiable.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="rounded-2xl border border-border-1 bg-card p-8">
                <div className="w-12 h-12 bg-gold/10 border border-gold-line rounded-xl flex items-center justify-center text-gold mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-display text-2xl text-text mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-2 leading-relaxed mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="font-mono text-xs text-text-3 flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-gold" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-6 bg-depth">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-12 text-center">
            Comparaison <em className="text-gold">avantages</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {advantages.map((advantage, index) => (
              <div key={index} className="rounded-2xl border border-border-1 bg-card overflow-hidden">
                <div className="bg-lift border-b border-border-1 p-5">
                  <h3 className="font-display text-xl text-text">{advantage.title}</h3>
                </div>
                <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-1">
                        <th className="font-mono text-xs text-text-3 uppercase tracking-[0.1em] text-left py-3">Critère</th>
                        <th className="font-mono text-xs text-gold uppercase tracking-[0.1em] text-left py-3">Mah.AI</th>
                        <th className="font-mono text-xs text-text-3 uppercase tracking-[0.1em] text-left py-3">Autres</th>
                      </tr>
                    </thead>
                    <tbody>
                      {advantage.items.map((item, i) => (
                        <tr key={i} className="border-b border-border-1 last:border-b-0">
                          <td className="py-3 text-sm text-text-2">{item.label}</td>
                          <td className="py-3 text-sm text-gold font-medium">{item.ours}</td>
                          <td className="py-3 text-sm text-text-3">{item.theirs}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-12 text-center">
            Comment ça <em className="text-gold">fonctionne</em>
          </h2>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border-1 bg-card p-8 flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gold/10 border border-gold-line rounded-xl flex items-center justify-center text-gold font-display text-2xl">
                1
              </div>
              <div>
                <h3 className="font-display text-xl text-text mb-2">Soumission de vos réponses</h3>
                <p className="text-text-2 leading-relaxed">
                  Après avoir acheté un sujet, vous répondez aux questions directement dans l'interface. Vous pouvez saisir vos réponses texte ou scanner vos réponses manuscrites.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border-1 bg-card p-8 flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gold/10 border border-gold-line rounded-xl flex items-center justify-center text-gold font-display text-2xl">
                2
              </div>
              <div>
                <h3 className="font-display text-xl text-text mb-2">Analyse par Perplexity AI</h3>
                <p className="text-text-2 leading-relaxed">
                  Vos réponses sont envoyées à l'API Perplexity qui les analyse en tenant compte du barème officiel, du contexte pédagogique malgache et des exigences du programme scolaire.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border-1 bg-card p-8 flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gold/10 border border-gold-line rounded-xl flex items-center justify-center text-gold font-display text-2xl">
                3
              </div>
              <div>
                <h3 className="font-display text-xl text-text mb-2">Correction détaillée</h3>
                <p className="text-text-2 leading-relaxed">
                  Vous recevez une note sur 20, des commentaires détaillés par exercice, des suggestions d'amélioration et la possibilité de voir la correction officielle pour comparaison.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border-1 bg-card p-8 flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gold/10 border border-gold-line rounded-xl flex items-center justify-center text-gold font-display text-2xl">
                4
              </div>
              <div>
                <h3 className="font-display text-xl text-text mb-2">Traduction en malgache (optionnel)</h3>
                <p className="text-text-2 leading-relaxed">
                  Sur demande, l'ensemble de la correction peut être traduit en malgache pour une meilleure compréhension, facilitant l'apprentissage dans la langue maternelle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-depth">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-4">
            Prêt à <em className="text-gold">essayer</em> ?
          </h2>
          <p className="text-text-2 mb-8">
            Rejoignez des milliers d'élèves qui utilisent déjà la correction IA pour améliorer leurs résultats.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 font-body text-sm font-medium px-8 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-hi text-void border-none transition-all hover:-translate-y-0.5 hover:shadow-gold-md tracking-[0.04em]"
            >
              Créer un compte
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/catalogue?guest=true"
              className="inline-flex items-center justify-center gap-2 font-body text-sm font-medium px-8 py-3 rounded-xl border border-border-1 text-text hover:border-gold hover:text-gold transition-all tracking-[0.04em]"
            >
              Voir un exemple
            </Link>
          </div>
        </div>
      </section>
      
      <LuxuryFooter />
    </div>
  )
}
