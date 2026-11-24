import { Link } from "react-router";

import type { Route } from "./+types/confidentialite";
import { PageTexte } from "~/components/ui/PageTexte";
import { SITE } from "~/lib/site";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Règles de confidentialité — Mah.ai" },
    {
      name: "description",
      content: "Quelles données Mah.ai collecte, pourquoi, et comment les supprimer.",
    },
  ];
}

export default function Confidentialite() {
  return (
    <PageTexte titre="Règles de confidentialité" maj={SITE.majLegale}>
      <p>
        Mah.ai t'aide à réviser tes examens. Pour ça, on garde le minimum de
        données sur toi, on ne les vend à personne et on n'affiche pas de
        publicité.
      </p>

      <h2>Ce qu'on collecte</h2>
      <ul>
        <li>
          <strong>Ton compte</strong> : ton prénom et ton email. Ton mot de
          passe n'est jamais stocké en clair : seule une empreinte chiffrée
          (impossible à relire) est gardée.
        </li>
        <li>
          <strong>Si tu te connectes avec Google</strong> : ton nom, ton email et
          ta photo de profil, transmis par Google avec ton accord. On ne reçoit
          ni ton mot de passe Google, ni tes contacts, ni tes fichiers.
        </li>
        <li>
          <strong>Tes sessions</strong> : l'adresse IP et le type de navigateur
          utilisés pour te connecter, pour protéger ton compte (détecter une
          connexion suspecte, limiter les tentatives).
        </li>
        <li>
          <strong>Ta progression</strong> (quand ces fonctions ouvriront) : tes
          réponses, ta série et tes points, pour te montrer où tu en es.
        </li>
      </ul>

      <h2>Pourquoi</h2>
      <p>
        Uniquement pour faire fonctionner Mah.ai : te connecter, garder ta
        progression sur tous tes appareils et sécuriser ton compte. Aucune
        donnée n'est utilisée pour de la publicité ou revendue.
      </p>

      <h2>Cookies</h2>
      <p>
        Un seul type de cookie : celui qui te garde connecté (30 jours au
        maximum). Pas de cookie publicitaire ni de pistage.
      </p>

      <h2>Où sont tes données</h2>
      <p>
        Mah.ai est hébergé par Cloudflare. Les données sont stockées dans ses
        centres de données, qui peuvent se trouver hors de Madagascar
        (notamment en Europe).
      </p>

      <h2>Combien de temps</h2>
      <p>
        Tant que ton compte existe. Les sessions expirent après 30 jours sans
        utilisation. Ton compte peut être supprimé sur simple demande (voir
        ci-dessous) : tes données sont alors effacées.
      </p>

      <h2>Tes droits</h2>
      <p>
        Tu peux demander à voir, corriger ou supprimer tes données à tout
        moment. Écris à <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>{" "}
        depuis l'email de ton compte ; on répond sous 30 jours.
      </p>
      <p>
        Si tu as moins de 18 ans, parles-en avec un parent ou un adulte
        responsable avant de créer ton compte.
      </p>

      <h2>Changements</h2>
      <p>
        Si ces règles changent (par exemple à l'ouverture des paiements), la
        date en haut de la page sera mise à jour et on te préviendra dans
        l'application.
      </p>

      <p className="pt-2 text-sm">
        Voir aussi les <Link to="/conditions">conditions d'utilisation</Link>.
      </p>
    </PageTexte>
  );
}
