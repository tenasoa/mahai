'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, Mail, MapPin, Phone, ArrowLeft } from 'lucide-react'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryFooter } from '@/components/layout/LuxuryFooter'
import { LegalPageSkeleton } from '@/components/ui/PageSkeletons'

export default function MentionsLegalesPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "Mah.AI — Mentions légales"
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <LegalPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-void text-text">
      <LuxuryCursor />
      <LuxuryNavbar />

      {/* Hero */}
      <div className="border-b border-border-1 bg-depth relative z-10 pt-28 pb-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="font-mono text-xs text-gold flex items-center gap-2 mb-3">
            <div className="w-5 h-px bg-gold"></div>
            Informations légales
          </div>
          <h1 className="font-display font-normal text-5xl text-text leading-tight mb-2">
            Mentions <em className="text-gold">légales</em>
          </h1>
          <p className="font-mono text-xs text-text-3">
            Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 pb-24 relative z-10">
        {/* Éditeur */}
        <section className="mb-12">
          <h2 className="font-display font-normal text-2xl text-text tracking-[-0.02em] mb-6 flex items-center gap-3">
            <Building2 className="w-6 h-6 text-gold" />
            Éditeur de la plateforme
          </h2>
          <div className="bg-card border border-border-1 rounded-2xl p-8 shadow-sm">
            <div className="space-y-4">
              <div>
                <span className="font-mono text-xs text-text-3 uppercase tracking-[0.1em]">Raison sociale</span>
                <p className="text-text mt-1">Mah.AI SAS</p>
              </div>
              <div>
                <span className="font-mono text-xs text-text-3 uppercase tracking-[0.1em]">Forme juridique</span>
                <p className="text-text mt-1">Société par actions simplifiée (SAS)</p>
              </div>
              <div>
                <span className="font-mono text-xs text-text-3 uppercase tracking-[0.1em]">Capital social</span>
                <p className="text-text mt-1">1 000 000 Ar</p>
              </div>
              <div>
                <span className="font-mono text-xs text-text-3 uppercase tracking-[0.1em]">Siège social</span>
                <p className="text-text mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold" />
                  Antananarivo 101, Madagascar
                </p>
              </div>
              <div>
                <span className="font-mono text-xs text-text-3 uppercase tracking-[0.1em]">Numéro RCS</span>
                <p className="text-text mt-1">À déterminer</p>
              </div>
              <div>
                <span className="font-mono text-xs text-text-3 uppercase tracking-[0.1em]">Numéro TVA</span>
                <p className="text-text mt-1">À déterminer</p>
              </div>
            </div>
          </div>
        </section>

        {/* Directeur de la publication */}
        <section className="mb-12">
          <h2 className="font-display font-normal text-2xl text-text tracking-[-0.02em] mb-6">
            Directeur de la publication
          </h2>
          <div className="bg-card border border-border-1 rounded-2xl p-8 shadow-sm">
            <p className="text-text">Monsieur le représentant légal de Mah.AI SAS</p>
          </div>
        </section>

        {/* Hébergement */}
        <section className="mb-12">
          <h2 className="font-display font-normal text-2xl text-text tracking-[-0.02em] mb-6">
            Hébergement
          </h2>
          <div className="bg-card border border-border-1 rounded-2xl p-8 shadow-sm">
            <div className="space-y-4">
              <div>
                <span className="font-mono text-xs text-text-3 uppercase tracking-[0.1em]">Hébergeur</span>
                <p className="text-text mt-1">À déterminer</p>
              </div>
              <div>
                <span className="font-mono text-xs text-text-3 uppercase tracking-[0.1em]">Adresse</span>
                <p className="text-text mt-1">À déterminer</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="font-display font-normal text-2xl text-text tracking-[-0.02em] mb-6 flex items-center gap-3">
            <Mail className="w-6 h-6 text-gold" />
            Contact
          </h2>
          <div className="bg-card border border-border-1 rounded-2xl p-8 shadow-sm">
            <div className="space-y-4">
              <div>
                <span className="font-mono text-xs text-text-3 uppercase tracking-[0.1em]">Email général</span>
                <p className="text-text mt-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold" />
                  <a href="mailto:contact@mah.ai" className="text-gold hover:opacity-70 transition-opacity">
                    contact@mah.ai
                  </a>
                </p>
              </div>
              <div>
                <span className="font-mono text-xs text-text-3 uppercase tracking-[0.1em]">Email juridique</span>
                <p className="text-text mt-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold" />
                  <a href="mailto:legal@mah.ai" className="text-gold hover:opacity-70 transition-opacity">
                    legal@mah.ai
                  </a>
                </p>
              </div>
              <div>
                <span className="font-mono text-xs text-text-3 uppercase tracking-[0.1em]">Téléphone</span>
                <p className="text-text mt-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gold" />
                  À déterminer
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Propriété intellectuelle */}
        <section className="mb-12">
          <h2 className="font-display font-normal text-2xl text-text tracking-[-0.02em] mb-6">
            Propriété intellectuelle
          </h2>
          <div className="bg-card border border-border-1 rounded-2xl p-8 shadow-sm">
            <p className="text-text-2 leading-relaxed mb-4">
              L'ensemble du contenu de ce site (textes, images, vidéos, logos, designs, structure, etc.) est protégé par le droit d'auteur et les lois relatives à la propriété intellectuelle.
            </p>
            <p className="text-text-2 leading-relaxed mb-4">
              Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation préalable écrite de Mah.AI SAS.
            </p>
            <p className="text-text-2 leading-relaxed">
              Les sujets d'examens publiés sur la plateforme sont des documents officiels du Ministère de l'Éducation Nationale de Madagascar. Mah.AI agit en tant que plateforme de diffusion et ne revendique aucun droit de propriété sur le contenu des sujets eux-mêmes.
            </p>
          </div>
        </section>

        {/* Protection des données personnelles */}
        <section className="mb-12">
          <h2 className="font-display font-normal text-2xl text-text tracking-[-0.02em] mb-6">
            Protection des données personnelles
          </h2>
          <div className="bg-card border border-border-1 rounded-2xl p-8 shadow-sm">
            <p className="text-text-2 leading-relaxed mb-4">
              Les données personnelles collectées sur la plateforme font l'objet d'un traitement conforme à la réglementation malgache relative à la protection des données personnelles.
            </p>
            <p className="text-text-2 leading-relaxed">
              Pour plus d'informations sur la collecte, l'utilisation et la protection de vos données personnelles, veuillez consulter notre{' '}
              <Link href="/legal/confidentialite" className="text-gold hover:opacity-70 transition-opacity">
                Politique de confidentialité
              </Link>.
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-12">
          <h2 className="font-display font-normal text-2xl text-text tracking-[-0.02em] mb-6">
            Cookies
          </h2>
          <div className="bg-card border border-border-1 rounded-2xl p-8 shadow-sm">
            <p className="text-text-2 leading-relaxed mb-4">
              La plateforme utilise des cookies pour améliorer l'expérience utilisateur, analyser le trafic et personnaliser le contenu.
            </p>
            <p className="text-text-2 leading-relaxed">
              L'utilisateur peut configurer son navigateur pour refuser les cookies. Cependant, certaines fonctionnalités de la plateforme pourraient ne pas être accessibles.
            </p>
          </div>
        </section>

        {/* Footer info */}
        <div className="mt-12 p-8 bg-card border border-border-1 rounded-2xl text-center shadow-sm">
          <div className="font-mono text-[0.58rem] text-text-3 uppercase tracking-[0.14em] mb-3">Dernière mise à jour</div>
          <div className="font-display text-lg text-text-2">21 avril 2026</div>
          <div className="font-mono text-[0.62rem] text-text-4 mt-2">Mah.AI SAS · Antananarivo, Madagascar</div>
        </div>
      </div>
      
      <LuxuryFooter />
    </div>
  )
}
