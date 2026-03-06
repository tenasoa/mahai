'use client'

import { useEffect } from "react";
import Link from "next/link";
import { Shield, FileText, Scale, Lock, AlertCircle } from "lucide-react";

// ============================================
// MAH.AI — CGU
// ============================================
// Conditions Générales d'Utilisation
// Design épuré et lisible
// ============================================

export default function TermsPage() {
  // Reveal on scroll
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Mesh background */}
      <div className="mesh-bg" aria-hidden="true">
        <span /><span /><span />
      </div>

      {/* ── HEADER ── */}
      <section className="relative z-10 pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/5 border border-teal/20 text-teal text-[10px] font-bold uppercase tracking-widest mb-8 reveal">
            ⚖️ Aspect Légal
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 reveal reveal-delay-1">
            Conditions Générales <br /><span className="text-gradient">d'Utilisation</span>
          </h1>
          <p className="text-muted text-sm font-mono reveal reveal-delay-2">
            Dernière mise à jour : 6 Mars 2026
          </p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="relative z-10 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass p-8 md:p-12 rounded-[40px] border border-border/40 shadow-2xl reveal reveal-delay-3">
            <div className="prose prose-invert prose-teal max-w-none">
              
              <div className="flex items-start gap-4 mb-12 p-6 rounded-[32px] bg-teal/5 border border-teal/10">
                <AlertCircle className="w-6 h-6 text-teal flex-shrink-0 mt-1" />
                <p className="text-sm text-teal/80 font-medium leading-relaxed m-0">
                  L'utilisation de Mah.AI implique l'acceptation pleine et entière de ces conditions. 
                  Nous t'invitons à les lire attentivement pour comprendre tes droits et obligations.
                </p>
              </div>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-5 h-5 text-teal" />
                  <h2 className="text-2xl font-bold m-0 tracking-tight">1. Présentation</h2>
                </div>
                <p className="text-muted leading-relaxed">
                  Mah.AI est une plateforme éducative opérée par <strong className="text-text">Mah.AI SARL</strong>, 
                  société de droit malgache basée à Antananarivo. Notre mission est de fournir des outils de révision 
                  technologiques pour les examens nationaux malgaches.
                </p>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-5 h-5 text-teal" />
                  <h2 className="text-2xl font-bold m-0 tracking-tight">2. Compte Utilisateur</h2>
                </div>
                <p className="text-muted leading-relaxed mb-4">
                  Tu dois avoir au moins <strong className="text-text">13 ans</strong> pour t'inscrire. 
                  Tu es responsable de la sécurité de ton compte et de toutes les activités qui y sont liées.
                </p>
                <p className="text-muted leading-relaxed">
                  Le partage de compte est strictement interdit afin de garantir l'intégrité de ton suivi pédagogique.
                </p>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Scale className="w-5 h-5 text-teal" />
                  <h2 className="text-2xl font-bold m-0 tracking-tight">3. Crédits et Paiements</h2>
                </div>
                <p className="text-muted leading-relaxed mb-6">
                  L'accès aux services premium s'effectue via un système de crédits rechargeables par Mobile Money 
                  (MVola, Orange Money, Airtel Money).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Découverte", val: "30 jours" },
                    { label: "Révisions", val: "60 jours" },
                    { label: "Champion", val: "90 jours" },
                  ].map((p, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                      <div className="text-[10px] uppercase font-bold text-muted mb-1">{p.label}</div>
                      <div className="text-sm font-bold text-text">{p.val}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted/60 italic">
                  Note : Les crédits ne sont pas remboursables, sauf erreur technique majeure de notre part.
                </p>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-5 h-5 text-teal" />
                  <h2 className="text-2xl font-bold m-0 tracking-tight">4. Propriété Intellectuelle</h2>
                </div>
                <p className="text-muted leading-relaxed">
                  Tous les contenus (sujets, logos, corrections IA) sont la propriété exclusive de Mah.AI ou de ses 
                  partenaires. Tu disposes d'un droit d'usage strictement personnel et non commercial.
                </p>
              </section>

              <section className="mb-12 pt-8 border-t border-border/20">
                <h2 className="text-2xl font-bold mb-6 tracking-tight text-gradient">Besoin de précisions ?</h2>
                <p className="text-muted mb-8 font-medium">
                  Notre équipe juridique est à ton écoute pour toute question concernant ces termes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/contact" className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all text-center">
                    Contacter le support
                  </Link>
                  <a href="mailto:legal@mah-ai.mg" className="px-6 py-3 bg-teal/10 border border-teal/20 text-teal rounded-xl text-sm font-bold hover:bg-teal/20 transition-all text-center">
                    legal@mah-ai.mg
                  </a>
                </div>
              </section>

            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-12 text-center text-muted/40 text-xs font-mono border-t border-border/20">
        Mah.AI — Respect et Transparence. 🇲🇬
      </footer>
    </div>
  );
}
