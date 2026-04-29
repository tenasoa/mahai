import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Chemin vers votre application Next.js pour charger next.config.js et les fichiers .env
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/__tests__/jest.setup.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  collectCoverageFrom: [
    "components/**/*.{ts,tsx}",
    "!components/**/*.stories.{ts,tsx}",
    "!components/**/index.{ts,tsx}",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

export default createJestConfig(customJestConfig);
