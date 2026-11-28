import { SvgOptique } from "~/components/document/SvgOptique";
import { OPTIQUE_DEFAUT, normaliserOptique } from "~/lib/document/optique";
import { noeudDessin } from "./histoire";

/** Banc d'optique (physique), modifié dans `DialogueOptique`. */
export const OptiqueSujet = noeudDessin({
  nom: "optique",
  titre: "Optique",
  libelle: "le schéma d'optique",
  classe: "figure-optique",
  defaut: OPTIQUE_DEFAUT,
  dessin: (attrs) => <SvgOptique o={normaliserOptique(attrs)} />,
});
