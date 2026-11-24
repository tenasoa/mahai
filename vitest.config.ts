import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Config séparée de vite.config.ts : les tests unitaires n'ont besoin ni de React Router
// ni du runtime Workers.
export default defineConfig({
  resolve: {
    alias: { "~": fileURLToPath(new URL("./app", import.meta.url)) },
  },
  test: {
    include: ["app/**/*.test.ts"],
    environment: "node",
  },
});
