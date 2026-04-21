'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shield, Database, UserCheck, Cookie, Trash2, Mail, ArrowLeft } from 'lucide-react'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryFooter } from '@/components/layout/LuxuryFooter'
import { LegalPageSkeleton } from '@/components/ui/PageSkeletons'

export default function PolitiqueConfidentialitePage() {
  const [loading, setLoading] = useState(true)
  const lastUpdated = '01 janvier 2026'

  useEffect(() => {
    document.title = "Mah.AI — Politique de confidentialité"
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
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs text-text-3 hover:text-text-2 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-3 h-3 transform group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gold/10 border border-gold-line rounded-2xl flex items-center justify-center text-gold">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-normal text-4xl md:text-5xl text-text leading-tight">
                Politique de <em className="text-gold">confidentialité</em>
              </h1>
              <p className="font-mono text-xs text-text-4 uppercase tracking-[0.12em] mt-2">
                Dernière mise à jour · {lastUpdated}
              </p>
            </div>
          </div>
          <p className="text-text-2 text-lg max-w-3xl leading-relaxed mt-6">
            Mah.AI (« nous ») s'engage à protéger la vie privée de ses utilisateurs. Cette politique explique quelles données nous collectons, comment nous les utilisons et vos droits pour les contrôler.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 pb-24 relative z-10">
        
        {/* Section 1 */}
        <section className="mb-12 pb-12 border-b border-border-2">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-gold" />
            <h2 className="font-display font-normal text-3xl text-text">
              1. Données que nous collectons
            </h2>
          </div>
          <ul className="space-y-3 text-text-2 leading-relaxed ml-8 list-disc marker:text-gold">
            <li><strong>Informations de compte</strong> : prénom, nom, email, mot de passe (chiffré).</li>
            <li><strong>Profil académique</strong> : niveau scolaire, établissement, matières préférées, objectifs.</li>
            <li><strong>Numéro(s) Mobile Money</strong> (MVola / Orange Money / Airtel Money) pour effectuer les recharges.</li>
            <li><strong>Historique d'activité</strong> : sujets consultés, achats, favoris, sessions d'examen.</li>
            <li><strong>Données techniques</strong> : adresse IP, type d'appareil, logs d'authentification.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="mb-12 pb-12 border-b border-border-2">
          <div className="flex items-center gap-3 mb-6">
            <UserCheck className="w-5 h-5 text-gold" />
            <h2 className="font-display font-normal text-3xl text-text">
              2. Utilisation de vos données
            </h2>
          </div>
          <ul className="space-y-3 text-text-2 leading-relaxed ml-8 list-disc marker:text-gold">
            <li>Fournir et améliorer le service (catalogue personnalisé, recommandations).</li>
            <li>Gérer votre compte, votre portefeuille de crédits et vos transactions Mobile Money.</li>
            <li>Assurer la sécurité (détection de fraude, authentification).</li>
            <li>Vous envoyer des communications essentielles (confirmation d'email, reset de mot de passe, factures).</li>
            <li>Envoyer des newsletters <em>uniquement</em> si vous avez activé l'opt-in lors de l'inscription.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="mb-12 pb-12 border-b border-border-2">
          <div className="flex items-center gap-3 mb-6">
            <Cookie className="w-5 h-5 text-gold" />
            <h2 className="font-display font-normal text-3xl text-text">
              3. Cookies et stockage local
            </h2>
          </div>
          <p className="text-text-2 leading-relaxed">
            Nous utilisons des cookies techniques pour maintenir votre session et enregistrer vos préférences (thème clair/sombre, état de la sidebar). Aucun cookie de tracking tiers n'est utilisé sans votre consentement explicite.
          </p>
        </section>

        {/* Section 4 */}
        <section className="mb-12 pb-12 border-b border-border-2">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-gold" />
            <h2 className="font-display font-normal text-3xl text-text">
              4. Sécurité et conservation
            </h2>
          </div>
          <p className="text-text-2 leading-relaxed">
            Les mots de passe sont stockés sous forme de hash bcrypt. Les échanges sont chiffrés en HTTPS/TLS. Les données de compte sont conservées tant que votre compte est actif, puis archivées 3 ans après suppression pour obligations légales (comptabilité, fiscalité), sauf demande explicite.
          </p>
        </section>

        {/* Section 5 */}
        <section className="mb-12 pb-12 border-b border-border-2">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="w-5 h-5 text-gold" />
            <h2 className="font-display font-normal text-3xl text-text">
              5. Vos droits (RGPD)
            </h2>
          </div>
          <ul className="space-y-3 text-text-2 leading-relaxed ml-8 list-disc marker:text-gold mb-6">
            <li><strong>Accès</strong> : consulter toutes les données que nous détenons sur vous.</li>
            <li><strong>Rectification</strong> : corriger une information erronée directement depuis votre profil.</li>
            <li><strong>Effacement</strong> : supprimer votre compte et les données associées (sauf obligations légales).</li>
            <li><strong>Portabilité</strong> : exporter vos données dans un format lisible (JSON/CSV).</li>
            <li><strong>Opposition</strong> : refuser les communications marketing à tout moment.</li>
          </ul>
          <p className="text-text-2 leading-relaxed">
            Pour exercer ces droits, contactez-nous : <strong className="text-gold">support@mah.ai</strong>
          </p>
        </section>

        {/* Section 6 */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-5 h-5 text-gold" />
            <h2 className="font-display font-normal text-3xl text-text">
              6. Contact
            </h2>
          </div>
          <p className="text-text-2 leading-relaxed mb-6">
            Pour toute question relative à cette politique ou à vos données :
          </p>
          <div className="p-6 bg-card border border-border-1 rounded-2xl">
            <div className="font-mono text-sm text-gold mb-2">Mah.AI — Antananarivo, Madagascar</div>
            <div className="font-mono text-sm">
              <span className="text-text-2">E-mail : </span> 
              <a href="mailto:support@mah.ai" className="text-gold hover:opacity-70 transition-opacity">support@mah.ai</a>
            </div>
          </div>
        </section>

        {/* Footer Info Box */}
        <div className="mt-16 p-8 bg-gold-dim border border-gold-line rounded-2xl text-center">
          <p className="text-sm text-text-2 m-0">
            Consultez aussi nos <Link href="/legal/cgu" className="text-gold hover:opacity-70 transition-opacity font-medium">Conditions Générales d'Utilisation</Link> pour connaître l'ensemble des règles d'usage du service.
          </p>
        </div>
      </div>

      <LuxuryFooter />
    </div>
  )
}
