import { ArbreProbabilites } from "~/components/document/ArbreProbabilites";
import { PROBA_DEFAUT, normaliserProba } from "~/lib/document/probabilites";
import { noeudDessin } from "./histoire";

/** Arbre de probabilités (maths), modifié dans `DialogueProba`. */
export const ProbabilitesSujet = noeudDessin({
  nom: "probabilites",
  titre: "Arbre de probabilités",
  libelle: "l'arbre",
  classe: "figure-proba",
  defaut: PROBA_DEFAUT,
  dessin: (attrs) => <ArbreProbabilites a={normaliserProba(attrs)} />,
});
