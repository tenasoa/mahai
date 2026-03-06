import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Politique de Confidentialité | Mah.AI",
  description: "Comment nous protégeons et gérons vos données",
}

export default function PrivacyPage() {
  return (
    <article className="prose prose-invert prose-teal max-w-none">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted hover:text-teal transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour à l'accueil
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Politique de Confidentialité</h1>
        <p className="text-muted font-mono text-sm">Dernière mise à jour : 07 Mars 2026</p>
      </div>

      <div className="space-y-8 text-text/90">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Qui sommes-nous ?</h2>
          <p>
            Mah.AI est une plateforme SaaS éducative destinée au marché malgache. 
            Nous sommes responsables du traitement de vos données personnelles collectées via notre service.
          </p>
          <p className="mt-2 text-sm text-muted">Contact Données : privacy@mah.ai (factice pour le MVP)</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Quelles données collectons-nous ?</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Compte</strong> : nom, email, photo de profil (géré sécuritairement par Clerk).</li>
            <li><strong>Paiement</strong> : Numéros de téléphone liés aux paiements mobiles (ex: MVola, Orange Money) et captures d'écran servant de preuve de paiement.</li>
            <li><strong>Utilisation</strong> : données de navigation anonymisées pour améliorer nos services.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Pourquoi traitons-nous vos données ?</h2>
          <p>Nous utilisons vos données strictement pour :</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Vous fournir un accès au catalogue de sujets et aux corrections IA.</li>
            <li>Valider vos transactions et vous créditer.</li>
            <li>Sécuriser la plateforme contre la fraude.</li>
            <li>Améliorer l'expérience utilisateur et résoudre les bugs.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Qui a accès à vos données ?</h2>
          <p>Vos données sont confidentielles. Nous faisons uniquement appel à des sous-traitants reconnus et sécurisés :</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Clerk</strong> (Auth) - Hébergement sécurisé des comptes.</li>
            <li><strong>Supabase</strong> (Database) - Stockage des données d'achats et logs.</li>
            <li><strong>Vercel</strong> (Hébergement et Fichiers) - Hébergement de l'application et des uploads.</li>
          </ul>
          <p className="font-medium text-teal mt-4">Nous ne revendons JAMAIS vos données à des tiers.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. Sécurité</h2>
          <p>
            Mah.AI s'engage à protéger vos informations. Nos communications sont chiffrées (HTTPS), 
            l'authentification respecte les standards de l'industrie, et l'accès à la base de données est restreint.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. Vos Droits</h2>
          <p>
            Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. 
            Vous pouvez à tout moment demander la suppression complète de votre compte.
          </p>
        </section>
      </div>
    </article>
  )
}
