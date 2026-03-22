import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/error-boundaries': 'off',
      'react-hooks/incompatible-library': 'off',
      'prefer-const': 'warn',
    },
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'migrations/**',
      'migrations_manual/**',
      'tsconfig.tsbuildinfo',
    ],
  },
]
