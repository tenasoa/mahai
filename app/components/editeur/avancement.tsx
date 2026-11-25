import { TableauAvancement } from "~/components/document/TableauAvancement";
import { AVANCEMENT_DEFAUT, normaliserAvancement } from "~/lib/document/avancement";
import { noeudDessin } from "./histoire";

/** Tableau d'avancement (chimie), modifié dans `DialogueAvancement`. */
export const AvancementSujet = noeudDessin({
  nom: "avancement",
  titre: "Tableau d'avancement",
  libelle: "le tableau",
  classe: "tableau",
  defaut: AVANCEMENT_DEFAUT,
  dessin: (attrs) => <TableauAvancement t={normaliserAvancement(attrs)} />,
});
