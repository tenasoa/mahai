'use client'

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Target, Lightbulb, Heart, Users, TrendingUp, Shield, ArrowRight } from "lucide-react";

// ============================================
// MAH.AI — À Propos
// ============================================
// Page de mission et vision
// Design cohérent avec la charte graphique
// ============================================

export default function AboutPage() {
  // Mouse glow effect on cards
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll(".value-card");
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
    <div className="min-h-screen relative">

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/5 border border-teal/20 text-teal text-[10px] font-bold uppercase tracking-widest mb-8 reveal">
            🇲🇬 Conçu à Madagascar
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 reveal reveal-delay-1">
            Notre mission : <span className="text-gradient">démocratiser</span><br />
            l'excellence éducative.
          </h1>
          
          <p className="text-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed reveal reveal-delay-2">
            Chaque année, des centaines de milliers de malgaches affrontent les examens nationaux. 
            <span className="text-text"> Mah.AI</span> est né pour offrir à chacun d'entre eux les outils technologiques 
            les plus avancés pour transformer leurs efforts en succès.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-20 reveal reveal-delay-3">
          {[
            { num: "200+", label: "Sujets disponibles", color: "var(--teal)" },
            { num: "10K+", label: "Étudiants cibles", color: "var(--green)" },
            { num: "87%", label: "Taux de réussite visé", color: "var(--gold)" },
            { num: "0 Ar", label: "Pour commencer", color: "var(--rose)" },
          ].map((stat, i) => (
            <div key={i} className="glass p-6 rounded-2xl border border-border/40 text-center group hover:border-teal/30 transition-all duration-500">
              <div className="text-3xl font-black mb-1 group-hover:scale-110 transition-transform duration-500" style={{ color: stat.color }}>
                {stat.num}
              </div>
              <div className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="relative z-10 py-24 border-y border-border/30 bg-bg2/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Mission */}
            <div className="reveal">
              <div className="w-14 h-14 rounded-2xl bg-teal/10 flex items-center justify-center text-teal mb-8 border border-teal/20 shadow-[0_0_20px_rgba(10,255,224,0.1)]">
                <Target className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-bold mb-6 tracking-tight">Notre Mission</h2>
              <p className="text-muted leading-relaxed mb-6">
                <strong className="text-text font-semibold">Centraliser et numériser</strong> l'ensemble du patrimoine éducatif malgache pour le rendre accessible en un clic, partout sur l'île.
              </p>
              <p className="text-muted leading-relaxed">
                En combinant l'intelligence artificielle et l'expertise pédagogique humaine, nous créons un compagnon d'étude qui guide, corrige et motive chaque candidat, du CEPE aux grands concours nationaux.
              </p>
            </div>

            {/* Vision */}
            <div className="reveal reveal-delay-1">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-8 border border-gold/20 shadow-[0_0_20px_rgba(255,209,102,0.1)]">
                <Lightbulb className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-bold mb-6 tracking-tight">Notre Vision</h2>
              <p className="text-muted leading-relaxed mb-6">
                Devenir le <strong className="text-text font-semibold">standard de la EdTech à Madagascar</strong>. Une plateforme où la technologie ne remplace pas les professeurs, mais décuple leur impact.
              </p>
              <p className="text-muted leading-relaxed">
                Nous bâtissons un écosystème durable où les créateurs de contenu sont rémunérés équitablement pour leur savoir, tout en garantissant un coût d'accès minimal pour l'étudiant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES GRID ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Les valeurs qui nous guident</h2>
            <p className="text-muted max-w-xl mx-auto font-medium">L'éthique et l'accessibilité sont au cœur de chaque ligne de code que nous écrivons.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                title: "Inclusion",
                desc: "L'éducation est un droit. Nous offrons des crédits gratuits et des tarifs adaptés au pouvoir d'achat local.",
                color: "var(--rose)",
              },
              {
                icon: Users,
                title: "Communauté",
                desc: "Mah.AI appartient à ceux qui la font : contributeurs et professeurs touchent jusqu'à 70% des revenus.",
                color: "var(--teal)",
              },
              {
                icon: TrendingUp,
                title: "Innovation",
                desc: "L'IA au service de l'humain. Corrections instantanées et analyses de progrès pour gagner du temps.",
                color: "var(--gold)",
              },
              {
                icon: Shield,
                title: "Fiabilité",
                desc: "Chaque sujet est vérifié. Chaque paiement Mobile Money est sécurisé. Vos données sont protégées.",
                color: "var(--blue)",
              },
              {
                icon: Target,
                title: "Ancrage Local",
                desc: "100% Malagasy. Optimisé pour les réseaux mobiles locaux et les spécificités de nos examens.",
                color: "var(--green)",
              },
              {
                icon: Lightbulb,
                title: "Transparence",
                desc: "Pas de frais cachés. Des tableaux de bord clairs pour les gains et les dépenses des utilisateurs.",
                color: "var(--purple)",
              },
            ].map((val, i) => (
              <div
                key={i}
                className="value-card glass group p-8 rounded-[32px] border border-border/40 relative overflow-hidden hover:border-border/80 transition-all duration-500 reveal"
                style={{ transitionDelay: `${i * 0.05}s` }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at var(--mx, 50%) var(--my, 50%), ${val.color}10, transparent 70%)`
                  }}
                />
                <val.icon className="w-8 h-8 mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" style={{ color: val.color }} />
                <h3 className="text-xl font-bold mb-3 tracking-tight group-hover:text-text transition-colors">{val.title}</h3>
                <p className="text-sm text-muted/80 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass p-12 md:p-16 rounded-[32px] border border-border/50 text-center relative overflow-hidden group reveal">
            {/* Background elements */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-teal/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-teal/20 transition-all duration-700" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-green/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-green/20 transition-all duration-700" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">
                Prêt à rejoindre la révolution <span className="text-gradient">EdTech malgache ?</span>
              </h2>
              <p className="text-muted text-lg mb-10 max-w-2xl mx-auto">
                Inscris-toi dès aujourd'hui et reçois <strong className="text-text font-bold">10 crédits gratuits</strong> pour explorer tout le catalogue.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/sign-up"
                  className="w-full sm:w-auto px-8 py-4 bg-teal text-bg font-bold rounded-2xl hover:scale-105 transition-all shadow-[0_20px_50px_rgba(10,255,224,0.3)] flex items-center justify-center gap-2 group/btn"
                >
                  Commencer maintenant
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/catalogue"
                  className="w-full sm:w-auto px-8 py-4 bg-bg3/50 text-text font-semibold rounded-2xl border border-border/50 hover:bg-bg3 transition-all"
                >
                  Voir le catalogue
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer minimal pour la page public */}
    </div>
  );
}
