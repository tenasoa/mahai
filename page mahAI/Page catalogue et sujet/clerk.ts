// lib/auth/clerk.ts - Utilitaires Clerk

import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '../db/prisma';
import type { User } from '@/types';

/**
 * Récupérer l'utilisateur actuel depuis Clerk + DB
 */
export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  return user as User | null;
}

/**
 * Récupérer l'ID de l'utilisateur actuel
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Vérifier si l'utilisateur a un rôle spécifique
 */
export async function userHasRole(role: string): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.roles.includes(role as any) ?? false;
}

/**
 * Vérifier si l'utilisateur est admin
 */
export async function isAdmin(): Promise<boolean> {
  return userHasRole('ADMIN');
}

/**
 * Protéger une route - retourne l'utilisateur ou lance une erreur
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Non autorisé');
  }

  return user;
}

/**
 * Protéger une route avec un rôle spécifique
 */
export async function requireRole(role: string): Promise<User> {
  const user = await requireAuth();
  
  if (!user.roles.includes(role as any)) {
    throw new Error(`Rôle ${role} requis`);
  }

  return user;
}

/**
 * Synchroniser un utilisateur Clerk vers la DB (webhook)
 */
export async function syncClerkUser(clerkUser: any) {
  const existingUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (existingUser) {
    // Mise à jour
    return prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: {
        email: clerkUser.email_addresses[0]?.email_address,
        prenom: clerkUser.first_name || '',
        nom: clerkUser.last_name,
        photo: clerkUser.image_url,
      },
    });
  } else {
    // Création avec 10 crédits offerts
    return prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.email_addresses[0]?.email_address,
        prenom: clerkUser.first_name || 'Utilisateur',
        nom: clerkUser.last_name,
        photo: clerkUser.image_url,
        credits: 10, // Crédits d'inscription
        roles: ['ETUDIANT'], // Rôle par défaut
      },
    });
  }
}
