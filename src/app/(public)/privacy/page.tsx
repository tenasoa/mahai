'use client'

import { useEffect } from "react";
import Link from "next/link";
import { Lock, Eye, Database, ShieldCheck, Mail } from "lucide-react";

// ============================================
// MAH.AI — Confidentialité
// ============================================
// Politique de protection des données
// Design transparent et sécurisant
// ============================================

export default function PrivacyPage() {
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
            🛡️ Sécurité des données
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 reveal reveal-delay-1">
            Politique de <br /><span className="text-gradient">Confidentialité</span>
          </h1>
          <p className="text-muted text-sm font-mono reveal reveal-delay-2">
            Version 1.0 — 6 Mars 2026
          </p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="relative z-10 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass p-8 md:p-12 rounded-[40px] border border-border/40 shadow-2xl reveal reveal-delay-3">
            <div className="prose prose-invert prose-teal max-w-none">
              
              <p className="text-muted leading-relaxed mb-12">
                Chez Mah.AI, la protection de ta vie privée est une priorité absolue. Cette politique explique 
                quelles données nous collectons, comment nous les utilisons et tes droits concernant ces informations.
              </p>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-5 h-5 text-teal" />
                  <h2 className="text-2xl font-bold m-0 tracking-tight">1. Collecte des Données</h2>
                </div>
                <p className="text-muted leading-relaxed mb-4">
                  Nous collectons uniquement les informations nécessaires au bon fonctionnement de ton compte :
                </p>
                <ul className="list-disc list-inside text-muted space-y-2">
                  <li>Identité : Prénom, Nom, Adresse Email.</li>
                  <li>Scolarité : Série du BAC, Classe, Établissement (optionnel).</li>
                  <li>Transactions : Historique d'achat de crédits via Mobile Money.</li>
                </ul>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="w-5 h-5 text-teal" />
                  <h2 className="text-2xl font-bold m-0 tracking-tight">2. Utilisation des Données</h2>
                </div>
                <p className="text-muted leading-relaxed">
                  Tes données servent exclusivement à :
                </p>
                <ul className="list-disc list-inside text-muted space-y-2">
                  <li>Personnaliser tes révisions et tes examens blancs.</li>
                  <li>Gérer tes crédits et l'accès aux sujets.</li>
                  <li>T'envoyer des notifications importantes sur ton compte.</li>
                  <li>Améliorer nos algorithmes de correction IA.</li>
                </ul>
                <div className="mt-6 p-4 rounded-[32px] bg-teal/5 border border-teal/10 text-xs text-teal/80 font-bold uppercase tracking-widest text-center">
                  ✨ Nous ne vendons JAMAIS tes données à des tiers.
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-5 h-5 text-teal" />
                  <h2 className="text-2xl font-bold m-0 tracking-tight">3. Sécurité</h2>
                </div>
                <p className="text-muted leading-relaxed">
                  Toutes les données sont stockées sur des serveurs sécurisés et chiffrées. Nous utilisons le service 
                  <strong className="text-text"> Clerk</strong> pour garantir une authentification de niveau bancaire.
                </p>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="w-5 h-5 text-teal" />
                  <h2 className="text-2xl font-bold m-0 tracking-tight">4. Tes Droits</h2>
                </div>
                <p className="text-muted leading-relaxed">
                  Conformément à la législation sur la protection des données, tu disposes d'un droit d'accès, 
                  de rectification et de suppression de tes données. Tu peux exercer ce droit directement depuis 
                  tes paramètres de profil ou en nous écrivant.
                </p>
              </section>

              <section className="mb-12 pt-8 border-t border-border/20">
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="w-5 h-5 text-teal" />
                  <h2 className="text-2xl font-bold m-0 tracking-tight text-gradient">Contact Privacy</h2>
                </div>
                <p className="text-muted mb-8 font-medium">
                  Pour toute question relative à tes données personnelles :
                </p>
                <a href="mailto:privacy@mah-ai.mg" className="inline-flex px-8 py-4 bg-white/5 border border-white/10 text-text rounded-2xl text-sm font-black hover:bg-teal/10 hover:border-teal/30 transition-all">
                  privacy@mah-ai.mg
                </a>
              </section>

            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-12 text-center text-muted/40 text-xs font-mono border-t border-border/20">
        Mah.AI Privacy Department — 🇲🇬 Madagascar
      </footer>
    </div>
  );
}
