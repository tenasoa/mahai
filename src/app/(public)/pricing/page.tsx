'use client'

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Check, Sparkles, Zap, Crown, ArrowRight, ShieldCheck, CreditCard, Clock, School } from "lucide-react";

// ============================================
// MAH.AI — Tarifs
// ============================================
// Page des packs de crédits
// Design cohérent et premium
// ============================================

const pricingPlans = [
  {
    id: "starter",
    name: "Pack Découverte",
    price: "5 000",
    credits: 10,
    icon: Sparkles,
    color: "var(--text)",
    desc: "Idéal pour tester la plateforme",
    features: [
      "10 sujets à consulter",
      "Corrections IA illimitées",
      "Téléchargement PDF",
      "Support par email",
      "Valable 30 jours",
    ],
    popular: false,
    cta: "Choisir ce pack",
  },
  {
    id: "popular",
    name: "Pack Révisions",
    price: "20 000",
    credits: 50,
    icon: Zap,
    color: "var(--teal)",
    desc: "Le choix préféré des candidats BAC",
    features: [
      "50 sujets à consulter",
      "5 corrections professeurs",
      "Examens blancs illimités",
      "Téléchargements PDF illimités",
      "Priorité support",
      "Valable 60 jours",
    ],
    popular: true,
    cta: "Commencer maintenant",
    badge: "⭐ Recommandé",
  },
  {
    id: "champion",
    name: "Pack Champion",
    price: "50 000",
    credits: 150,
    icon: Crown,
    color: "var(--gold)",
    desc: "Préparez-vous à fond pour réussir",
    features: [
      "150 sujets à consulter",
      "20 corrections professeurs",
      "Examens blancs illimités",
      "Plan de révision IA personnalisé",
      "Badge Étudiant Premium",
      "Support prioritaire",
      "Valable 90 jours",
    ],
    popular: false,
    cta: "Devenir Champion",
  },
];

export default function PricingPage() {
  // Mouse glow effect on cards
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll(".price-card-glass");
      cards.forEach(card => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        (card as HTMLElement).style.setProperty("--mx", `${x}%`);
        (card as HTMLElement).style.setProperty("--my", `${y}%`);
      });
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Mesh background */}
      <div className="mesh-bg" aria-hidden="true">
        <span /><span /><span />
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/5 border border-teal/20 text-teal text-[10px] font-bold uppercase tracking-widest mb-8 reveal">
            💎 Tarification Simple
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 reveal reveal-delay-1">
            Des tarifs <span className="text-gradient">transparents</span><br />
            pour ton succès.
          </h1>
          
          <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed reveal reveal-delay-2">
            Choisis le pack qui correspond à tes besoins de révision. 
            <span className="text-text"> Paiement Mobile Money</span> 100% sécurisé et instantané.
          </p>
        </div>
      </section>

      {/* ── PRICING GRIDS ── */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <div
                key={plan.id}
                className={`price-card-glass glass p-10 rounded-[40px] border relative overflow-hidden flex flex-col reveal
                  ${plan.popular ? 'border-teal/40 shadow-[0_20px_80px_rgba(10,255,224,0.15)] scale-[1.05] z-20' : 'border-border/40 z-10'}
                `}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                {/* Mouse Glow */}
                <div 
                  className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at var(--mx, 50%) var(--my, 50%), ${plan.color}10, transparent 70%)`
                  }}
                />

                {plan.badge && (
                  <div className="absolute top-6 right-6 px-3 py-1 bg-teal text-bg text-[10px] font-black uppercase tracking-tighter rounded-full shadow-lg shadow-teal/20">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-8">
                  <plan.icon className="w-10 h-10 mb-6" style={{ color: plan.color }} />
                  <h3 className="text-sm font-bold text-muted uppercase tracking-widest font-mono mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-text-muted text-xl font-mono">Ar</span>
                    <span className="text-5xl font-black tracking-tight text-text">{plan.price}</span>
                  </div>
                  <p className="text-xs font-bold text-teal mt-2 font-mono uppercase tracking-tighter">
                    {plan.credits} Crédits inclus
                  </p>
                </div>

                <p className="text-sm text-muted/80 mb-8 font-medium italic">"{plan.desc}"</p>

                <Link
                  href="/sign-up"
                  className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 mb-8
                    ${plan.popular 
                      ? 'bg-teal text-bg hover:scale-105 shadow-[0_15px_40px_rgba(10,255,224,0.25)]' 
                      : 'bg-bg3/50 text-text border border-border/50 hover:bg-bg3'}
                  `}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="space-y-4 flex-1">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-teal/10 flex items-center justify-center text-teal">
                        <Check className="w-2.5 h-2.5" strokeWidth={4} />
                      </div>
                      <span className="text-xs font-medium text-muted/70">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16 reveal reveal-delay-4">
            <div className="glass inline-flex items-center gap-4 px-6 py-3 rounded-2xl border border-border/40 font-mono text-[11px] text-muted/60">
              <span className="text-text font-bold">💡 Établissements scolaires & Lycées</span>
              <span className="text-border">|</span>
              <Link href="/contact" className="text-teal hover:text-teal2 transition-colors underline">Tarifs groupés disponibles →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ PRICING ── */}
      <section className="relative z-10 py-24 px-6 border-t border-border/20 bg-bg2/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 reveal">Questions fréquentes</h2>
          
          <div className="grid gap-6">
            {[
              { 
                q: "Comment puis-je payer ?", 
                a: "Nous acceptons MVola, Orange Money et Airtel Money. Le paiement est instantané et vos crédits sont ajoutés à votre compte immédiatement après confirmation.",
                icon: CreditCard 
              },
              { 
                q: "Les crédits expirent-ils ?", 
                a: "Oui, selon le pack choisi, les crédits ont une validité de 30 à 90 jours. Cela vous encourage à rester régulier dans vos révisions !",
                icon: Clock 
              },
              { 
                q: "Est-ce sécurisé ?", 
                a: "Absolument. Nous utilisons des passerelles de paiement certifiées et ne stockons aucune information bancaire sensible.",
                icon: ShieldCheck 
              },
              { 
                q: "Tarifs pour les écoles ?", 
                a: "Nous proposons des comptes 'Classe' ou 'Établissement' avec des tarifs dégressifs. Contactez notre équipe commerciale.",
                icon: School 
              },
            ].map((faq, idx) => (
              <div key={idx} className="glass p-8 rounded-3xl border border-border/30 reveal">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-teal/60">
                    <faq.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-3 tracking-tight">{faq.q}</h3>
                    <p className="text-sm text-muted/70 leading-relaxed font-medium">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center reveal">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-8">
            Pas encore convaincu ?
          </h2>
          <p className="text-muted text-lg mb-10 max-w-xl mx-auto">
            Inscris-toi maintenant et reçois <strong className="text-teal font-bold">10 crédits gratuits</strong> pour tester nos corrections IA sans dépenser un Ariary.
          </p>
          <Link
            href="/sign-up"
            className="px-10 py-5 bg-text text-bg font-black rounded-2xl hover:scale-105 transition-all shadow-xl inline-flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5" />
            Commencer gratuitement
          </Link>
        </div>
      </section>

      <footer className="relative z-10 py-12 text-center text-muted/40 text-xs font-mono border-t border-border/20">
        Mah.AI — Préparez l'avenir, un crédit à la fois. 🇲🇬
      </footer>
    </div>
  );
}
