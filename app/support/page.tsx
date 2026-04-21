'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HelpCircle, Book, MessageSquare, Phone, Mail, Search, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryFooter } from '@/components/layout/LuxuryFooter'
import { LegalPageSkeleton } from '@/components/ui/PageSkeletons'

export default function SupportPage() {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    document.title = "Mah.AI — Support"
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <LegalPageSkeleton />
  }

  const categories = [
    { id: 'all', name: 'Tous' },
    { id: 'account', name: 'Compte' },
    { id: 'payment', name: 'Paiement' },
    { id: 'subjects', name: 'Sujets' },
    { id: 'correction', name: 'Correction IA' },
    { id: 'contributor', name: 'Contributeur' }
  ]

  const helpArticles = [
    {
      category: 'account',
      title: 'Comment créer un compte ?',
      content: 'Cliquez sur "Créer un compte" en haut à droite, remplissez le formulaire avec vos informations (nom, email, mot de passe), puis validez votre email via le lien envoyé.',
      icon: <HelpCircle className="w-5 h-5" />
    },
    {
      category: 'account',
      title: 'Comment réinitialiser mon mot de passe ?',
      content: 'Sur la page de connexion, cliquez sur "Mot de passe oublié". Entrez votre email et vous recevrez un lien pour réinitialiser votre mot de passe.',
      icon: <HelpCircle className="w-5 h-5" />
    },
    {
      category: 'payment',
      title: 'Comment recharger mes crédits ?',
      content: 'Allez sur la page "Recharge", choisissez votre pack (50, 150 ou 300 crédits), sélectionnez votre opérateur Mobile Money (MVola, Orange, Airtel), effectuez le transfert et entrez le code de transaction.',
      icon: <Book className="w-5 h-5" />
    },
    {
      category: 'payment',
      title: 'Mon paiement n\'a pas été validé',
      content: 'Les paiements sont validés manuellement sous 12h maximum. Si après 12h vous n\'avez toujours pas vos crédits, contactez le support avec votre code de transaction.',
      icon: <AlertCircle className="w-5 h-5" />
    },
    {
      category: 'subjects',
      title: 'Comment acheter un sujet ?',
      content: 'Parcourez le catalogue, cliquez sur un sujet pour voir l\'aperçu gratuit, puis cliquez sur "Acheter". Les crédits seront déduits de votre wallet et le sujet sera débloqué.',
      icon: <Book className="w-5 h-5" />
    },
    {
      category: 'subjects',
      title: 'Puis-je récupérer mes crédits après achat ?',
      content: 'Non, les crédits consommés pour un achat ne sont pas remboursables. Cependant, vous pouvez accéder au sujet acheté autant de fois que vous le souhaitez.',
      icon: <AlertCircle className="w-5 h-5" />
    },
    {
      category: 'correction',
      title: 'Comment utiliser la correction IA ?',
      content: 'Après avoir acheté un sujet, cliquez sur "Soumettre mes réponses". Écrivez ou scannez vos réponses, puis cliquez sur "Corriger". L\'IA analysera vos réponses en moins de 10 secondes.',
      icon: <HelpCircle className="w-5 h-5" />
    },
    {
      category: 'correction',
      title: 'La correction IA est-elle gratuite ?',
      content: 'La correction IA consomme des crédits supplémentaires. Le coût est indiqué avant chaque soumission. En général, cela coûte entre 2 et 5 crédits selon la complexité du sujet.',
      icon: <Book className="w-5 h-5" />
    },
    {
      category: 'contributor',
      title: 'Comment devenir contributeur ?',
      content: 'Allez sur "Devenir contributeur", remplissez le formulaire de candidature avec vos matières, expérience et motivation. Notre équipe examinera votre dossier sous 48h.',
      icon: <HelpCircle className="w-5 h-5" />
    },
    {
      category: 'contributor',
      title: 'Comment sont payés les contributeurs ?',
      content: 'Les contributeurs reçoivent 80% à 90% du prix de chaque sujet vendu. Les paiements sont mensuels via Mobile Money dès que le solde atteint 5 000 Ar.',
      icon: <Book className="w-5 h-5" />
    }
  ]

  const filteredArticles = activeCategory === 'all' 
    ? helpArticles 
    : helpArticles.filter(article => article.category === activeCategory)

  const contactOptions = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Chat en direct',
      description: 'Discutez avec un agent en temps réel (disponible 9h-18h, lun-ven)',
      action: 'Démarrer un chat',
      available: true
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      description: 'Envoyez-nous un email, nous répondons sous 24h',
      action: 'support@mah.ai',
      available: true
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Téléphone',
      description: 'Appelez notre ligne support (disponible 9h-17h)',
      action: '+261 34 XX XXX XX',
      available: false
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
            Centre d'aide
          </div>
          <h1 className="font-display font-normal text-5xl md:text-6xl text-text leading-tight mb-6">
            Comment pouvons-nous <em className="text-gold">vous aider ?</em>
          </h1>
          <p className="text-text2 text-lg max-w-3xl leading-relaxed mb-8">
            Trouvez des réponses à vos questions ou contactez notre équipe de support.
          </p>
          
          {/* Search */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text3" />
              <input
                type="text"
                placeholder="Rechercher dans l'aide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-card border border-b1 rounded-lg text-text placeholder:text-text3 focus:border-gold focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-8 text-center">
            Options de <em className="text-gold">contact</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => (
              <div key={index} className={`bg-card border ${option.available ? 'border-b1' : 'border-ruby-line bg-ruby-dim'} rounded-lg p-6`}>
                <div className={`w-12 h-12 ${option.available ? 'bg-gold-dim border-gold-line text-gold' : 'bg-ruby-dim border-ruby-line text-ruby'} border rounded flex items-center justify-center mb-4`}>
                  {option.icon}
                </div>
                <h3 className="font-display text-xl text-text mb-2">{option.title}</h3>
                <p className="text-text2 text-sm mb-4">{option.description}</p>
                {!option.available ? (
                  <div className="font-mono text-xs text-ruby flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Indisponible pour le moment
                  </div>
                ) : (
                  <div className="font-mono text-xs text-gold">{option.action}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Articles */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-8 text-center">
            Articles d'<em className="text-gold">aide</em>
          </h2>

          {/* Categories */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`font-mono text-xs px-4 py-2 rounded-full transition-all ${
                  activeCategory === category.id
                    ? 'bg-gold text-void'
                    : 'bg-card border border-b1 text-text3 hover:border-gold hover:text-gold'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((article, index) => (
              <div key={index} className="bg-card border border-b1 rounded-lg p-6 hover:border-gold transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gold-dim border border-gold-line rounded flex items-center justify-center text-gold">
                    {article.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-text mb-2">{article.title}</h3>
                    <p className="text-text2 text-sm leading-relaxed">{article.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-8 text-center">
            Liens <em className="text-gold">rapides</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/comment-ca-marche" className="bg-card border border-b1 rounded-lg p-6 hover:border-gold transition-all flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-text mb-1">Comment ça marche</h3>
                <p className="text-text2 text-sm">Guide complet d'utilisation</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gold" />
            </Link>
            <Link href="/correction-ia" className="bg-card border border-b1 rounded-lg p-6 hover:border-gold transition-all flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-text mb-1">Correction IA</h3>
                <p className="text-text2 text-sm">Comprendre notre technologie</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gold" />
            </Link>
            <Link href="/devenir-contributeur" className="bg-card border border-b1 rounded-lg p-6 hover:border-gold transition-all flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-text mb-1">Devenir contributeur</h3>
                <p className="text-text2 text-sm">Rejoindre notre communauté</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gold" />
            </Link>
            <Link href="/contact" className="bg-card border border-b1 rounded-lg p-6 hover:border-gold transition-all flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-text mb-1">Contact direct</h3>
                <p className="text-text2 text-sm">Envoyer un message</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gold" />
            </Link>
          </div>
        </div>
      </section>

      {/* Status */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-8 text-center">
            État du <em className="text-gold">service</em>
          </h2>
          <div className="bg-card border border-b1 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-6 h-6 text-sage" />
              <span className="font-display text-xl text-text">Tous les systèmes sont opérationnels</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-b3">
                <span className="text-text2">Plateforme web</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sage rounded-full"></div>
                  <span className="font-mono text-xs text-sage">Opérationnel</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-b3">
                <span className="text-text2">Correction IA</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sage rounded-full"></div>
                  <span className="font-mono text-xs text-sage">Opérationnel</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-b3">
                <span className="text-text2">Paiement Mobile Money</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sage rounded-full"></div>
                  <span className="font-mono text-xs text-sage">Opérationnel</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-text2">Support chat</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-ruby rounded-full"></div>
                  <span className="font-mono text-xs text-ruby">Hors service</span>
                </div>
              </div>
            </div>
            <div className="mt-6 font-mono text-xs text-text3 text-center">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </section>

      <LuxuryFooter />
    </div>
  )
}
