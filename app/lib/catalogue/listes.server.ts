/**
 * Gestion des listes du catalogue (examens, séries, matières) depuis l'admin.
 * Une entrée utilisée par un sujet (ou un examen qui a des séries) ne peut pas être supprimée :
 * les clés étrangères « restrict » de la base le garantissent.
 */
import { eq } from "drizzle-orm";

import type { Db } from "~/db/db.server";
import { COULEURS, examen, matiere, serie, type Couleur } from "~/db/schema";
import { slugifier } from "~/lib/contenu/texte";
import { IDS_OUTILS } from "~/lib/document/outils";
import { estPictogramme } from "~/lib/pictogrammes";

export type TypeListe = "examen" | "serie" | "matiere";

const TABLES = { examen, serie, matiere } as const;

const texte = (f: FormData, nom: string, max: number) => {
  const v = f.get(nom);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
};

const ordre = (f: FormData) => {
  const n = Number(f.get("ordre"));
  return Number.isInteger(n) && n >= 0 && n <= 999 ? n : 0;
};

const couleur = (f: FormData): Couleur | null => {
  const c = texte(f, "couleur", 20);
  return (COULEURS as readonly string[]).includes(c) ? (c as Couleur) : null;
};

/** Outils cochés pour une matière ; tous cochés = `null` (la matière suit les nouveaux outils). */
const outils = (f: FormData): string[] | null => {
  const choisis = IDS_OUTILS.filter((id) => f.getAll("outils").includes(id));
  return choisis.length === IDS_OUTILS.length ? null : choisis;
};

/** Pictogramme choisi ; vide ou inconnu = aucun (la tuile garde sa couleur seule). */
const icone = (f: FormData): string | null => {
  const v = texte(f, "icone", 30);
  return estPictogramme(v) ? v : null;
};

export type ResultatListe = { ok: true; message: string } | { ok: false; erreur: string };

export async function modifierListe(db: Db, f: FormData): Promise<ResultatListe> {
  const type = texte(f, "type", 10) as TypeListe;
  const intention = texte(f, "intention", 20);
  if (!(type in TABLES)) return { ok: false, erreur: "Liste inconnue." };
  const nom = texte(f, "nom", 60);
  const id = texte(f, "id", 60);

  try {
    if (intention === "ajouter") {
      if (!nom) return { ok: false, erreur: "Donne un nom." };
      if (type === "examen") {
        await db.insert(examen).values({ id: slugifier(nom), nom, ordre: ordre(f) });
      } else if (type === "serie") {
        const examenId = texte(f, "examenId", 40);
        if (!examenId) return { ok: false, erreur: "Choisis l'examen de la série." };
        await db
          .insert(serie)
          .values({ id: slugifier(`${examenId} ${nom}`), examenId, nom, ordre: ordre(f) });
      } else {
        const c = couleur(f);
        if (!c) return { ok: false, erreur: "Choisis une couleur." };
        await db
          .insert(matiere)
          .values({ id: slugifier(nom), nom, couleur: c, ordre: ordre(f), outils: outils(f), icone: icone(f) });
      }
      return { ok: true, message: `« ${nom} » ajouté.` };
    }

    if (!id) return { ok: false, erreur: "Élément introuvable." };

    if (intention === "modifier") {
      if (!nom) return { ok: false, erreur: "Le nom ne peut pas être vide." };
      if (type === "examen") {
        await db.update(examen).set({ nom, ordre: ordre(f) }).where(eq(examen.id, id));
      } else if (type === "serie") {
        await db.update(serie).set({ nom, ordre: ordre(f) }).where(eq(serie.id, id));
      } else {
        const c = couleur(f);
        if (!c) return { ok: false, erreur: "Choisis une couleur." };
        await db
          .update(matiere)
          .set({ nom, couleur: c, ordre: ordre(f), outils: outils(f), icone: icone(f) })
          .where(eq(matiere.id, id));
      }
      return { ok: true, message: "Modification enregistrée." };
    }

    if (intention === "supprimer") {
      const table = TABLES[type];
      await db.delete(table).where(eq(table.id, id));
      return { ok: true, message: "Élément supprimé." };
    }
  } catch (e) {
    // Drizzle enveloppe l'erreur de D1 : on lit aussi les causes.
    let texteErreur = "";
    for (let c: unknown = e; c; c = (c as { cause?: unknown }).cause) {
      texteErreur += ` ${String((c as Error)?.message ?? c)}`;
    }
    if (/FOREIGN KEY/i.test(texteErreur)) {
      return { ok: false, erreur: "Impossible : des sujets (ou des séries) l'utilisent encore." };
    }
    if (/UNIQUE|PRIMARY KEY/i.test(texteErreur)) {
      return { ok: false, erreur: "Cet élément existe déjà." };
    }
    throw e;
  }
  return { ok: false, erreur: "Action inconnue." };
}
