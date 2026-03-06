import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation (CGU)",
  description:
    "Conditions générales d'utilisation de la plateforme Mah.AI — Droits, obligations, paiements, propriété intellectuelle.",
};

export default function CGUPage() {
  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 py-20">
      <div className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">
          Conditions Générales d'Utilisation
        </h1>

        <p className="text-text-muted mb-8">
          <strong>Dernière mise à jour :</strong> 6 Mars 2026
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">1. Présentation de la plateforme</h2>
          <p className="text-text-muted leading-relaxed mb-4">
            Mah.AI est une plateforme éducative en ligne opérée par{" "}
            <strong className="text-text">Mah.AI SARL</strong>, société de droit
            malgache, dont le siège social est situé à Antananarivo, Madagascar.
          </p>
          <p className="text-text-muted leading-relaxed">
            La plateforme permet aux utilisateurs d'accéder à des sujets
            d'examens nationaux, de bénéficier de corrections par intelligence
            artificielle ou par des professeurs certifiés, et de passer des examens
            blancs en conditions réelles.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">2. Acceptation des CGU</h2>
          <p className="text-text-muted leading-relaxed mb-4">
            L'utilisation de Mah.AI implique l'acceptation pleine et entière des
            présentes Conditions Générales d'Utilisation (CGU). Si vous n'acceptez
            pas ces conditions, veuillez ne pas utiliser la plateforme.
          </p>
          <p className="text-text-muted leading-relaxed">
            Nous nous réservons le droit de modifier ces CGU à tout moment. Les
            modifications entreront en vigueur dès leur publication sur cette page.
            Il est de votre responsabilité de consulter régulièrement cette page.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">3. Inscription et compte utilisateur</h2>
          
          <h3 className="text-xl font-semibold mb-3">3.1. Création de compte</h3>
          <p className="text-text-muted leading-relaxed mb-4">
            Pour accéder à certaines fonctionnalités de la plateforme, vous devez
            créer un compte utilisateur. Vous vous engagez à fournir des
            informations exactes, complètes et à jour.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">3.2. Âge minimum</h3>
          <p className="text-text-muted leading-relaxed mb-4">
            Vous devez avoir au moins <strong className="text-text">13 ans</strong>{" "}
            pour créer un compte. Les mineurs de moins de 18 ans doivent obtenir le
            consentement de leurs parents ou tuteurs légaux.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">3.3. Sécurité du compte</h3>
          <p className="text-text-muted leading-relaxed">
            Vous êtes responsable de la confidentialité de vos identifiants de
            connexion. Toute activité effectuée depuis votre compte est présumée
            avoir été effectuée par vous. Signalez immédiatement toute utilisation
            non autorisée de votre compte à support@mah-ai.mg.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">4. Système de crédits et paiements</h2>
          
          <h3 className="text-xl font-semibold mb-3">4.1. Crédits</h3>
          <p className="text-text-muted leading-relaxed mb-4">
            L'accès aux sujets et aux services de la plateforme nécessite des
            crédits. Les crédits peuvent être achetés par packs (5 000 Ar, 20 000 Ar,
            50 000 Ar) ou offerts lors de promotions.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">4.2. Modes de paiement</h3>
          <p className="text-text-muted leading-relaxed mb-4">
            Nous acceptons les paiements via Mobile Money (MVola, Orange Money,
            Airtel Money). Tous les paiements sont traités de manière sécurisée par
            nos prestataires de paiement partenaires.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">4.3. Validité des crédits</h3>
          <ul className="list-disc list-inside text-text-muted space-y-2 mb-4">
            <li>Pack Découverte (10 crédits) : valable 30 jours</li>
            <li>Pack Révisions (50 crédits) : valable 60 jours</li>
            <li>Pack Champion (150 crédits) : valable 90 jours</li>
          </ul>
          <p className="text-text-muted leading-relaxed mb-4">
            Les crédits non utilisés à l'expiration du délai sont définitivement
            perdus.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">4.4. Politique de remboursement</h3>
          <p className="text-text-muted leading-relaxed">
            Les crédits achetés ne sont <strong className="text-text">pas
            remboursables</strong>, sauf en cas de dysfonctionnement technique grave
            imputable à Mah.AI. Toute demande de remboursement doit être adressée à
            support@mah-ai.mg dans les 7 jours suivant l'achat.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">5. Propriété intellectuelle</h2>
          
          <h3 className="text-xl font-semibold mb-3">5.1. Contenu de la plateforme</h3>
          <p className="text-text-muted leading-relaxed mb-4">
            Tous les contenus présents sur Mah.AI (sujets d'examens, corrections,
            textes, graphiques, logo, icônes, etc.) sont la propriété de Mah.AI ou
            de ses contributeurs et sont protégés par les lois sur la propriété
            intellectuelle.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">5.2. Droits des contributeurs</h3>
          <p className="text-text-muted leading-relaxed mb-4">
            Les utilisateurs qui contribuent du contenu (saisie de sujets,
            corrections) conservent les droits d'auteur sur leur travail, mais
            accordent à Mah.AI une licence non exclusive, mondiale et perpétuelle
            pour utiliser, reproduire et distribuer ce contenu.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">5.3. Utilisation autorisée</h3>
          <p className="text-text-muted leading-relaxed">
            Vous pouvez télécharger et imprimer les sujets achetés pour votre{" "}
            <strong className="text-text">usage personnel et non commercial
            uniquement</strong>. Toute reproduction, distribution, vente ou
            exploitation commerciale des contenus est strictement interdite.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">6. Utilisation acceptable</h2>
          
          <h3 className="text-xl font-semibold mb-3">6.1. Interdictions</h3>
          <p className="text-text-muted mb-4">Il est strictement interdit de :</p>
          <ul className="list-disc list-inside text-text-muted space-y-2 mb-4">
            <li>Partager votre compte avec d'autres personnes</li>
            <li>Télécharger massivement des contenus pour les revendre</li>
            <li>Contourner les systèmes de sécurité ou de paiement</li>
            <li>Utiliser des bots ou scripts automatisés</li>
            <li>Soumettre du contenu offensant, illégal ou mensonger</li>
            <li>Usurper l'identité d'une autre personne</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-3">6.2. Sanctions</h3>
          <p className="text-text-muted leading-relaxed">
            Toute violation de ces règles peut entraîner la suspension ou la
            suppression définitive de votre compte, sans remboursement des crédits
            restants.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">7. Responsabilité et garanties</h2>
          
          <h3 className="text-xl font-semibold mb-3">7.1. Corrections IA</h3>
          <p className="text-text-muted leading-relaxed mb-4">
            Les corrections générées par intelligence artificielle sont fournies à
            titre indicatif. Bien que nous nous efforcions d'assurer leur exactitude,
            nous ne pouvons garantir qu'elles soient exemptes d'erreurs. Les
            corrections validées par des professeurs sont privilégiées pour les
            contenus critiques.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">7.2. Disponibilité du service</h3>
          <p className="text-text-muted leading-relaxed mb-4">
            Nous nous efforçons de maintenir la plateforme accessible 24h/24 et
            7j/7, mais nous ne pouvons garantir une disponibilité continue. Des
            interruptions peuvent survenir pour maintenance, mises à jour ou en cas
            de force majeure.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">7.3. Limitation de responsabilité</h3>
          <p className="text-text-muted leading-relaxed">
            Mah.AI ne peut être tenu responsable de l'échec d'un utilisateur à un
            examen, même après utilisation de la plateforme. Nous fournissons des
            outils d'aide à la révision, mais le succès dépend de nombreux facteurs
            individuels.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">8. Protection des données personnelles</h2>
          <p className="text-text-muted leading-relaxed mb-4">
            Nous collectons et traitons vos données personnelles conformément à notre{" "}
            <a href="/confidentialite" className="text-teal hover:underline">
              Politique de Confidentialité
            </a>
            . Vos données ne seront jamais vendues à des tiers.
          </p>
          <p className="text-text-muted leading-relaxed">
            Vous disposez d'un droit d'accès, de modification et de suppression de
            vos données personnelles en contactant privacy@mah-ai.mg.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">9. Résiliation</h2>
          <p className="text-text-muted leading-relaxed mb-4">
            Vous pouvez supprimer votre compte à tout moment depuis les paramètres
            de votre profil. La suppression est définitive et entraîne la perte de
            tous vos crédits restants.
          </p>
          <p className="text-text-muted leading-relaxed">
            Nous nous réservons le droit de suspendre ou résilier votre compte en
            cas de violation des présentes CGU, sans préavis ni remboursement.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">10. Droit applicable et litiges</h2>
          <p className="text-text-muted leading-relaxed mb-4">
            Les présentes CGU sont régies par le droit malgache. En cas de litige,
            les tribunaux d'Antananarivo seront seuls compétents.
          </p>
          <p className="text-text-muted leading-relaxed">
            Avant toute action en justice, nous vous encourageons à nous contacter à
            legal@mah-ai.mg pour tenter de résoudre le différend à l'amiable.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">11. Contact</h2>
          <p className="text-text-muted leading-relaxed mb-4">
            Pour toute question concernant ces CGU, contactez-nous :
          </p>
          <ul className="list-none text-text-muted space-y-2">
            <li>📧 Email : legal@mah-ai.mg</li>
            <li>📞 Téléphone : +261 XX XX XXX XX</li>
            <li>📍 Adresse : Antananarivo, Madagascar</li>
          </ul>
        </section>

        <div className="mt-12 p-6 rounded-xl border border-border bg-bg2">
          <p className="text-sm text-text-muted">
            <strong className="text-text">Note importante :</strong> Ces CGU sont
            fournies à titre indicatif et doivent être revues par un avocat avant
            mise en production. Certaines clauses peuvent nécessiter des adaptations
            en fonction de la législation malgache en vigueur.
          </p>
        </div>
      </div>
    </div>
  );
}
