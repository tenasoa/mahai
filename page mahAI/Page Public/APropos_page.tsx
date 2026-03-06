import type { Metadata } from "next";
import Link from "next/link";
import { Target, Heart, Users, Lightbulb, TrendingUp, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos — Notre mission pour l'éducation malgache",
  description:
    "Découvre l'histoire de Mah.AI, notre mission et notre vision pour révolutionner l'éducation à Madagascar grâce à l'intelligence artificielle.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/10 border border-teal/20 text-teal text-sm font-mono mb-6">
            🇲🇬 Made in Madagascar
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Notre mission :{" "}
            <span className="text-gradient-teal">démocratiser</span>
            <br />
            l'accès à une éducation de qualité
          </h1>
          <p className="text-lg md:text-xl text-text-muted leading-relaxed">
            Madagascar compte{" "}
            <strong className="text-text">
              des centaines de milliers de candidats aux examens nationaux
            </strong>{" "}
            chaque année. Pourtant, aucune plateforme numérique centralisée
            n'existe pour les aider à réviser efficacement.{" "}
            <strong className="text-text">
              Mah.AI est la solution que le pays attendait.
            </strong>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { num: "200+", label: "Sujets disponibles", color: "teal" },
            { num: "10K+", label: "Étudiants cibles", color: "green" },
            { num: "87%", label: "Taux de réussite visé", color: "gold" },
            { num: "0 Ar", label: "Pour commencer", color: "rose" },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-bg2 p-6 text-center hover:border-border-2 transition-all"
            >
              <div className={`text-3xl font-bold text-${stat.color} mb-1`}>
                {stat.num}
              </div>
              <div className="text-xs font-mono text-text-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="border-y border-border bg-bg2/30 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-green p-0.5">
                  <div className="w-full h-full bg-bg2 rounded-[10px] flex items-center justify-center">
                    <Target className="w-6 h-6 text-teal" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">Notre Mission</h2>
              </div>
              <p className="text-text-muted leading-relaxed mb-4">
                <strong className="text-text">
                  Centraliser tous les sujets d'examens malgaches
                </strong>{" "}
                en un seul endroit, facilement accessibles depuis n'importe
                quel téléphone ou ordinateur.
              </p>
              <p className="text-text-muted leading-relaxed">
                Offrir des{" "}
                <strong className="text-text">
                  corrections intelligentes par IA et des professeurs certifiés
                </strong>
                , simuler des conditions d'examen réelles, et donner à chaque
                étudiant malgache les moyens de réussir — peu importe sa
                localisation ou ses ressources.
              </p>
            </div>

            {/* Vision */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-orange-400 p-0.5">
                  <div className="w-full h-full bg-bg2 rounded-[10px] flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-gold" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">Notre Vision</h2>
              </div>
              <p className="text-text-muted leading-relaxed mb-4">
                Devenir{" "}
                <strong className="text-text">
                  la référence éducative nationale
                </strong>{" "}
                — la plateforme que chaque étudiant malgache connaît et
                utilise, du CEPE au concours de la fonction publique.
              </p>
              <p className="text-text-muted leading-relaxed">
                Construire un modèle économique vertueux où{" "}
                <strong className="text-text">
                  ceux qui créent la valeur (contributeurs, vérificateurs,
                  professeurs) sont rémunérés équitablement
                </strong>
                , tout en gardant nos tarifs accessibles pour les étudiants.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Les valeurs qui nous guident
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Heart,
              title: "Accessible",
              description:
                "Nous croyons que l'éducation est un droit, pas un privilège. Nos tarifs sont pensés pour être abordables, et nous offrons 10 crédits gratuits à chaque nouvel inscrit.",
              color: "rose",
            },
            {
              icon: Users,
              title: "Collaboratif",
              description:
                "Mah.AI est une plateforme communautaire. Les contributeurs, vérificateurs et professeurs sont au cœur du projet — rémunérés équitablement pour leur travail.",
              color: "teal",
            },
            {
              icon: TrendingUp,
              title: "Innovant",
              description:
                "Nous utilisons l'IA pour rendre l'apprentissage plus efficace : corrections instantanées, examens blancs personnalisés, plans de révision adaptatifs.",
              color: "gold",
            },
            {
              icon: Shield,
              title: "Fiable",
              description:
                "Chaque sujet est vérifié par notre équipe avant publication. Les paiements Mobile Money sont 100% sécurisés. Nos données sont protégées.",
              color: "blue",
            },
            {
              icon: Target,
              title: "Malgache",
              description:
                "Conçu à Madagascar, pour Madagascar. Nous comprenons les défis locaux : réseaux mobiles variables, paiements Mobile Money, examens spécifiques au pays.",
              color: "green",
            },
            {
              icon: Lightbulb,
              title: "Transparent",
              description:
                "Tarifs clairs, pas de frais cachés. Les contributeurs voient leurs revenus en temps réel. Les étudiants savent exactement ce qu'ils paient.",
              color: "purple",
            },
          ].map((value, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-bg2 p-6 hover:border-border-2 transition-all"
            >
              <value.icon className={`w-8 h-8 text-${value.color} mb-4`} />
              <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="border-t border-border bg-bg2/30 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comment ça marche ?
          </h2>

          <div className="space-y-12">
            {[
              {
                step: "1",
                title: "Inscris-toi gratuitement",
                description:
                  "Crée ton compte en 2 minutes. 10 crédits offerts pour explorer la plateforme sans sortir un Ariary.",
              },
              {
                step: "2",
                title: "Explore le catalogue",
                description:
                  "Parcours notre catalogue de sujets : BAC, BEPC, CEPE, concours fonction publique. Filtre par matière, série, année.",
              },
              {
                step: "3",
                title: "Achète des crédits",
                description:
                  "Choisis le pack qui te convient (5K, 20K ou 50K Ar). Paie en toute sécurité via MVola, Orange Money ou Airtel Money.",
              },
              {
                step: "4",
                title: "Révise intelligemment",
                description:
                  "Consulte les sujets, obtiens des corrections IA instantanées, pose des questions aux professeurs, passe des examens blancs.",
              },
              {
                step: "5",
                title: "Réussis tes examens !",
                description:
                  "Avec une préparation structurée et des ressources de qualité, tu augmentes significativement tes chances de réussite.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-teal/10 border-2 border-teal flex items-center justify-center font-bold text-teal">
                    {item.step}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="rounded-2xl bg-gradient-to-br from-bg2 to-bg3 border border-border p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal/10 to-transparent opacity-50" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à rejoindre la révolution <span className="text-gradient-teal">EdTech malgache ?</span>
            </h2>
            <p className="text-text-muted text-lg mb-8">
              Inscris-toi maintenant et reçois <strong className="text-text">10 crédits gratuits</strong> pour commencer.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal text-bg font-semibold rounded-xl hover:bg-teal-600 transition-all shadow-xl shadow-teal/30"
            >
              Commencer gratuitement →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
