import { defineConfig } from "drizzle-kit";

// Génère les migrations SQL ; elles sont appliquées par wrangler (d1 migrations apply).
export default defineConfig({
  dialect: "sqlite",
  schema: "./app/db/schema.ts",
  out: "./drizzle",
});
