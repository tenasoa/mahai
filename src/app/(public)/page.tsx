"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  ArrowRight, 
  BookOpen, 
  Bot, 
  CheckCircle2, 
  Download, 
  GraduationCap, 
  LayoutDashboard, 
  Sparkles, 
  Star, 
  Zap 
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── COMPOSANTS INTERNES ──

const Ticker = () => {
  const tickerItems = [
    "🎓 BAC", "📐 Mathématiques", "🔬 Sciences", "📚 Français",
    "🌍 Histoire-Géo", "⚗️ Physique-Chimie", "🧬 SVT", "💡 Philosophie",
    "🎓 BEPC", "📊 Économie", "🏫 CEPE", "🎯 Concours FP",
  ]
  return (
    <div className="overflow-hidden border-y border-white/5 py-4 bg-teal/5">
      <div className="flex animate-ticker whitespace-nowrap">
        {[...tickerItems, ...tickerItems].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-8 text-xs font-mono text-muted uppercase tracking-widest">
            <strong className="text-teal">{item}</strong>
            <span className="opacity-20">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

const StatItem = ({ num, label, label2 }: { num: string, label: string, label2?: string }) => (
  <div className="flex flex-col items-center justify-center px-10 py-6 border-r border-white/5 last:border-r-0">
    <div className="text-3xl font-black text-gradient line-height-1">{num}</div>
    <div className="text-[10px] text-muted uppercase tracking-tighter mt-1 font-mono">{label}</div>
    {label2 && <div className="text-[9px] text-teal/40 font-medium">{label2}</div>}
  </div>
)

const FeatureCard = ({ icon: Icon, title, description, badge, className, delay }: any) => (
  <div 
    className={cn(
      "group relative p-8 rounded-[32px] bg-bg2 border border-white/5 hover:border-teal/30 transition-all duration-500 overflow-hidden reveal",
      className
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-teal/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    {badge && (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 border border-teal/20 text-[10px] font-bold text-teal uppercase tracking-widest mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
        {badge}
      </div>
    )}
    <div className="w-12 h-12 rounded-2xl bg-bg3 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
      <Icon className="w-6 h-6 text-teal" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-sm text-muted leading-relaxed">{description}</p>
  </div>
)

// ── PAGE PRINCIPALE ──

export default function LandingPage() {
  const [counts, setCounts] = useState({ sujets: 0, users: 0, bonus: 0 })

  useEffect(() => {
    const targets = { sujets: 250, users: 15000, bonus: 50 }
    const step = 50
    const interval = setInterval(() => {
      setCounts(prev => ({
        sujets: Math.min(prev.sujets + 10, targets.sujets),
        users: Math.min(prev.users + 500, targets.users),
        bonus: Math.min(prev.bonus + 2, targets.bonus)
      }))
    }, step)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden min-h-[90vh] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg3 border border-white/10 text-xs font-bold text-teal tracking-tighter mb-10 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            L'IA au service de l'éducation malagasy 🇲🇬
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8 animate-fade-in-up">
            Réussis tes examens <br />
            <span className="text-gradient">avec l'IA</span> <br />
            <span className="text-muted/40 font-light italic">à tes côtés.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted leading-relaxed mb-12 animate-fade-in-up delay-100">
            Accède aux meilleurs sujets nationaux, reçois des corrections <br className="hidden md:block" />
            détaillées par l'IA et prépare-toi comme les meilleurs du pays.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-in-up delay-200">
            <Link 
              href="/sign-up" 
              className="w-full sm:w-auto px-10 py-5 bg-teal hover:bg-teal2 text-bg font-black rounded-2xl transition-all shadow-lg shadow-teal/20 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
            >
              🚀 S'inscrire gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/catalogue" 
              className="w-full sm:w-auto px-10 py-5 bg-bg2 border border-white/10 hover:border-teal/30 text-text font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              Voir le catalogue
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="inline-flex flex-col md:flex-row border border-white/5 bg-bg2/40 backdrop-blur-xl rounded-[32px] overflow-hidden animate-fade-in-up delay-300 shadow-2xl">
            <StatItem num={`${counts.sujets}+`} label="Sujets dispo" label2="BAC, BEPC, CEPE" />
            <StatItem num={`${(counts.users / 1000).toFixed(0)}k+`} label="Candidats malagasy" />
            <StatItem num={`${counts.bonus}%`} label="Taux de réussite" label2="Moyenne Mah.AI" />
            <StatItem num="0 Ar" label="Prix d'entrée" />
          </div>
        </div>

        {/* Hero Visual Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      </section>

      <Ticker />

      {/* BENTO FEATURES */}
      <section className="py-32 px-6 max-w-7xl mx-auto" id="features">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Tout pour <span className="text-teal">réussir.</span>
          </h2>
          <p className="text-muted max-w-md mx-auto">
            Une plateforme pensée pour les candidats malagasy — du CEPE au concours de la Fonction Publique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Card - 7 columns */}
          <div className="md:col-span-7 group relative p-10 rounded-[40px] bg-gradient-to-br from-bg2 to-bg3 border border-white/5 hover:border-teal/30 transition-all duration-500 overflow-hidden">
             <div className="relative z-10 h-full flex flex-col">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 border border-teal/20 text-[10px] font-bold text-teal uppercase tracking-widest mb-10 w-fit">
                 Catalogue
               </div>
               <h3 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                 Le catalogue <br /> le plus complet <br /> à Madagascar.
               </h3>
               <p className="text-muted mb-10 max-w-sm">
                 BAC, BEPC, CEPE et Concours Administratifs. Tous les sujets officiels depuis 2015 organisés par matière et année.
               </p>
               <Link href="/catalogue" className="mt-auto group/btn flex items-center gap-2 text-teal font-bold text-sm tracking-widest uppercase pb-1 border-b border-teal/20 w-fit hover:border-teal transition-all">
                 Explorer le catalogue
                 <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
               </Link>
             </div>
             
             {/* Decorative Visual */}
             <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <BookOpen className="w-full h-full text-teal translate-x-1/4 -translate-y-1/4" />
             </div>
          </div>

          {/* AI Helper - 5 columns */}
          <div className="md:col-span-5 relative p-10 rounded-[40px] bg-bg2 border border-white/5 overflow-hidden group">
            <div className="relative z-10">
              <Bot className="w-10 h-10 text-teal mb-6" />
              <h3 className="text-2xl font-bold mb-4">Correction Assistée par IA</h3>
              <p className="text-sm text-muted leading-relaxed mb-8">
                L'IA ne te donne pas juste la réponse, elle t'explique la démarche pas à pas pour que tu comprennes vraiment.
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-bg3 border border-white/5 rounded-2xl text-[11px] text-muted italic">
                  "Comment calculer la limite en +∞ ?"
                </div>
                <div className="p-3 bg-teal/10 border border-teal/20 rounded-2xl text-[11px] text-teal font-medium">
                  "Utilise d'abord le théorème du plus haut degré..."
                </div>
              </div>
            </div>
          </div>

          {/* Smaller Cards */}
          <FeatureCard 
            className="md:col-span-4"
            icon={Download}
            title="Sujets PDF"
            description="Télécharge et imprime les sujets officiels pour réviser même sans connexion."
          />
          <FeatureCard 
            className="md:col-span-4"
            icon={Zap}
            title="Examen Blanc"
            description="Teste-toi en conditions réelles avec un timer et un score immédiat."
            badge="Populaire"
          />
          <FeatureCard 
            className="md:col-span-4"
            icon={GraduationCap}
            title="Profs Certifiés"
            description="Des corrections de qualité rédigées par des professeurs du Lycée."
          />
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto rounded-[48px] bg-gradient-to-tr from-bg2 via-bg3 to-teal/5 border border-teal/10 p-12 md:p-24 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-teal/40 blur-lg" />
          
          <h2 className="text-4xl md:text-7xl font-black mb-8 relative z-10 leading-tight">
            Prêt à décrocher <br /> ton <span className="text-teal">diplôme ?</span>
          </h2>
          <p className="text-lg text-muted mb-12 max-w-xl mx-auto relative z-10">
            Rejoins des milliers d'étudiants malagasy qui utilisent déjà Mah.AI pour booster leurs révisions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <Link 
              href="/sign-up" 
              className="px-12 py-5 bg-teal text-bg font-black rounded-2xl shadow-xl shadow-teal/20 transition-all hover:scale-105 active:scale-95"
            >
              Créer mon compte
            </Link>
            <Link 
              href="/pricing" 
              className="text-white font-bold hover:text-teal transition-colors flex items-center gap-2"
            >
              Découvrir les tarifs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal/5 rounded-full blur-[80px]" />
        </div>
      </section>
    </div>
  )
}
