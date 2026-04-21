'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Target, Users, Globe, Award, ArrowRight, ArrowLeft } from 'lucide-react'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryFooter } from '@/components/layout/LuxuryFooter'
import { LegalPageSkeleton } from '@/components/ui/PageSkeletons'

export default function AProposPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "Mah.AI — À propos"
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <LegalPageSkeleton />
  }

  const stats = [
    { value: '2 138+', label: 'Sujets d\'examens' },
    { value: '47', label: 'Matières' },
    { value: '21 ans', label: 'D\'archives (2003-2024)' },
    { value: '10K+', label: 'Élèves inscrits' }
  ]

  const values = [
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Excellence académique',
      description: 'Nous nous engageons à fournir des contenus de la plus haute qualité, vérifiés et conformes aux programmes officiels malgaches.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Accessibilité pour tous',
      description: 'Grâce au système de crédits et au paiement Mobile Money, nos ressources sont accessibles à tous les élèves, quel que soit leur niveau économique.'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Innovation technologique',
      description: 'Nous utilisons les dernières technologies d\'IA, notamment Perplexity, pour offrir des corrections précises et un apprentissage personnalisé.'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Engagement local',
      description: '100% made in Madagascar, nous comprenons les réalités du système éducatif malgache et nous y adaptons nos solutions.'
    }
  ]

  const team = [
    {
      name: 'Fondation & Vision',
      description: 'Mah.AI a été fondé avec la mission de démocratiser l\'accès aux ressources éducatives de qualité à Madagascar. Notre vision est de devenir la référence numérique pour la préparation aux examens.'
    },
    {
      name: 'Équipe technique',
      description: 'Une équipe passionnée de développeurs, designers et ingénieurs en IA travaillent quotidiennement pour améliorer la plateforme et créer de nouvelles fonctionnalités.'
    },
    {
      name: 'Contributeurs',
      description: 'Notre communauté de contributeurs certifiés (professeurs, étudiants brillants) enrichit constamment notre catalogue avec de nouveaux sujets et corrections.'
    },
    {
      name: 'Partenaires',
      description: 'Nous collaborons avec le Ministère de l\'Éducation, des établissements scolaires et des opérateurs Mobile Money pour offrir une expérience complète.'
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
            Notre histoire
          </div>
          <h1 className="font-display font-normal text-5xl md:text-6xl text-text leading-tight mb-6">
            À propos de <em className="text-gold">Mah.AI</em>
          </h1>
          <p className="text-text2 text-lg max-w-3xl leading-relaxed mb-8">
            La plateforme éducative malgache qui révolutionne la préparation aux examens grâce à l'intelligence artificielle et à une communauté d'experts passionnés.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-6">
            Notre <em className="text-gold">mission</em>
          </h2>
          <p className="text-text2 text-lg leading-relaxed mb-8">
            Démocratiser l'accès aux ressources éducatives de qualité à Madagascar en utilisant la technologie pour rendre l'apprentissage plus accessible, plus efficace et plus engageant pour tous les élèves.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-display text-4xl text-gold mb-2">{stat.value}</div>
                <div className="font-mono text-xs text-text3 uppercase tracking-[0.1em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-12 text-center">
            Nos <em className="text-gold">valeurs</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-card border border-b1 rounded-lg p-8">
                <div className="w-12 h-12 bg-gold-dim border border-gold-line rounded flex items-center justify-center text-gold mb-6">
                  {value.icon}
                </div>
                <h3 className="font-display text-2xl text-text mb-3">
                  {value.title}
                </h3>
                <p className="text-text2 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-8 text-center">
            Notre <em className="text-gold">histoire</em>
          </h2>
          <div className="space-y-6 text-text2 leading-relaxed">
            <p>
              Mah.AI est né d'une observation simple : trop d'élèves malgaches échouent aux examens non pas par manque de travail, mais par manque d'accès aux ressources et aux corrections de qualité.
            </p>
            <p>
              En 2024, une équipe d'entrepreneurs passionnés par l'éducation a décidé de relever ce défi. L'idée était de créer une plateforme qui centraliserait tous les sujets d'examens officiels (BAC, BEPC, CEPE) des 21 dernières années, avec des corrections détaillées et accessibles à tous.
            </p>
            <p>
              Très vite, nous avons compris que la technologie pouvait faire plus que simplement stocker des documents. En intégrant l'intelligence artificielle, et plus particulièrement l'API Perplexity, nous avons pu offrir un service de correction automatique qui guide les élèves dans leur apprentissage.
            </p>
            <p>
              Aujourd'hui, Mah.AI est utilisé par des milliers d'élèves à travers Madagascar. Notre communauté de contributeurs continue d'enrichir la plateforme, et nous ne cessons d'innover pour offrir la meilleure expérience possible.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-12 text-center">
            Notre <em className="text-gold">équipe</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-card border border-b1 rounded-lg p-8">
                <h3 className="font-display text-xl text-text mb-3">{member.name}</h3>
                <p className="text-text2 leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-4">
            Rejoignez <em className="text-gold">l'aventure</em>
          </h2>
          <p className="text-text2 mb-8">
            Que vous soyez élève, parent, enseignant ou contributeur, il y a une place pour vous dans la communauté Mah.AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 font-body text-sm font-medium px-8 py-3 rounded bg-gradient-to-r from-gold to-gold-hi text-void border-none transition-all hover:-translate-y-0.5 hover:shadow-gold-md tracking-[0.04em]"
            >
              Créer un compte
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/devenir-contributeur"
              className="inline-flex items-center justify-center gap-2 font-body text-sm font-medium px-8 py-3 rounded border border-b1 text-text hover:border-gold hover:text-gold transition-all tracking-[0.04em]"
            >
              Devenir contributeur
            </Link>
          </div>
        </div>
      </section>

      <LuxuryFooter />
    </div>
  )
}
