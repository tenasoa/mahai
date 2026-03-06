import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// ============================================
// MAH.AI — Client Prisma v7
// ============================================
// Configuration pour Prisma 7 avec URLs externes
// ============================================

export const prisma = globalThis.prisma || new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Helpers
export const db = prisma
