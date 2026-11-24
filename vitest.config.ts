import { defineConfig } from "vitest/config";

// Config séparée de vite.config.ts : les tests unitaires n'ont besoin ni de React Router
// ni du runtime Workers.
export default defineConfig({
  test: {
    include: ["app/**/*.test.ts"],
    environment: "node",
  },
});
