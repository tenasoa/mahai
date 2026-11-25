import { env } from "cloudflare:workers";

import type { Route } from "./+types/admin.medias";
import { getDb } from "~/db/db.server";
import { media } from "~/db/schema";
import { requireEditeur } from "~/lib/auth/session.server";
import { TAILLE_MAX, typeImage, urlMedia } from "~/lib/medias/medias";

/** Envoi d'une image de sujet dans R2 (appelé par l'éditeur, réponse JSON). */
export async function action({ request }: Route.ActionArgs) {
  const session = await requireEditeur(request);
  const longueur = Number(request.headers.get("content-length") ?? 0);
  if (longueur > TAILLE_MAX + 64 * 1024) {
    return Response.json({ erreur: "Image trop lourde (5 Mo au maximum)." }, { status: 413 });
  }

  const f = await request.formData();
  const fichier = f.get("fichier");
  if (!(fichier instanceof File) || fichier.size === 0) {
    return Response.json({ erreur: "Aucune image reçue." }, { status: 400 });
  }
  if (fichier.size > TAILLE_MAX) {
    return Response.json({ erreur: "Image trop lourde (5 Mo au maximum)." }, { status: 413 });
  }
  const octets = new Uint8Array(await fichier.arrayBuffer());
  const type = typeImage(octets.subarray(0, 16));
  if (!type) {
    return Response.json({ erreur: "Format non accepté : PNG, JPEG, WebP ou GIF." }, { status: 415 });
  }

  const dimension = (nom: string) => {
    const n = Number(f.get(nom));
    return Number.isInteger(n) && n > 0 && n <= 8000 ? n : null;
  };
  const cle = `m/${crypto.randomUUID()}.${type.ext}`;
  await env.MEDIAS.put(cle, octets, { httpMetadata: { contentType: type.type } });
  await getDb()
    .insert(media)
    .values({
      cle,
      type: type.type,
      taille: octets.byteLength,
      largeur: dimension("largeur"),
      hauteur: dimension("hauteur"),
      auteurId: session.user.id,
    });
  return Response.json({ cle, url: urlMedia(cle) });
}
