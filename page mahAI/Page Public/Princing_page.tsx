import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles, Zap, Crown } from "lucide-react";

export const metadata: Metadata = {
  title: "Tarifs — Packs de crédits pour réviser",
  description:
    "Choisis le pack de crédits qui correspond à tes besoins. De 5 000 Ar à 50 000 Ar. Paiement Mobile Money (MVola, Orange Money, Airtel Money).",
};

const pricingPlans = [
  {
    id: "starter",
    name: "Pack Découverte",
    price: 5000,
    credits: 10,
    icon: Sparkles,
    color: "text",
    gradient: "from-text-muted to-text",
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
    price: 20000,
    credits: 50,
    icon: Zap,
    color: "teal",
    gradient: "from-teal to-green",
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
    price: 50000,
    credits: 150,
    icon: Crown,
    color: "gold",
    gradient: "from-gold to-orange-400",
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
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Des tarifs{" "}
            <span className="text-gradient-teal">transparents</span>
            <br />
            adaptés à ton budget
          </h1>
          <p className="text-lg md:text-xl text-text-muted leading-relaxed">
            Choisis le pack de crédits qui correspond à tes besoins.{" "}
            <strong className="text-text">
              Paiement 100% sécurisé via Mobile Money
            </strong>{" "}
            (MVola, Orange Money, Airtel Money).
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border bg-bg2 p-8 ${
                plan.popular
                  ? "border-teal shadow-2xl shadow-teal/20 transform md:scale-105"
                  : "border-border"
              } transition-all duration-300 hover:border-border-2 hover:shadow-xl`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Badge populaire */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-teal text-bg text-xs font-bold rounded-full shadow-lg">
                  {plan.badge}
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} p-0.5 mb-6`}
              >
                <div className="w-full h-full bg-bg2 rounded-[10px] flex items-center justify-center">
                  <plan.icon className={`w-6 h-6 text-${plan.color}`} />
                </div>
              </div>

              {/* Header */}
              <div className="mb-6">
                <h3 className="text-sm font-mono text-text-muted mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight">
                    {(plan.price / 1000).toLocaleString("fr-MG")}K
                  </span>
                  <span className="text-text-muted font-mono text-sm">Ar</span>
                </div>
                <p className="text-sm text-text-muted mt-2 font-mono">
                  {plan.credits} crédits
                </p>
              </div>

              {/* CTA Button */}
              <Link
                href="/sign-up"
                className={`w-full block text-center py-3 px-4 rounded-xl font-semibold transition-all mb-8 ${
                  plan.popular
                    ? "bg-teal text-bg hover:bg-teal-600 shadow-lg shadow-teal/30"
                    : "bg-bg3 text-text hover:bg-bg3/80 border border-border"
                }`}
              >
                {plan.cta}
              </Link>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                    <span className="text-text-muted">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Info note */}
        <div className="text-center mt-12 text-sm text-text-muted font-mono">
          💡 <strong className="text-text">Établissements scolaires :</strong>{" "}
          Tarif groupé disponible →{" "}
          <Link href="/contact" className="text-teal hover:underline">
            Nous contacter
          </Link>
        </div>
      </section>

      {/* FAQ Pricing Section */}
      <section className="border-t border-border bg-bg2/30 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Questions fréquentes sur les tarifs
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                💳 Comment puis-je payer ?
              </h3>
              <p className="text-text-muted leading-relaxed">
                Nous acceptons tous les modes de paiement Mobile Money de
                Madagascar : <strong>MVola</strong>,{" "}
                <strong>Orange Money</strong> et{" "}
                <strong>Airtel Money</strong>. Le processus est 100% sécurisé
                et instantané.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                ⏱️ Les crédits expirent-ils ?
              </h3>
              <p className="text-text-muted leading-relaxed">
                Oui, chaque pack a une durée de validité (30, 60 ou 90 jours
                selon le pack). Passé ce délai, les crédits non utilisés
                expirent. Pense à planifier tes révisions !
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                🎓 Y a-t-il des réductions pour les étudiants ?
              </h3>
              <p className="text-text-muted leading-relaxed">
                Oui ! Si tu es inscrit dans un établissement partenaire, tu
                bénéficies automatiquement d'une réduction de 20% sur tous les
                packs. Vérifie auprès de ton lycée ou université.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                🔄 Puis-je obtenir un remboursement ?
              </h3>
              <p className="text-text-muted leading-relaxed">
                Les crédits achetés ne sont pas remboursables. Cependant, si tu
                rencontres un problème technique, notre équipe est là pour
                t'aider — contacte-nous à support@mah-ai.mg.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                🏫 Et pour les établissements scolaires ?
              </h3>
              <p className="text-text-muted leading-relaxed">
                Nous proposons des licences groupées pour les lycées et
                universités avec des tarifs préférentiels. Contactez-nous pour
                un devis personnalisé sur etablissements@mah-ai.mg.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="rounded-2xl bg-gradient-to-br from-bg2 to-bg3 border border-border p-12 relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal/10 to-transparent opacity-50" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à décrocher ton{" "}
              <span className="text-gradient-teal">BAC avec mention ?</span>
            </h2>
            <p className="text-text-muted text-lg mb-8">
              Rejoins les étudiants malgaches qui préparent leurs examens
              intelligemment.
              <br />
              <strong className="text-text">
                10 crédits offerts dès l'inscription.
              </strong>
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
