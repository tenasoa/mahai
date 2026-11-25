/**
 * Accès au catalogue de sujets (lecture publique et gestion par l'admin).
 */
import { and, asc, desc, eq, inArray, like, sql, type SQL } from "drizzle-orm";

import type { Db } from "~/db/db.server";
import { examen, matiere, serie, sujet, sujetSerie, type Couleur } from "~/db/schema";
import { slugifier } from "~/lib/contenu/texte";
import { texteRecherche, type DonneesSujet, type Listes } from "./formulaire";

export type ListesCompletes = Omit<Listes, "matieres"> & {
  matieres: { id: string; nom: string; couleur: Couleur; outils: string[] | null }[];
};

export async function chargerListes(db: Db): Promise<ListesCompletes> {
  const [examens, series, matieres] = await db.batch([
    db.select({ id: examen.id, nom: examen.nom }).from(examen).orderBy(asc(examen.ordre), asc(examen.nom)),
    db
      .select({ id: serie.id, examenId: serie.examenId, nom: serie.nom })
      .from(serie)
      .orderBy(asc(serie.ordre), asc(serie.nom)),
    db
      .select({ id: matiere.id, nom: matiere.nom, couleur: matiere.couleur, outils: matiere.outils })
      .from(matiere)
      .orderBy(asc(matiere.ordre), asc(matiere.nom)),
  ]);
  return { examens, series, matieres };
}

/* ---------- Lecture publique ---------- */

export const PAR_PAGE = 20;

export type Filtres = {
  mots: string[];
  examenId?: string | null;
  matiereId?: string | null;
  serieId?: string | null;
  annee?: number | null;
  page: number;
};

const resume = {
  id: sujet.id,
  slug: sujet.slug,
  titre: sujet.titre,
  examenId: sujet.examenId,
  matiereId: sujet.matiereId,
  annee: sujet.annee,
  session: sujet.session,
  dureeMinutes: sujet.dureeMinutes,
};

async function seriesDe(db: Db, ids: string[]) {
  if (ids.length === 0) return new Map<string, string[]>();
  const lignes = await db
    .select({ sujetId: sujetSerie.sujetId, serieId: sujetSerie.serieId })
    .from(sujetSerie)
    .where(inArray(sujetSerie.sujetId, ids));
  const parSujet = new Map<string, string[]>();
  for (const l of lignes) parSujet.set(l.sujetId, [...(parSujet.get(l.sujetId) ?? []), l.serieId]);
  return parSujet;
}

export async function chercherSujets(db: Db, f: Filtres) {
  const conditions: SQL[] = [eq(sujet.statut, "publie")];
  // Les mots ne contiennent que [a-z0-9] (normaliser) : pas de caractère spécial pour LIKE.
  for (const mot of f.mots) conditions.push(like(sujet.recherche, `%${mot}%`));
  if (f.examenId) conditions.push(eq(sujet.examenId, f.examenId));
  if (f.matiereId) conditions.push(eq(sujet.matiereId, f.matiereId));
  if (f.annee) conditions.push(eq(sujet.annee, f.annee));
  if (f.serieId) {
    conditions.push(
      inArray(
        sujet.id,
        db.select({ id: sujetSerie.sujetId }).from(sujetSerie).where(eq(sujetSerie.serieId, f.serieId)),
      ),
    );
  }
  const lignes = await db
    .select(resume)
    .from(sujet)
    .where(and(...conditions))
    .orderBy(sql`${sujet.annee} is null`, desc(sujet.annee), desc(sujet.publieLe))
    .limit(PAR_PAGE + 1)
    .offset(f.page * PAR_PAGE);
  const page = lignes.slice(0, PAR_PAGE);
  const series = await seriesDe(db, page.map((s) => s.id));
  return {
    sujets: page.map((s) => ({ ...s, series: series.get(s.id) ?? [] })),
    suivante: lignes.length > PAR_PAGE,
  };
}

/** Années pour lesquelles au moins un sujet est publié (filtre de recherche). */
export async function anneesPubliees(db: Db): Promise<number[]> {
  const lignes = await db
    .selectDistinct({ annee: sujet.annee })
    .from(sujet)
    .where(and(eq(sujet.statut, "publie"), sql`${sujet.annee} is not null`))
    .orderBy(desc(sujet.annee));
  return lignes.map((l) => l.annee!).filter(Boolean);
}

export async function sujetPublie(db: Db, slug: string) {
  const [s] = await db
    .select()
    .from(sujet)
    .where(and(eq(sujet.slug, slug), eq(sujet.statut, "publie")))
    .limit(1);
  if (!s) return null;
  const series = await db
    .select({ serieId: sujetSerie.serieId, coefficient: sujetSerie.coefficient })
    .from(sujetSerie)
    .where(eq(sujetSerie.sujetId, s.id));
  return { ...s, series };
}

/* ---------- Gestion (admin) ---------- */

export async function sujetsAdmin(db: Db) {
  return db
    .select({ ...resume, statut: sujet.statut, modifieLe: sujet.modifieLe })
    .from(sujet)
    .orderBy(desc(sujet.modifieLe))
    .limit(200);
}

export async function sujetPourEdition(db: Db, id: string) {
  const [s] = await db.select().from(sujet).where(eq(sujet.id, id)).limit(1);
  if (!s) return null;
  const series = await db
    .select({ serieId: sujetSerie.serieId, coefficient: sujetSerie.coefficient })
    .from(sujetSerie)
    .where(eq(sujetSerie.sujetId, id));
  return { ...s, series };
}

function colonnes(d: DonneesSujet, listes: Listes) {
  return {
    titre: d.titre,
    examenId: d.examenId,
    matiereId: d.matiereId,
    annee: d.annee,
    session: d.session,
    niveau: d.niveau,
    dureeMinutes: d.dureeMinutes,
    codeMatiere: d.codeMatiere,
    option: d.option,
    coefficient: d.coefficient,
    source: d.source,
    enonce: d.enonce,
    corrige: d.corrige,
    recherche: texteRecherche(d, listes),
  };
}

/** Adresse unique : « bac-2021-mathematiques », puis « …-2 », « …-3 » si elle est prise. */
async function slugLibre(db: Db, d: DonneesSujet, listes: Listes) {
  const nomExamen = listes.examens.find((e) => e.id === d.examenId)?.nom ?? "";
  const base = slugifier(`${nomExamen} ${d.annee ?? ""} ${d.titre}`);
  const pris = new Set(
    (
      await db.select({ slug: sujet.slug }).from(sujet).where(like(sujet.slug, `${base}%`))
    ).map((l) => l.slug),
  );
  if (!pris.has(base)) return base;
  for (let i = 2; ; i++) if (!pris.has(`${base}-${i}`)) return `${base}-${i}`;
}

export async function creerSujet(db: Db, d: DonneesSujet, listes: Listes, auteurId: string) {
  const id = crypto.randomUUID();
  const slug = await slugLibre(db, d, listes);
  await db.batch([
    db.insert(sujet).values({ id, slug, auteurId, ...colonnes(d, listes) }),
    ...d.series.map((s) => db.insert(sujetSerie).values({ sujetId: id, ...s })),
  ]);
  return { id, slug };
}

export async function modifierSujet(db: Db, id: string, d: DonneesSujet, listes: Listes) {
  await db.batch([
    db.update(sujet).set(colonnes(d, listes)).where(eq(sujet.id, id)),
    db.delete(sujetSerie).where(eq(sujetSerie.sujetId, id)),
    ...d.series.map((s) => db.insert(sujetSerie).values({ sujetId: id, ...s })),
  ]);
}

export async function changerStatut(db: Db, id: string, publie: boolean) {
  await db
    .update(sujet)
    .set(
      publie
        ? { statut: "publie", publieLe: sql`coalesce(${sujet.publieLe}, cast(unixepoch('subsecond') * 1000 as integer))` }
        : { statut: "brouillon" },
    )
    .where(eq(sujet.id, id));
}

export async function supprimerSujet(db: Db, id: string) {
  await db.delete(sujet).where(eq(sujet.id, id));
}
