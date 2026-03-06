// lib/utils/credits.ts - Système de crédits

import { prisma } from '../db/prisma';
import { incrementSujetAchats } from '../db/queries/sujets';
import type { TypeAcces } from '@/types';

/**
 * Vérifier si un utilisateur a assez de crédits
 */
export async function userHasEnoughCredits(
  userId: string,
  requiredCredits: number
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  return (user?.credits ?? 0) >= requiredCredits;
}

/**
 * Récupérer le solde de crédits d'un utilisateur
 */
export async function getUserCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  return user?.credits ?? 0;
}

/**
 * Acheter l'accès à un sujet avec des crédits
 */
export async function acheterSujet(
  userId: string,
  sujetId: string,
  typeAcces: TypeAcces = 'SUJET'
): Promise<{ success: boolean; message: string; achatId?: string }> {
  // Récupérer le sujet et l'utilisateur
  const [sujet, user] = await Promise.all([
    prisma.sujet.findUnique({
      where: { id: sujetId },
      select: { id: true, prixCredits: true, contributeurId: true, statut: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, credits: true },
    }),
  ]);

  // Validations
  if (!sujet) {
    return { success: false, message: 'Sujet introuvable' };
  }

  if (sujet.statut !== 'PUBLIE') {
    return { success: false, message: 'Sujet non disponible' };
  }

  if (!user) {
    return { success: false, message: 'Utilisateur introuvable' };
  }

  // Vérifier si déjà acheté
  const existingAchat = await prisma.achat.findFirst({
    where: {
      userId,
      sujetId,
      typeAcces,
    },
  });

  if (existingAchat) {
    return { success: false, message: 'Déjà acheté' };
  }

  const prix = sujet.prixCredits;

  if (user.credits < prix) {
    return {
      success: false,
      message: `Crédits insuffisants. Vous avez ${user.credits} crédits, il en faut ${prix}.`,
    };
  }

  // Transaction : déduire crédits + créer achat + distribuer revenus
  const achat = await prisma.$transaction(async (tx) => {
    // 1. Déduire les crédits
    await tx.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: prix,
        },
      },
    });

    // 2. Créer l'achat
    const newAchat = await tx.achat.create({
      data: {
        userId,
        sujetId,
        typeAcces,
        creditsPaies: prix,
      },
    });

    // 3. Distribuer les revenus (70% contributeur, 30% plateforme)
    const revenueContributeur = Math.floor(prix * 0.7);
    
    await tx.gain.create({
      data: {
        userId: sujet.contributeurId,
        montantAr: revenueContributeur * 500, // 1 crédit ≈ 500 Ar
        source: 'VENTE_SUJET',
        role: 'CONTRIBUTEUR',
        paye: false,
      },
    });

    return newAchat;
  });

  // 4. Incrémenter le compteur d'achats (hors transaction)
  await incrementSujetAchats(sujetId);

  return {
    success: true,
    message: 'Achat réussi',
    achatId: achat.id,
  };
}

/**
 * Ajouter des crédits à un utilisateur (après paiement)
 */
export async function addCreditsToUser(
  userId: string,
  credits: number,
  paiementId?: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      credits: {
        increment: credits,
      },
    },
  });
}

/**
 * Calculer le prix en Ariary d'un nombre de crédits
 */
export function creditsToAriary(credits: number): number {
  return credits * 500; // 1 crédit = 500 Ar
}

/**
 * Calculer le nombre de crédits pour un montant en Ariary
 */
export function ariaryToCredits(ariary: number): number {
  return Math.floor(ariary / 500);
}
