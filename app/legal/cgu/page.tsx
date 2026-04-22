'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Info, AlertTriangle, ArrowLeft } from 'lucide-react'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryFooter } from '@/components/layout/LuxuryFooter'
import { LegalPageSkeleton } from '@/components/ui/PageSkeletons'

export default function CGUPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('cgu')
  const [activeSection, setActiveSection] = useState('')
  const [loading, setLoading] = useState(true)

  // Simulate initial loading
  useEffect(() => {
    document.title = "Mah.AI — CGU & Confidentialité"
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Scroll spy for TOC
  useEffect(() => {
    const handleScroll = () => {
      const anchors = document.querySelectorAll('.section-anchor')
      let current = ''

      anchors.forEach(anchor => {
        if (window.scrollY >= (anchor as HTMLElement).offsetTop - 140) {
          current = anchor.id
        }
      })

      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const tabs = [
    { id: 'cgu', label: 'Conditions générales' },
    { id: 'privacy', label: 'Confidentialité' },
    { id: 'contrib', label: 'Règles contributeurs' },
    { id: 'payment', label: 'Conditions de paiement' }
  ]

  const tocItems = [
    { id: 'art1', label: '1. Objet', sub: false },
    { id: 'art2', label: '2. Définitions', sub: false },
    { id: 'art3', label: '3. Accès à la plateforme', sub: false },
    { id: 'art3a', label: '3.1 Inscription', sub: true },
    { id: 'art3b', label: '3.2 Crédits', sub: true },
    { id: 'art4', label: '4. Contenu & droits', sub: false },
    { id: 'art4a', label: '4.1 Responsabilité', sub: true },
    { id: 'art4b', label: '4.2 Commission', sub: true },
    { id: 'art5', label: '5. Correction IA', sub: false },
    { id: 'art6', label: '6. Paiement Mobile Money', sub: false },
    { id: 'art7', label: '7. Responsabilité', sub: false },
    { id: 'art8', label: '8. Résiliation', sub: false },
    { id: 'art9', label: '9. Droit applicable', sub: false }
  ]

  const creditPacks = [
    { pack: 'Starter', credits: '50 crédits', price: '2 500 Ar', validity: 'Sans expiration' },
    { pack: 'Standard', credits: '150 crédits', price: '7 500 Ar', validity: 'Sans expiration' },
    { pack: 'Premium', credits: '300 crédits', price: '15 000 Ar', validity: 'Sans expiration' }
  ]

  const commissionTiers = [
    { status: 'Standard', commission: '20%', revenue: '80%' },
    { status: 'Vérifié', commission: '15%', revenue: '85%' },
    { status: 'Elite', commission: '10%', revenue: '90%' }
  ]

  const handleAccept = () => {
    router.push('/auth/register')
  }

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
            Documents légaux
          </div>
          <h1 className="font-display font-normal text-5xl text-text leading-tight mb-2">
            CGU & Politique de<br /><em className="text-gold">confidentialité</em>
          </h1>
          <div className="flex flex-wrap gap-5 font-mono text-xs text-text-3">
            <span>Version 2.0 · En vigueur depuis le 1er janvier 2026</span>
            <span>·</span>
            <span>Mah.AI SAS · Antananarivo, Madagascar</span>
            <span>·</span>
            <span>Droit malgache applicable</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-1 bg-depth sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto px-6 flex gap-0 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-mono text-xs px-5 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-gold border-gold'
                  : 'text-text-3 border-transparent hover:text-text-2'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-6 py-12 pb-32 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12 relative z-10">
        {/* TOC */}
        <aside className="hidden lg:block sticky top-32 max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-hide">
          <div className="font-mono text-[0.57rem] text-text-4 uppercase tracking-[0.16em] mb-3">
            Sommaire
          </div>
          {tocItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`block font-mono text-[0.64rem] py-2 px-0 pl-3 border-l-2 transition-all cursor-pointer ${
                item.sub ? 'pl-5 text-[0.6rem]' : ''
              } ${
                activeSection === item.id
                  ? 'text-gold border-gold'
                  : 'text-text-3 border-border-1 hover:text-gold hover:border-gold'
              }`}
            >
              {item.label}
            </a>
          ))}
        </aside>

        {/* Content */}
        <div className="doc-content">
          {/* Article 1 */}
          <span className="section-anchor" id="art1"></span>
          <h2 className="font-display font-normal text-4xl text-text tracking-[-0.03em] mt-12 mb-4 pt-8 border-t border-border-2 first:mt-0 first:pt-0 first:border-t-0 leading-[1.1]">
            1. <em className="text-gold">Objet</em>
          </h2>
          <p className="text-text-2 leading-relaxed mb-4">
            Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de la plateforme <strong>Mah.AI</strong>, accessible à l'adresse mah.ai, éditée par la société Mah.AI SAS, dont le siège social est situé à Antananarivo, Madagascar.
          </p>
          <p className="text-text-2 leading-relaxed mb-4">
            En accédant à la plateforme ou en créant un compte, l'utilisateur accepte pleinement et sans réserve les présentes CGU. Si l'utilisateur n'accepte pas ces conditions, il doit s'abstenir d'utiliser la plateforme.
          </p>

          <div className="bg-card border border-gold-line rounded-2xl p-5 my-5 flex gap-3 items-start shadow-gold-sm">
            <Info className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
            <div className="text-[0.84rem] text-text-2 leading-relaxed">
              <strong className="text-gold">Résumé simple :</strong> Mah.AI est une plateforme éducative permettant aux étudiants d'accéder à des sujets d'examens malgaches et d'obtenir des corrections automatiques par intelligence artificielle. Les contributeurs peuvent publier des sujets et percevoir une rémunération.
            </div>
          </div>

          {/* Article 2 */}
          <span className="section-anchor" id="art2"></span>
          <h2 className="font-display font-normal text-4xl text-text tracking-[-0.03em] mt-12 mb-4 pt-8 border-t border-border-2 leading-[1.1]">
            2. <em className="text-gold">Définitions</em>
          </h2>
          <p className="text-text-2 leading-relaxed mb-4">
            Dans les présentes CGU, les termes suivants ont la signification qui leur est attribuée ci-dessous :
          </p>
          <ul className="pl-6 mb-4">
            <li className="text-text-2 leading-relaxed mb-1"><strong>Plateforme</strong> : le site web et l'application mobile Mah.AI ;</li>
            <li className="text-text-2 leading-relaxed mb-1"><strong>Utilisateur</strong> : toute personne physique accédant à la plateforme ;</li>
            <li className="text-text-2 leading-relaxed mb-1"><strong>Étudiant</strong> : utilisateur qui consulte et achète des sujets d'examen ;</li>
            <li className="text-text-2 leading-relaxed mb-1"><strong>Contributeur</strong> : utilisateur qui publie des sujets d'examen ;</li>
            <li className="text-text-2 leading-relaxed mb-1"><strong>Crédits</strong> : unité monétaire interne à la plateforme, acquise via paiement Mobile Money (MVola, Orange Money, Airtel Money) ;</li>
            <li className="text-text-2 leading-relaxed mb-1"><strong>Correction IA</strong> : service automatisé d'analyse et d'évaluation des réponses d'un étudiant ;</li>
            <li className="text-text-2 leading-relaxed mb-1"><strong>Sujet</strong> : fichier ou contenu numérique représentant un sujet d'examen.</li>
          </ul>

          {/* Article 3 */}
          <span className="section-anchor" id="art3"></span>
          <h2 className="font-display font-normal text-4xl text-text tracking-[-0.03em] mt-12 mb-4 pt-8 border-t border-border-2 leading-[1.1]">
            3. Accès à la <em className="text-gold">plateforme</em>
          </h2>

          <span className="section-anchor" id="art3a"></span>
          <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-gold mt-8 mb-3 flex items-center gap-2">
            <span className="text-[0.5rem]">✦</span>
            3.1 Inscription
          </h3>
          <p className="text-text-2 leading-relaxed mb-4">
            L'accès aux fonctionnalités complètes de la plateforme nécessite la création d'un compte. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants. Mah.AI se réserve le droit de suspendre tout compte dont les informations seraient inexactes ou frauduleuses.
          </p>
          <p className="text-text-2 leading-relaxed mb-4">
            L'inscription est réservée aux personnes physiques majeures (18 ans et plus) ou aux mineurs disposant de l'autorisation parentale. En s'inscrivant, l'utilisateur garantit disposer de la capacité légale à accepter les présentes CGU.
          </p>

          <span className="section-anchor" id="art3b"></span>
          <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-gold mt-8 mb-3 flex items-center gap-2">
            <span className="text-[0.5rem]">✦</span>
            3.2 Système de crédits
          </h3>
          <p className="text-text-2 leading-relaxed mb-4">
            La plateforme fonctionne sur la base d'un système de crédits internes. Les crédits sont acquis via les services de paiement mobile <strong>MVola</strong>, <strong>Orange Money</strong> et <strong>Airtel Money</strong>. Les crédits ne sont ni remboursables ni échangeables contre de l'argent réel, sauf mention contraire.
          </p>
          <div className="overflow-x-auto bg-card border border-border-1 rounded-2xl">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-lift font-mono text-[0.6rem] uppercase tracking-[0.1em] text-text-3 py-4 px-4 text-left border-b border-border-1">Pack</th>
                  <th className="bg-lift font-mono text-[0.6rem] uppercase tracking-[0.1em] text-text-3 py-4 px-4 text-left border-b border-border-1">Crédits</th>
                  <th className="bg-lift font-mono text-[0.6rem] uppercase tracking-[0.1em] text-text-3 py-4 px-4 text-left border-b border-border-1">Prix Mobile Money</th>
                  <th className="bg-lift font-mono text-[0.6rem] uppercase tracking-[0.1em] text-text-3 py-4 px-4 text-left border-b border-border-1">Validité</th>
                </tr>
              </thead>
              <tbody>
                {creditPacks.map((pack, index) => (
                  <tr key={index} className="hover:bg-lift transition-colors">
                    <td className="py-4 px-4 text-[0.84rem] text-text-2 border-b border-border-1">{pack.pack}</td>
                    <td className="py-4 px-4 text-[0.84rem] text-text-2 border-b border-border-1">{pack.credits}</td>
                    <td className="py-4 px-4 text-[0.84rem] text-text-2 border-b border-border-1">{pack.price}</td>
                    <td className="py-4 px-4 text-[0.84rem] text-text-2 border-b border-border-1">{pack.validity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Article 4 */}
          <span className="section-anchor" id="art4"></span>
          <h2 className="font-display font-normal text-4xl text-text tracking-[-0.03em] mt-12 mb-4 pt-8 border-t border-border-2 leading-[1.1]">
            4. Contenu & <em className="text-gold">droits</em>
          </h2>

          <span className="section-anchor" id="art4a"></span>
          <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-gold mt-8 mb-3 flex items-center gap-2">
            <span className="text-[0.5rem]">✦</span>
            4.1 Responsabilité des contributeurs
          </h3>
          <p className="text-text-2 leading-relaxed mb-4">
            Les contributeurs sont seuls responsables des contenus qu'ils publient. En publiant un sujet, le contributeur garantit :
          </p>
          <ul className="pl-6 mb-4">
            <li className="text-text-2 leading-relaxed mb-1">Être l'auteur ou disposer des droits nécessaires à la diffusion du contenu ;</li>
            <li className="text-text-2 leading-relaxed mb-1">Que le contenu est exact, fidèle au programme officiel et ne viole aucune règle de propriété intellectuelle ;</li>
            <li className="text-text-2 leading-relaxed mb-1">Que le contenu ne contient aucun élément illicite, discriminatoire ou diffamatoire.</li>
          </ul>
          <p className="text-text-2 leading-relaxed mb-4">
            Mah.AI se réserve le droit de modérer, suspendre ou supprimer tout contenu ne respectant pas ces conditions, sans préavis ni indemnisation.
          </p>

          <span className="section-anchor" id="art4b"></span>
          <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-gold mt-8 mb-3 flex items-center gap-2">
            <span className="text-[0.5rem]">✦</span>
            4.2 Commission Mah.AI
          </h3>
          <p className="text-text-2 leading-relaxed mb-4">
            Pour chaque sujet vendu, Mah.AI prélève une commission sur le montant en crédits reçu par le contributeur. Les modalités de commission sont les suivantes :
          </p>
          <div className="overflow-x-auto bg-card border border-border-1 rounded-2xl mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-lift font-mono text-[0.6rem] uppercase tracking-[0.1em] text-text-3 py-4 px-4 text-left border-b border-border-1">Statut contributeur</th>
                  <th className="bg-lift font-mono text-[0.6rem] uppercase tracking-[0.1em] text-text-3 py-4 px-4 text-left border-b border-border-1">Commission Mah.AI</th>
                  <th className="bg-lift font-mono text-[0.6rem] uppercase tracking-[0.1em] text-text-3 py-4 px-4 text-left border-b border-border-1">Revenu contributeur</th>
                </tr>
              </thead>
              <tbody>
                {commissionTiers.map((tier, index) => (
                  <tr key={index} className="hover:bg-lift transition-colors">
                    <td className="py-4 px-4 text-[0.84rem] text-text-2 border-b border-border-1">{tier.status}</td>
                    <td className="py-4 px-4 text-[0.84rem] text-text-2 border-b border-border-1">{tier.commission}</td>
                    <td className="py-4 px-4 text-[0.84rem] text-text-2 border-b border-border-1">{tier.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-text-2 leading-relaxed mb-4">
            Les gains sont versés mensuellement sur le compte Mobile Money du contributeur (MVola, Orange Money ou Airtel Money), dès que le solde accumulé atteint le minimum de <strong>5 000 Ar</strong>.
          </p>

          {/* Article 5 */}
          <span className="section-anchor" id="art5"></span>
          <h2 className="font-display font-normal text-4xl text-text tracking-[-0.03em] mt-12 mb-4 pt-8 border-t border-border-2 leading-[1.1]">
            5. Service de <em className="text-gold">Correction IA</em>
          </h2>
          <p className="text-text-2 leading-relaxed mb-4">
            Le service de correction automatique par intelligence artificielle (ci-après « Correction IA ») analyse les réponses soumises par les étudiants et génère un feedback automatisé. Ce service est fourni à titre indicatif uniquement.
          </p>

          <div className="bg-ruby/8 border border-ruby/25 rounded-2xl p-5 my-5 shadow-sm">
            <p className="text-[rgba(240,180,185,0.8)]">
              <strong className="text-white">Avertissement :</strong> La Correction IA ne constitue pas une évaluation pédagogique officielle. Les résultats sont générés automatiquement et peuvent comporter des imprécisions. Mah.AI ne saurait être tenu responsable de décisions prises sur la base des corrections générées par l'IA.
            </p>
          </div>

          <p className="text-text-2 leading-relaxed mb-4">
            L'utilisation du service de Correction IA est soumise à la consommation de crédits. Le coût par correction varie selon la complexité du sujet et est indiqué avant toute soumission.
          </p>

          {/* Article 6 */}
          <span className="section-anchor" id="art6"></span>
          <h2 className="font-display font-normal text-4xl text-text tracking-[-0.03em] mt-12 mb-4 pt-8 border-t border-border-2 leading-[1.1]">
            6. Paiement <em className="text-gold">Mobile Money</em>
          </h2>
          <p className="text-text-2 leading-relaxed mb-4">
            Les paiements sur la plateforme sont traités via Mobile Money : MVola, Orange Money et Airtel Money. En effectuant un paiement, l'utilisateur accepte également les conditions d'utilisation de l'opérateur choisi.
          </p>
          <p className="text-text-2 leading-relaxed mb-4">
            Mah.AI ne conserve aucune information bancaire ni de paiement. Les transactions sont traitées directement par les systèmes Mobile Money partenaires. Tout litige relatif à un paiement Mobile Money doit être signalé dans les <strong>48 heures</strong> suivant la transaction.
          </p>

          {/* Article 7 */}
          <span className="section-anchor" id="art7"></span>
          <h2 className="font-display font-normal text-4xl text-text tracking-[-0.03em] mt-12 mb-4 pt-8 border-t border-border-2 leading-[1.1]">
            7. <em className="text-gold">Responsabilité</em>
          </h2>
          <p className="text-text-2 leading-relaxed mb-4">
            La plateforme est fournie « en l'état ». Mah.AI s'engage à maintenir un niveau de service optimal mais ne garantit pas une disponibilité ininterrompue. En cas d'indisponibilité prolongée (supérieure à 24h), les crédits consommés durant la période concernée pourront faire l'objet d'un remboursement sur demande.
          </p>
          <p className="text-text-2 leading-relaxed mb-4">
            La responsabilité totale de Mah.AI envers un utilisateur ne pourra excéder le montant des crédits détenus par cet utilisateur au moment du litige.
          </p>

          {/* Article 8 */}
          <span className="section-anchor" id="art8"></span>
          <h2 className="font-display font-normal text-4xl text-text tracking-[-0.03em] mt-12 mb-4 pt-8 border-t border-border-2 leading-[1.1]">
            8. <em className="text-gold">Résiliation</em>
          </h2>
          <p className="text-text-2 leading-relaxed mb-4">
            L'utilisateur peut supprimer son compte à tout moment depuis les paramètres de son profil. La suppression entraîne la perte définitive des crédits non utilisés et de l'accès aux sujets achetés. Les contributions publiées peuvent être maintenues sur la plateforme à la discrétion de Mah.AI.
          </p>
          <p className="text-text-2 leading-relaxed mb-4">
            Mah.AI se réserve le droit de suspendre ou résilier tout compte en cas de violation des présentes CGU, sans préavis ni indemnisation.
          </p>

          {/* Article 9 */}
          <span className="section-anchor" id="art9"></span>
          <h2 className="font-display font-normal text-4xl text-text tracking-[-0.03em] mt-12 mb-4 pt-8 border-t border-border-2 leading-[1.1]">
            9. Droit <em className="text-gold">applicable</em>
          </h2>
          <p className="text-text-2 leading-relaxed mb-4">
            Les présentes CGU sont régies par le droit malgache. Tout litige relatif à leur interprétation ou exécution sera soumis aux tribunaux compétents d'Antananarivo, Madagascar.
          </p>
          <p className="text-text-2 leading-relaxed mb-4">
            Pour toute question relative aux présentes CGU, vous pouvez contacter notre équipe juridique à : <a href="mailto:legal@mah.ai" className="text-gold hover:opacity-70 transition-opacity">legal@mah.ai</a>
          </p>

          {/* Footer info */}
          <div className="mt-12 p-8 bg-card border border-border-1 rounded-2xl text-center">
            <div className="font-mono text-[0.58rem] text-text-3 uppercase tracking-[0.14em] mb-3">Dernière mise à jour</div>
            <div className="font-display text-lg text-text-2">1er janvier 2026 · Version 2.0</div>
            <div className="font-mono text-[0.62rem] text-text-4 mt-2">Mah.AI SAS · Antananarivo, Madagascar</div>
          </div>
        </div>
      </div>

      {/* Sticky Accept Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-void/96 border-t border-border-1 p-4 flex items-center justify-center gap-4 z-50 backdrop-blur-lg">
        <div className="font-mono text-xs text-text-4 max-w-lg text-center">
          En vous inscrivant sur Mah.AI, vous acceptez les présentes CGU et notre politique de confidentialité.
        </div>
        <button
          onClick={handleAccept}
          className="font-body text-sm font-medium px-8 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-hi text-void border-none transition-all hover:-translate-y-0.5 hover:shadow-gold-md tracking-[0.04em]"
        >
          J'accepte et je m'inscris →
        </button>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
