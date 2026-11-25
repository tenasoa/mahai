import { env } from "cloudflare:workers";

import type { Route } from "./+types/medias.$";
import { CLE_MEDIA } from "~/lib/document/nettoyer";

/** Sert une image de sujet depuis R2. Les clés sont uniques : mise en cache longue. */
export async function loader({ params, request }: Route.LoaderArgs) {
  const cle = params["*"] ?? "";
  if (!CLE_MEDIA.test(cle)) return new Response("Introuvable", { status: 404 });

  const objet = await env.MEDIAS.get(cle, { onlyIf: request.headers });
  if (!objet) return new Response("Introuvable", { status: 404 });

  const headers = new Headers();
  objet.writeHttpMetadata(headers);
  headers.set("etag", objet.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  headers.set("content-security-policy", "default-src 'none'; sandbox");

  // Requête conditionnelle satisfaite : pas de corps.
  if (!("body" in objet)) return new Response(null, { status: 304, headers });
  return new Response(objet.body, { headers });
}
