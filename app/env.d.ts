// Secrets : absents de wrangler.jsonc (posés par `wrangler secret put` ou `.dev.vars`), donc
// inconnus de `wrangler types` en CI. On les déclare ici pour que le typage soit stable partout.
declare namespace Cloudflare {
  interface Env {
    BETTER_AUTH_SECRET: string;
  }
}
