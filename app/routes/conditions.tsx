import { Link } from "react-router";

import type { Route } from "./+types/conditions";
import { PageTexte } from "~/components/ui/PageTexte";
import { SITE } from "~/lib/site";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Conditions d'utilisation — Mah.ai" },
    {
      name: "description",
      content: "Les règles pour utiliser Mah.ai.",
    },
  ];
}

export default function Conditions() {
  return (
    <PageTexte titre="Conditions d'utilisation" maj={SITE.majLegale}>
      <p>
        En créant un compte ou en utilisant Mah.ai, tu acceptes ces
        conditions. Elles sont courtes : lis-les.
      </p>

      <h2>Le service</h2>
      <p>
        Mah.ai propose des sujets d'examens, des corrigés et des outils pour
        réviser. Le site est en phase de lancement : des fonctions arrivent
        progressivement et le service peut être interrompu ou modifié.
      </p>

      <h2>Ton compte</h2>
      <ul>
        <li>Donne des informations exactes et garde ton mot de passe pour toi.</li>
        <li>Un compte par personne.</li>
        <li>
          Tu es responsable de ce qui est fait avec ton compte. Si tu penses
          qu'il a été utilisé par quelqu'un d'autre, préviens-nous.
        </li>
      </ul>

      <h2>Ce qui est interdit</h2>
      <ul>
        <li>Copier ou revendre en masse les sujets et corrigés de Mah.ai.</li>
        <li>Publier des contenus illégaux, haineux ou qui ne t'appartiennent pas.</li>
        <li>Essayer de contourner la sécurité ou de perturber le service.</li>
      </ul>
      <p>
        En cas d'abus, on peut suspendre ou supprimer le compte concerné.
      </p>

      <h2>Les contenus</h2>
      <p>
        Les corrigés et explications sont faits avec soin, mais peuvent
        contenir des erreurs : ils t'aident à réviser, ils ne remplacent pas
        tes professeurs. Si tu repères une erreur, signale-la.
      </p>

      <h2>Paiements</h2>
      <p>
        Aucune fonction payante n'est encore ouverte. Avant leur lancement, ces
        conditions seront complétées (prix, remboursements) et tu en seras
        prévenu.
      </p>

      <h2>Tes données</h2>
      <p>
        Tout est expliqué dans les{" "}
        <Link to="/confidentialite">règles de confidentialité</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        Une question ? Écris à{" "}
        <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>.
      </p>
    </PageTexte>
  );
}
