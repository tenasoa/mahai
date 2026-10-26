import { defineConfig } from 'drizzle-kit'

// Schéma D1 (SQLite). `pnpm db:generate` écrit les migrations SQL dans drizzle/,
// appliquées ensuite par wrangler (`pnpm db:migrate:local` / `db:migrate:remote`).
export default defineConfig({
  dialect: 'sqlite',
  schema: './db/schema.ts',
  out: './drizzle',
})
