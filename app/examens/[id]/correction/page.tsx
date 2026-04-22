import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { GraduationCap, ArrowRight, CheckCircle, Bot, Sparkles, ShieldCheck, Zap } from 'lucide-react'
import { ExamenCorrectionSkeleton } from '@/components/ui/PageSkeletons'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import './correction.css'

interface CorrectionPageProps {
  params: Promise<{ id: string }>
}

export default async function ExamCorrectionPage({ params }: CorrectionPageProps) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const correctionOptions = [
    {
      id: 'ia',
      type: 'IA',
      icon: Bot,
      credits: 15,
      description: 'Correction instantanée générée par intelligence artificielle. Explications détaillées et méthode de résolution pas à pas.',
      color: 'gold',
      popular: true,
    },
    {
      id: 'prof',
      type: 'Professeur',
      icon: GraduationCap,
      credits: 45,
      description: 'Correction approfondie par un professeur certifié. Feedback personnalisé et conseils méthodologiques sur mesure.',
      color: 'blue',
      popular: false,
    },
  ]

  return (
    <div className="correction-page">
      <LuxuryNavbar />
      <LuxuryCursor />

      <Suspense fallback={<ExamenCorrectionSkeleton />}>
        <main id="main-content" className="correction-container">
          <div className="mb-8">
            <Link href={`/examens/${id}/results`} className="luxury-back-link">
              <ArrowRight size={14} className="rotate-180" />
              Retour aux résultats
            </Link>
          </div>

          <div className="text-center mb-12">
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-line bg-gold-dim px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-gold mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Optimisation de progression
            </p>
            <h1 className="text-h1 font-semibold text-text mb-4">
              Corrections <em>Détaillées</em>
            </h1>
            <p className="mx-auto max-w-xl text-base text-text-2">
              Ne laissez aucune zone d'ombre. Choisissez le mode de correction qui vous correspond pour comprendre vos erreurs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {correctionOptions.map((option) => (
              <article
                key={option.id}
                className={`relative overflow-hidden rounded-2xl border bg-card p-8 transition-all ${
                  option.popular
                    ? 'border-gold shadow-[0_0_40px_rgba(168,120,42,0.15)] ring-1 ring-gold'
                    : 'border-border-1 hover:border-gold-line'
                }`}
              >
                {option.popular && (
                  <div className="absolute right-4 top-4">
                    <span className="rounded-full bg-gold px-3 py-1 font-mono text-[0.55rem] uppercase tracking-widest text-void font-bold">
                      Recommandé
                    </span>
                  </div>
                )}

                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl border ${
                  option.id === 'ia' ? 'border-gold-line bg-gold-dim text-gold' : 'border-blue-line bg-blue-dim text-blue'
                }`}>
                  <option.icon className="h-7 w-7" />
                </div>

                <h3 className="mb-3 text-h3 font-semibold text-text">
                  Correction {option.type}
                </h3>

                <p className="mb-6 text-sm leading-relaxed text-text-3">
                  {option.description}
                </p>

                <div className="mb-8 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-text">{option.credits}</span>
                  <span className="font-mono text-xs uppercase tracking-widest text-text-4">crédits</span>
                </div>

                <button
                  className={`w-full rounded-xl py-4 text-sm font-bold transition-all ${
                    option.id === 'ia'
                      ? 'bg-gradient-to-r from-gold to-gold-hi text-void shadow-lg hover:-translate-y-1'
                      : 'border border-border-1 bg-surface text-text-2 hover:border-gold-line hover:text-gold'
                  }`}
                >
                  Débloquer la correction
                </button>

                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-text-3">
                    <CheckCircle className="h-4 w-4 text-sage" />
                    <span>Analyse point par point</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-3">
                    <CheckCircle className="h-4 w-4 text-sage" />
                    <span>Explications pédagogiques</span>
                  </div>
                  {option.id === 'prof' && (
                    <div className="flex items-center gap-3 text-xs text-text-3">
                      <CheckCircle className="h-4 w-4 text-sage" />
                      <span>Conseils personnalisés</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          <section className="luxury-card p-8 bg-gradient-to-br from-void to-depth border-gold-line">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-10 w-10 rounded-full bg-gold-dim flex items-center justify-center border border-gold-line">
                <ShieldCheck className="text-gold h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-text">Engagement <em>Qualité</em> Mah.AI</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 text-sm text-text-3">
              <div className="flex gap-3">
                <Zap className="h-5 w-5 text-gold shrink-0" />
                <p>Nos corrections sont conçues pour identifier les lacunes spécifiques et proposer des pistes de remédiation immédiates.</p>
              </div>
              <div className="flex gap-3">
                <Zap className="h-5 w-5 text-gold shrink-0" />
                <p>Accès illimité : une fois la correction achetée, elle reste disponible dans votre coffre-fort à vie.</p>
              </div>
            </div>
          </section>
        </main>
      </Suspense>
    </div>
  )
}
