import Link from "next/link";
import { Sparkles, BookOpen, Brain, Zap, Users, Award, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mah.AI — Réussis tes examens avec l'IA à tes côtés",
  description:
    "Plateforme EdTech malgache : sujets d'examens (BAC, BEPC, CEPE, Concours FP), corrections IA, examens blancs. 10 crédits offerts à l'inscription.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/10 border border-teal/20 text-teal text-sm font-mono mb-8 animate-fade-in">
            🇲🇬 Plateforme EdTech Madagascar · MVP Beta
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 animate-slide-up">
            <span className="block mb-2">Réussis tes examens</span>
            <span className="text-gradient-teal block mb-2">avec l'IA</span>
            <span className="block">à tes côtés.</span>
          </h1>

          <p className="text-lg md:text-xl text-text-muted max-w-3xl mx-auto leading-relaxed mb-12 animate-slide-up" style={{ animationDelay: "100ms" }}>
            Accède aux meilleurs <strong className="text-text">sujets d'examens nationaux</strong>, reçois des{" "}
            <strong className="text-text">corrections détaillées par l'IA</strong> et des professeurs certifiés,
            et prépare-toi comme jamais.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Link
              href="/sign-up"
              className="group px-8 py-4 bg-teal text-bg font-semibold rounded-xl hover:bg-teal-600 transition-all shadow-xl shadow-teal/30 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Commencer gratuitement
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/catalogue"
              className="px-8 py-4 border border-border bg-bg2/50 backdrop-blur-sm text-text font-medium rounded-xl hover:border-border-2 transition-all"
            >
              Explorer le catalogue
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: "300ms" }}>
            {[
              { num: "200+", label: "Sujets disponibles" },
              { num: "10K+", label: "Étudiants cibles" },
              { num: "87%", label: "Taux de réussite visé" },
              { num: "0 Ar", label: "Pour commencer" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-teal mb-1">{stat.num}</div>
                <div className="text-xs md:text-sm font-mono text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted text-sm font-mono animate-pulse">
            <span>découvrir</span>
            <div className="w-px h-12 bg-gradient-to-b from-teal to-transparent" />
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="relative overflow-hidden border-y border-border bg-bg2/30 py-4">
        <div className="flex animate-float-mesh gap-8 whitespace-nowrap">
          {["🎓 BAC", "📐 Mathématiques", "🔬 Sciences", "📚 Français", "🌍 Histoire-Géo", "⚗️ Physique-Chimie", "🧬 SVT", "💡 Philosophie", "🎓 BEPC", "📊 Économie", "🏫 CEPE", "🎯 Concours FP"]
            .concat(["🎓 BAC", "📐 Mathématiques", "🔬 Sciences", "📚 Français", "🌍 Histoire-Géo", "⚗️ Physique-Chimie", "🧬 SVT", "💡 Philosophie"])
            .map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 text-sm font-mono text-text-muted">
                <strong className="text-text">{item}</strong>
                <span className="text-text-muted">·</span>
              </span>
            ))}
        </div>
      </div>

      {/* Features Bento Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Tout ce dont tu as besoin<br />pour <span className="text-gradient-teal">réussir</span>
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Une plateforme complète pensée pour les candidats malagasy — du CEPE au concours FP.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Large card */}
          <div className="md:col-span-2 md:row-span-2 rounded-2xl border border-border bg-bg2 p-8 hover:border-border-2 transition-all relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal text-xs font-mono mb-6">
                Catalogue
              </div>
              <h3 className="text-3xl font-bold mb-4">
                Tous les sujets nationaux,<br />en un seul endroit
              </h3>
              <p className="text-text-muted leading-relaxed mb-6">
                BAC · BEPC · CEPE · Concours FP — tous les sujets officiels depuis 2015, organisés et consultables en secondes.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Mathématiques", "Physique", "Français", "SVT", "Histoire", "+20 matières"].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-bg3 border border-border text-xs text-text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* IA Correction */}
          <div className="rounded-2xl border border-border bg-gradient-to-br from-teal/5 to-bg2 p-6 hover:border-teal/30 transition-all">
            <Brain className="w-10 h-10 text-teal mb-4" />
            <h3 className="text-xl font-bold mb-2">Corrections IA</h3>
            <p className="text-sm text-text-muted">
              L'IA analyse tes réponses et te donne des explications détaillées. Instantané et illimité.
            </p>
          </div>

          {/* Examens blancs */}
          <div className="rounded-2xl border border-border bg-gradient-to-br from-gold/5 to-bg2 p-6 hover:border-gold/30 transition-all">
            <Zap className="w-10 h-10 text-gold mb-4" />
            <h3 className="text-xl font-bold mb-2">Examens blancs</h3>
            <p className="text-sm text-text-muted">
              Simule les conditions réelles d'examen avec timer et correction automatique.
            </p>
          </div>

          {/* Professeurs */}
          <div className="md:col-span-2 rounded-2xl border border-border bg-bg2 p-6 hover:border-border-2 transition-all">
            <Users className="w-10 h-10 text-rose mb-4" />
            <h3 className="text-2xl font-bold mb-2">Corrections professeurs</h3>
            <p className="text-text-muted">
              Pour les sujets les plus importants, obtiens des corrections rédigées par des enseignants certifiés et validées.
            </p>
          </div>

          {/* Download PDF */}
          <div className="rounded-2xl border border-border bg-bg2 p-6 hover:border-border-2 transition-all">
            <BookOpen className="w-10 h-10 text-blue mb-4" />
            <h3 className="text-xl font-bold mb-2">PDF de qualité</h3>
            <p className="text-sm text-text-muted">
              Télécharge et imprime les sujets en haute résolution.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-bg2/30 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
            Comment ça <span className="text-gradient-teal">marche ?</span>
          </h2>

          <div className="space-y-12">
            {[
              {
                step: "1",
                icon: Sparkles,
                title: "Inscris-toi gratuitement",
                description: "Crée ton compte en 2 minutes. 10 crédits offerts pour explorer sans payer.",
              },
              {
                step: "2",
                icon: BookOpen,
                title: "Choisis tes sujets",
                description: "Parcours le catalogue, filtre par matière, série, année. Aperçu gratuit avant achat.",
              },
              {
                step: "3",
                icon: Brain,
                title: "Révise avec l'IA",
                description: "Corrections instantanées, aide progressive, examens blancs chronométrés.",
              },
              {
                step: "4",
                icon: Award,
                title: "Réussis ton examen !",
                description: "Prépare-toi comme jamais et décroche ton BAC, BEPC ou concours avec mention.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-teal/10 border-2 border-teal flex items-center justify-center font-bold text-teal text-xl">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <item.icon className="w-6 h-6 text-teal" />
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                  </div>
                  <p className="text-text-muted leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials (placeholder) */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-12">
          Ce que disent les <span className="text-gradient-teal">étudiants</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Anjara R.",
              role: "Terminale C, Antananarivo",
              quote: "Grâce à Mah.AI, j'ai pu réviser tous les sujets de maths des 5 dernières années. Les corrections IA m'ont vraiment aidé à comprendre mes erreurs.",
            },
            {
              name: "Miora T.",
              role: "BEPC, Antsirabe",
              quote: "Avant Mah.AI, je devais chercher les sujets partout sur Facebook. Maintenant tout est centralisé et les prix sont honnêtes.",
            },
            {
              name: "Hery M.",
              role: "Concours ENAM",
              quote: "Les examens blancs m'ont permis de m'entraîner en conditions réelles. J'ai réussi le concours avec 15/20 !",
            },
          ].map((testimonial, i) => (
            <div key={i} className="rounded-xl border border-border bg-bg2 p-6">
              <p className="text-text-muted leading-relaxed mb-4 italic">
                "{testimonial.quote}"
              </p>
              <div>
                <div className="font-semibold text-text">{testimonial.name}</div>
                <div className="text-sm text-text-muted">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="rounded-2xl bg-gradient-to-br from-bg2 to-bg3 border border-border p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal/10 to-transparent opacity-50" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Prêt à décrocher ton<br />
              <span className="text-gradient-teal">BAC avec mention ?</span>
            </h2>
            <p className="text-text-muted text-lg mb-8">
              Rejoins les étudiants malgaches qui préparent leurs examens intelligemment.
              <br />
              <strong className="text-text">10 crédits offerts dès l'inscription.</strong>
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal text-bg font-semibold rounded-xl hover:bg-teal-600 transition-all shadow-xl shadow-teal/30"
            >
              <Sparkles className="w-5 h-5" />
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
