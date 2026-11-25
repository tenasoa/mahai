import { env } from "cloudflare:workers";
import { gt, inArray, sql } from "drizzle-orm";

import type { Db } from "~/db/db.server";
import { media, sujet } from "~/db/schema";
import { classer, clesCitees, type Fichier, type Inventaire } from "./nettoyage";

/** Clés citées par au moins un sujet (brouillons compris), lues par lots. */
async function clesUtilisees(db: Db): Promise<Set<string>> {
  const citees = new Set<string>();
  let dernier = "";
  for (;;) {
    // Texte JSON brut : pas besoin de reconstruire les documents pour y trouver les clés.
    const lot = await db
      .select({ id: sujet.id, enonce: sql<string>`${sujet.enonce}`, corrige: sql<string | null>`${sujet.corrige}` })
      .from(sujet)
      .where(gt(sujet.id, dernier))
      .orderBy(sujet.id)
      .limit(100);
    for (const s of lot) {
      for (const cle of [...clesCitees(s.enonce), ...clesCitees(s.corrige)]) citees.add(cle);
    }
    if (lot.length < 100) return citees;
    dernier = lot[lot.length - 1]!.id;
  }
}

/** Tous les fichiers : ceux de R2 (préfixe m/) et les fiches `media` sans fichier. */
async function fichiers(db: Db): Promise<Fichier[]> {
  const fiches = new Map(
    (await db.select({ cle: media.cle, creeLe: media.creeLe }).from(media)).map((f) => [f.cle, f.creeLe.getTime()]),
  );
  const parCle = new Map<string, Fichier>();
  let curseur: string | undefined;
  do {
    const page = await env.MEDIAS.list({ prefix: "m/", cursor: curseur, limit: 1000 });
    for (const o of page.objects) {
      // Date d'envoi : celle de la fiche `media`, sinon celle de R2.
      const creeLe = fiches.get(o.key) ?? o.uploaded.getTime();
      parCle.set(o.key, { cle: o.key, taille: o.size, creeLe, dansR2: true });
    }
    curseur = page.truncated ? page.cursor : undefined;
  } while (curseur);
  for (const [cle, creeLe] of fiches) {
    if (!parCle.has(cle)) parCle.set(cle, { cle, taille: 0, creeLe, dansR2: false });
  }
  return [...parCle.values()];
}

export async function inventaireMedias(db: Db): Promise<Inventaire> {
  const [citees, tous] = await Promise.all([clesUtilisees(db), fichiers(db)]);
  return classer(tous, citees, Date.now());
}

/**
 * Supprime les images inutilisées depuis plus que le délai de grâce. La liste est recalculée
 * ici (jamais reçue du navigateur). Renvoie le nombre de fichiers supprimés et la place libérée.
 */
export async function supprimerInutilises(db: Db): Promise<{ nombre: number; octets: number }> {
  const { inutilises, tailleInutilises } = await inventaireMedias(db);
  // Lots de 90 : D1 accepte au plus 100 paramètres par requête.
  for (let i = 0; i < inutilises.length; i += 90) {
    const lot = inutilises.slice(i, i + 90);
    const dansR2 = lot.filter((f) => f.dansR2).map((f) => f.cle);
    if (dansR2.length) await env.MEDIAS.delete(dansR2);
    await db.delete(media).where(inArray(
      media.cle,
      lot.map((f) => f.cle),
    ));
  }
  return { nombre: inutilises.length, octets: tailleInutilises };
}
