"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Note: metadata doit être exportée depuis un Server Component parent
// Cette page est "use client" pour l'accordéon interactif

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
        a: "Mah.AI s'adresse aux lycéens préparant le BAC ou le BEPC, aux élèves de primaire (CEPE), aux étudiants universitaires (L1/L2), et aux candidats aux concours de la fonction publique (ENAM, Police, Gendarmerie, etc.).",
      },
      {
        q: "Combien coûte Mah.AI ?",
        a: "L'inscription est 100% gratuite avec 10 crédits offerts. Ensuite, vous pouvez acheter des packs de crédits : Pack Découverte (5 000 Ar), Pack Révisions (20 000 Ar), Pack Champion (50 000 Ar).",
      },
      {
        q: "Puis-je utiliser Mah.AI depuis mon téléphone ?",
        a: "Oui, absolument ! Mah.AI est optimisé pour les téléphones mobiles et fonctionne sur tous les navigateurs (Chrome, Firefox, Safari). Nous avons aussi une version PWA installable.",
      },
    ],
  },
  {
    category: "Comptes et crédits",
    icon: "💳",
    questions: [
      {
        q: "Comment obtenir mes 10 crédits gratuits ?",
        a: "Il suffit de créer un compte sur Mah.AI. Les 10 crédits sont automatiquement crédités sur votre compte dès l'inscription validée. Aucune carte bancaire requise.",
      },
      {
        q: "À quoi servent les crédits ?",
        a: "Les crédits permettent d'accéder aux sujets complets, de débloquer des corrections détaillées, de poser des questions aux professeurs, et de passer des examens blancs.",
      },
      {
        q: "Combien de crédits coûte un sujet ?",
        a: "Cela dépend du type de sujet : CEPE (1 crédit), BEPC (1-2 crédits), BAC (2-3 crédits selon la matière). Vous voyez le prix exact avant chaque achat.",
      },
      {
        q: "Les crédits expirent-ils ?",
        a: "Oui, chaque pack a une durée de validité : 30 jours (Pack Découverte), 60 jours (Pack Révisions), 90 jours (Pack Champion). Planifiez vos révisions en conséquence !",
      },
      {
        q: "Puis-je partager mon compte avec un ami ?",
        a: "Non, le partage de compte est strictement interdit et peut entraîner la suspension de votre compte. Chaque utilisateur doit avoir son propre compte.",
      },
    ],
  },
  {
    category: "Paiements",
    icon: "💰",
    questions: [
      {
        q: "Comment puis-je payer ?",
        a: "Nous acceptons tous les modes de paiement Mobile Money de Madagascar : MVola, Orange Money et Airtel Money. Le processus est simple, rapide et 100% sécurisé.",
      },
      {
        q: "Le paiement Mobile Money est-il sécurisé ?",
        a: "Oui, absolument. Nous utilisons les API officielles de MVola, Orange Money et Airtel Money. Vos informations de paiement sont chiffrées et jamais stockées sur nos serveurs.",
      },
      {
        q: "Puis-je payer par carte bancaire ?",
        a: "Actuellement, nous n'acceptons que le Mobile Money. Nous travaillons sur l'intégration des cartes Visa/Mastercard pour la diaspora malgache à l'étranger.",
      },
      {
        q: "Puis-je obtenir un remboursement ?",
        a: "Les crédits achetés ne sont pas remboursables, sauf en cas de dysfonctionnement technique grave de notre part. Contactez support@mah-ai.mg pour toute réclamation.",
      },
      {
        q: "Y a-t-il des frais cachés ?",
        a: "Non, aucun frais caché. Le prix affiché est le prix final que vous payez. Transparence totale.",
      },
    ],
  },
  {
    category: "Sujets et corrections",
    icon: "📚",
    questions: [
      {
        q: "Combien de sujets sont disponibles ?",
        a: "Nous avons actuellement plus de 200 sujets couvrant le CEPE, BEPC, BAC (toutes séries), et les principaux concours de la fonction publique. Nous ajoutons régulièrement de nouveaux sujets.",
      },
      {
        q: "Les sujets sont-ils officiels ?",
        a: "Oui, tous nos sujets sont des sujets officiels des examens nationaux malgaches. Chaque sujet est vérifié par notre équipe avant publication.",
      },
      {
        q: "Quelle est la différence entre correction IA et correction professeur ?",
        a: "La correction IA est instantanée et gratuite avec vos crédits. La correction professeur est rédigée par un enseignant certifié et validée — plus détaillée et pédagogique.",
      },
      {
        q: "Puis-je télécharger les sujets en PDF ?",
        a: "Oui, une fois un sujet acheté, vous pouvez le télécharger en PDF de haute qualité pour l'imprimer ou le consulter hors ligne.",
      },
      {
        q: "Comment fonctionne l'examen blanc ?",
        a: "L'examen blanc simule les conditions réelles : timer configuré selon la durée officielle, sujets aléatoires ou personnalisés, correction automatique à la fin. Vous obtenez un score et un rapport détaillé.",
      },
    ],
  },
  {
    category: "Technique",
    icon: "⚙️",
    questions: [
      {
        q: "Quelle connexion internet est nécessaire ?",
        a: "Mah.AI fonctionne même avec une connexion 3G. Nous avons optimisé la plateforme pour les réseaux mobiles malgaches. Certaines fonctionnalités (comme les PDF) sont disponibles hors ligne après téléchargement.",
      },
      {
        q: "Je ne reçois pas l'email de confirmation d'inscription",
        a: "Vérifiez votre dossier spam/courrier indésirable. Si le problème persiste, contactez support@mah-ai.mg avec votre adresse email.",
      },
      {
        q: "Le site ne s'affiche pas correctement sur mon téléphone",
        a: "Essayez de vider le cache de votre navigateur ou d'utiliser un navigateur à jour (Chrome, Firefox). Si le problème persiste, contactez-nous.",
      },
      {
        q: "Puis-je utiliser Mah.AI hors ligne ?",
        a: "Partiellement. Une fois les sujets téléchargés en PDF, vous pouvez les consulter hors ligne. Les corrections IA et examens blancs nécessitent une connexion internet.",
      },
    ],
  },
  {
    category: "Devenir contributeur",
    icon: "✍️",
    questions: [
      {
        q: "Comment puis-je devenir contributeur ?",
        a: "Inscrivez-vous normalement, puis demandez le rôle 'Contributeur' dans votre profil. Nous vous contacterons pour valider votre candidature et vous former à notre éditeur.",
      },
      {
        q: "Combien gagne un contributeur ?",
        a: "Vous gagnez un pourcentage (15-35%) sur chaque accès au sujet que vous avez saisi. Plus votre sujet est consulté, plus vous gagnez. Paiements mensuels automatiques.",
      },
      {
        q: "Quel matériel faut-il pour contribuer ?",
        a: "Un ordinateur ou une tablette avec connexion internet. Nous fournissons un éditeur en ligne puissant (formules mathématiques, tableaux, images).",
      },
      {
        q: "Dois-je être professeur pour contribuer ?",
        a: "Non, tout étudiant ou passionné peut contribuer en saisissant des sujets. Les corrections professeurs nécessitent une certification pédagogique.",
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-start justify-between gap-4 text-left hover:text-teal transition-colors group"
      >
        <span className="font-medium text-text group-hover:text-teal transition-colors">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-text-muted flex-shrink-0 transition-transform mt-0.5",
            isOpen && "rotate-180 text-teal"
          )}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-96 pb-5" : "max-h-0"
        )}
      >
        <p className="text-text-muted leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Questions <span className="text-gradient-teal">fréquentes</span>
        </h1>
        <p className="text-lg text-text-muted max-w-2xl mx-auto">
          Toutes les réponses aux questions que tu te poses sur Mah.AI. Si tu
          ne trouves pas ta réponse, contacte-nous à{" "}
          <a href="mailto:support@mah-ai.mg" className="text-teal hover:underline">
            support@mah-ai.mg
          </a>
        </p>
      </section>

      {/* FAQ Categories */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="space-y-12">
          {faqCategories.map((category, idx) => (
            <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{category.icon}</span>
                <h2 className="text-2xl font-bold">{category.category}</h2>
              </div>

              <div className="rounded-xl border border-border bg-bg2 overflow-hidden">
                {category.questions.map((item, i) => (
                  <FAQItem key={i} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="border-t border-border bg-bg2/30 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Tu as encore des questions ?
          </h2>
          <p className="text-text-muted mb-8">
            Notre équipe est là pour t'aider. Nous répondons généralement en
            moins de 24h.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:support@mah-ai.mg"
              className="px-6 py-3 bg-teal text-bg font-semibold rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-teal/20"
            >
              📧 Envoyer un email
            </a>
            <a
              href="https://wa.me/261XXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green text-bg font-semibold rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green/20"
            >
              💬 WhatsApp
            </a>
            <Link
              href="/contact"
              className="px-6 py-3 border border-border bg-bg2 text-text font-medium rounded-xl hover:border-border-2 transition-all"
            >
              Formulaire de contact
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
