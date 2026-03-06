'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Mail, MessageSquare, Send, Search, HelpCircle } from "lucide-react";

// ============================================
// MAH.AI — FAQ
// ============================================
// Foire Aux Questions interactive
// Design cohérent et immersif
// ============================================

const faqCategories = [
  {
    category: "Général",
    icon: "❓",
    questions: [
      {
        q: "Qu'est-ce que Mah.AI ?",
        a: "Mah.AI est la première plateforme EdTech malgache qui centralise tous les sujets d'examens nationaux (CEPE, BEPC, BAC, concours FP) et propose des corrections intelligentes par IA et des professeurs certifiés.",
      },
      {
        q: "Pour qui est destinée la plateforme ?",
        a: "Mah.AI s'adresse aux lycéens préparant le BAC ou le BEPC, aux élèves de primaire (CEPE), aux étudiants universitaires, et aux candidats aux concours de la fonction publique (ENAM, Police, Gendarmerie, etc.).",
      },
      {
        q: "Combien coûte Mah.AI ?",
        a: "L'inscription est 100% gratuite avec 10 crédits offerts. Ensuite, vous pouvez acheter des packs de crédits dès 5 000 Ar via Mobile Money.",
      },
    ],
  },
  {
    category: "Comptes et crédits",
    icon: "💳",
    questions: [
      {
        q: "Comment obtenir mes 10 crédits gratuits ?",
        a: "Il suffit de créer un compte sur Mah.AI. Les 10 crédits sont automatiquement crédités dès la validation de ton inscription. Aucune carte bancaire requise.",
      },
      {
        q: "À quoi servent les crédits ?",
        a: "Les crédits permettent d'accéder aux sujets complets, de débloquer des corrections IA, de poser des questions aux professeurs, et de passer des examens blancs.",
      },
      {
        q: "Les crédits expirent-ils ?",
        a: "Oui, selon le pack, les crédits sont valables de 30 à 90 jours. Cela t'aide à rester régulier dans tes révisions.",
      },
    ],
  },
  {
    category: "Paiements",
    icon: "💰",
    questions: [
      {
        q: "Comment puis-je payer ?",
        a: "Nous acceptons MVola, Orange Money et Airtel Money. Le processus est instantané et 100% sécurisé via nos passerelles certifiées.",
      },
      {
        q: "Y a-t-il des frais cachés ?",
        a: "Non, aucun. Le prix du pack affiché est le montant exact que tu paies via Mobile Money.",
      },
    ],
  },
  {
    category: "Sujets et corrections",
    icon: "📚",
    questions: [
      {
        q: "Les sujets sont-ils officiels ?",
        a: "Oui, tous nos sujets sont des sujets officiels des sessions d'examens nationaux de Madagascar, vérifiés par notre équipe.",
      },
      {
        q: "Puis-je télécharger les sujets en PDF ?",
        a: "Oui, une fois un sujet débloqué avec tes crédits, tu peux le télécharger en PDF de haute qualité pour réviser hors ligne.",
      },
      {
        q: "Comment fonctionne l'examen blanc ?",
        a: "L'examen blanc simule les conditions réelles avec un timer officiel. À la fin, tu obtiens ton score et une analyse détaillée de tes performances.",
      },
    ],
  },
];

function FAQItem({ question, answer, idx }: { question: string; answer: string; idx: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`reveal transition-all duration-500`} style={{ transitionDelay: `${idx * 0.05}s` }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-6 flex items-start justify-between gap-4 text-left transition-all px-4 rounded-3xl
          ${isOpen ? 'bg-white/5 border border-white/10 mb-2' : 'hover:bg-white/5 border border-transparent'}
        `}
      >
        <span className={`font-bold tracking-tight text-base ${isOpen ? 'text-teal' : 'text-text/90'}`}>
          {question}
        </span>
        <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-teal/20 text-teal rotate-180' : 'bg-white/5 text-muted'}`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out px-4
          ${isOpen ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0"}
        `}
      >
        <p className="text-muted/80 leading-relaxed text-sm font-medium border-l-2 border-teal/30 pl-4">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [searchTerm, setSearch] = useState("");

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
      <section className="relative z-10 pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/5 border border-teal/20 text-teal text-[10px] font-bold uppercase tracking-widest mb-8 reveal">
            🤝 Centre d'aide
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 reveal reveal-delay-1">
            Comment pouvons-nous <br /><span className="text-gradient">t'aider ?</span>
          </h1>
          
          <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed reveal reveal-delay-2 font-medium">
            Trouve rapidement des réponses à tes questions. Si tu ne trouves pas ce que tu cherches, notre équipe est là.
          </p>
        </div>
      </section>

      {/* ── FAQ CONTENT ── */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-16">
            {faqCategories.map((category, catIdx) => (
              <div key={catIdx} className="reveal">
                <div className="flex items-center gap-4 mb-8 pl-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-text/90">{category.category}</h2>
                </div>

                <div className="glass rounded-[32px] border border-border/40 p-2 overflow-hidden shadow-2xl">
                  {category.questions.map((item, qIdx) => (
                    <FAQItem key={qIdx} question={item.q} answer={item.a} idx={qIdx} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT CTA ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass p-12 md:p-16 rounded-[40px] border border-border/50 text-center relative overflow-hidden group reveal">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6">
                Encore des questions ?
              </h2>
              <p className="text-muted text-lg mb-12 max-w-xl mx-auto font-medium">
                Notre équipe de support est disponible pour t'accompagner dans ta réussite.
              </p>
              
              <div className="grid sm:grid-cols-3 gap-4">
                <a href="mailto:support@mah-ai.mg" className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-teal/40 transition-all group/card">
                  <Mail className="w-8 h-8 text-teal mb-4 mx-auto group-hover/card:scale-110 transition-transform" />
                  <div className="font-bold text-sm mb-1 text-text">Email</div>
                  <div className="text-[10px] text-muted font-mono uppercase">Réponse en 24h</div>
                </a>
                <a href="https://wa.me/261" target="_blank" className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-green/40 transition-all group/card">
                  <MessageSquare className="w-8 h-8 text-green mb-4 mx-auto group-hover/card:scale-110 transition-transform" />
                  <div className="font-bold text-sm mb-1 text-text">WhatsApp</div>
                  <div className="text-[10px] text-muted font-mono uppercase">Direct & Rapide</div>
                </a>
                <Link href="/contact" className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-gold/40 transition-all group/card">
                  <Send className="w-8 h-8 text-gold mb-4 mx-auto group-hover/card:scale-110 transition-transform" />
                  <div className="font-bold text-sm mb-1 text-text">Ticket</div>
                  <div className="text-[10px] text-muted font-mono uppercase">Suivi personnalisé</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
