import { env } from "cloudflare:workers";

/** Point de contrôle pour les déploiements et la supervision. */
export function loader() {
  return Response.json(
    { ok: true, env: env.APP_ENV },
    { headers: { "Cache-Control": "no-store" } },
  );
}
