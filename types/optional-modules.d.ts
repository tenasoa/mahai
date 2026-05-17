/**
 * Déclarations de types pour des intégrations optionnelles NON installées.
 *
 * `resend` (emails transactionnels) et `@upstash/redis` (rate-limiting
 * distribué) sont chargés dynamiquement (`await import(...)`) dans un
 * try/catch, avec un repli si le paquet est absent (cf. lib/email.ts et
 * lib/rate-limit.ts). Tant que ces paquets ne sont pas ajoutés au
 * package.json, ces stubs ambient évitent une erreur de compilation
 * TypeScript « Cannot find module ».
 *
 * → Si les paquets sont un jour installés (`pnpm add resend @upstash/redis`),
 *   supprimer ce fichier pour utiliser les vrais types.
 */

declare module 'resend' {
  export class Resend {
    constructor(apiKey?: string)
    emails: {
      send(payload: unknown): Promise<{
        data: { id?: string } | null
        error: { message?: string } | null
      }>
    }
  }
}

declare module '@upstash/redis' {
  interface RedisClient {
    ping(): Promise<unknown>
    eval(script: string, keys: unknown[], args: unknown[]): Promise<unknown>
    [key: string]: unknown
  }
  export class Redis {
    static fromEnv(): RedisClient
  }
}
