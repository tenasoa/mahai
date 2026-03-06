// lib/db/prisma.ts - Client Prisma singleton

import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma Client pour éviter les connexions multiples en dev
 * https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Utilitaire pour fermer proprement la connexion
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
