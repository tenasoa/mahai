import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation | Mah.AI",
  description: "Conditions d'utilisation de la plateforme Mah.AI",
}

export default function TermsPage() {
  return (
    <article className="prose prose-invert prose-teal max-w-none">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted hover:text-teal transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour à l'accueil
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Conditions Générales d'Utilisation (CGU)</h1>
        <p className="text-muted font-mono text-sm">Version : 1.0 — En vigueur depuis le 07 Mars 2026</p>
      </div>

      <div className="space-y-8 text-text/90">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Article 1 — Objet et acceptation</h2>
          <p>
            Les présentes CGU régissent l'accès et l'utilisation du service Mah.AI (le "Service"). 
            L'utilisation du Service implique l'acceptation pleine et entière des présentes CGU.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Article 2 — Description du Service</h2>
          <p>
            Mah.AI est une plateforme éducative SaaS permettant d'accéder à un vaste catalogue de sujets 
            d'examens (CEPE, BEPC, BAC, Concours) et de bénéficier de corrections générées par Intelligence Artificielle.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Article 3 — Inscription et compte</h2>
          <ul className="list-decimal pl-5 space-y-2">
            <li>Pour utiliser le Service, vous devez créer un compte avec une adresse email valide ou via un compte social.</li>
            <li>Vous êtes responsable de la confidentialité de vos identifiants Clerk et de toute activité effectuée sous votre compte.</li>
            <li>Vous vous engagez à fournir des informations exactes et à les maintenir à jour.</li>
            <li>L'Éditeur se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Article 4 — Achat et Crédits</h2>
          <ul className="list-decimal pl-5 space-y-2">
            <li>L'accès complet aux sujets et corrections requiert l'achat de Crédits virtuels Mah.AI.</li>
            <li>Les paiements se font manuellement via les plateformes de Mobile Money locales (MVola, Orange Money) pour le MVP.</li>
            <li>Les crédits achetés ne sont ni remboursables ni transférables, sauf motif légitime tel qu'un dysfonctionnement technique avéré de la plateforme.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Article 5 — Utilisation acceptable</h2>
          <p>Vous vous engagez à ne pas :</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Utiliser le Service à des fins illégales ou frauduleuses, ou de triche avérée.</li>
            <li>Poster des commentaires ou des contributions offensants.</li>
            <li>Revendre ou sous-licencier l'accès au catalogue ou aux crédits Mah.AI sans autorisation.</li>
            <li>Utiliser des moyens automatisés (bots, scrapers) pour extraire notre base de données.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Article 6 — Propriété intellectuelle</h2>
          <p>
            Le Service, son code source, son organisation et son interface utilisateur sont protégés par le 
            droit de la propriété intellectuelle. Vous bénéficiez d'un droit personnel, non cessible et 
            non exclusif d'utilisation de la Plateforme.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Article 7 — Responsabilité (MVP)</h2>
          <p>
            S'agissant d'un Minimum Viable Product (MVP), l'Éditeur déploie ses meilleurs efforts pour 
            maintenir la disponibilité du Service, mais ne peut en garantir la perfection absolue.
            Les corrections générées par l'IA ne remplacent pas les recommandations officielles des enseignants. 
            Mah.AI décline toute responsabilité quant à l'exactitude absolue des contenus IA fournis.
          </p>
        </section>

        <section className="text-center pt-8 border-t border-white/10 mt-12">
          <p className="text-muted text-sm">© {new Date().getFullYear()} Mah.AI. Tous droits réservés.</p>
        </section>
      </div>
    </article>
  )
}
