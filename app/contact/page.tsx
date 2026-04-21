'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Send, ArrowLeft } from 'lucide-react'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryFooter } from '@/components/layout/LuxuryFooter'
import { LegalPageSkeleton } from '@/components/ui/PageSkeletons'

export default function ContactPage() {
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [contactInfo, setContactInfo] = useState([
    {
      icon: <Mail className="w-5 h-5" />,
      label: 'Email général',
      value: 'contact@mah.ai',
      link: 'mailto:contact@mah.ai'
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: 'Email juridique',
      value: 'legal@mah.ai',
      link: 'mailto:legal@mah.ai'
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: 'Téléphone',
      value: '+261 34 XX XXX XX',
      link: 'tel:+26134000000'
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Adresse',
      value: 'Antananarivo 101, Madagascar',
      link: null
    }
  ])

  useEffect(() => {
    document.title = "Mah.AI — Contact"
    
    // Fetch contact info from API
    const fetchContactInfo = async () => {
      try {
        const res = await fetch('/api/admin/contact-info')
        if (res.ok) {
          const data = await res.json()
          setContactInfo([
            {
              icon: <Mail className="w-5 h-5" />,
              label: 'Email général',
              value: data.contactInfo.generalEmail,
              link: `mailto:${data.contactInfo.generalEmail}`
            },
            {
              icon: <Mail className="w-5 h-5" />,
              label: 'Email juridique',
              value: data.contactInfo.legalEmail,
              link: `mailto:${data.contactInfo.legalEmail}`
            },
            {
              icon: <Phone className="w-5 h-5" />,
              label: 'Téléphone',
              value: data.contactInfo.phone,
              link: `tel:${data.contactInfo.phone.replace(/\s/g, '')}`
            },
            {
              icon: <MapPin className="w-5 h-5" />,
              label: 'Adresse',
              value: data.contactInfo.address,
              link: null
            }
          ])
        }
      } catch (error) {
        console.error('Error fetching contact info:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchContactInfo()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const faqItems = [
    {
      question: 'Comment puis-je recharger mes crédits ?',
      answer: 'Vous pouvez recharger vos crédits via Mobile Money (MVola, Orange Money, Airtel Money) en vous rendant sur la page Recharge. Suivez les instructions pour effectuer un transfert vers notre numéro Mah.AI.'
    },
    {
      question: 'Combien coûte un sujet d\'examen ?',
      answer: 'Les prix varient selon le type d\'examen : CEPE (gratuit à 5 crédits), BEPC (5-10 crédits), BAC (10-20 crédits). Le prix exact est indiqué sur chaque sujet.'
    },
    {
      question: 'La correction IA est-elle fiable ?',
      answer: 'Notre correction IA propulsée par Perplexity offre une précision de 85-90%. Elle est conçue pour compléter, non remplacer, l\'enseignement humain. Vérifiez toujours avec vos professeurs.'
    },
    {
      question: 'Puis-je devenir contributeur ?',
      answer: 'Oui ! Si vous êtes professeur, étudiant en fin d\'études ou expert dans une matière, vous pouvez postuler via la page "Devenir contributeur". Notre équipe examinera votre dossier.'
    }
  ]

  if (loading) {
    return <LegalPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-void text-text">
      <LuxuryCursor />
      <LuxuryNavbar />

      {/* Hero */}
      <section className="relative py-24 px-6 border-b border-b1 bg-depth">
        <div className="max-w-7xl mx-auto">
          <div className="font-mono text-xs text-gold flex items-center gap-2 mb-4">
            <div className="w-5 h-px bg-gold"></div>
            Contact
          </div>
          <h1 className="font-display font-normal text-5xl md:text-6xl text-text leading-tight mb-6">
            Parlons de <em className="text-gold">votre projet</em>
          </h1>
          <p className="text-text2 text-lg max-w-3xl leading-relaxed">
            Une question, une suggestion ou envie de collaborer ? Notre équipe est là pour vous répondre.
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-8">
              Nos <em className="text-gold">coordonnées</em>
            </h2>
            <div className="space-y-6 mb-12">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-card border border-b1 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gold-dim border border-gold-line rounded flex items-center justify-center text-gold">
                      {info.icon}
                    </div>
                    <div>
                      <div className="font-mono text-xs text-text3 uppercase tracking-[0.12em] mb-1">
                        {info.label}
                      </div>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-text hover:text-gold transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <div className="text-text">{info.value}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card border border-b1 rounded-lg p-6">
              <h3 className="font-display text-xl text-text mb-4">Horaires de réponse</h3>
              <p className="text-text2 leading-relaxed">
                Notre équipe répond aux emails dans un délai de 24h à 48h ouvrées. Pour les urgences, utilisez le formulaire de contact.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-8">
              Envoyez-nous un <em className="text-gold">message</em>
            </h2>
            {submitted ? (
              <div className="bg-sage-dim border border-sage-line rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="font-display text-xl text-sage mb-2">Message envoyé !</h3>
                <p className="text-text2">
                  Nous vous répondrons dans les plus brefs délais.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card border border-b1 rounded-lg p-8">
                <div className="space-y-6">
                  <div>
                    <label className="font-mono text-xs text-text3 uppercase tracking-[0.12em] mb-2 block">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-lift border border-b1 rounded text-text placeholder:text-text3 focus:border-gold focus:outline-none transition-colors"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs text-text3 uppercase tracking-[0.12em] mb-2 block">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-lift border border-b1 rounded text-text placeholder:text-text3 focus:border-gold focus:outline-none transition-colors"
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs text-text3 uppercase tracking-[0.12em] mb-2 block">
                      Sujet
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 bg-lift border border-b1 rounded text-text focus:border-gold focus:outline-none transition-colors"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="support">Support technique</option>
                      <option value="billing">Facturation</option>
                      <option value="contributeur">Devenir contributeur</option>
                      <option value="partnership">Partenariat</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-xs text-text3 uppercase tracking-[0.12em] mb-2 block">
                      Message
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 bg-lift border border-b1 rounded text-text placeholder:text-text3 focus:border-gold focus:outline-none transition-colors resize-none"
                      placeholder="Décrivez votre demande..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gold to-gold-hi text-void rounded font-medium tracking-[0.04em] hover:-translate-y-0.5 hover:shadow-gold-md transition-all"
                  >
                    Envoyer le message
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em] mb-12 text-center">
            Questions <em className="text-gold">fréquentes</em>
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-card border border-b1 rounded-lg p-6">
                <h3 className="font-display text-lg text-text mb-3">
                  {item.question}
                </h3>
                <p className="text-text2 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LuxuryFooter />
    </div>
  )
}
