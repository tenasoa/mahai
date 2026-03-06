import { clerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db/prisma'

export enum Role {
  ETUDIANT = 'ETUDIANT',
  CONTRIBUTEUR = 'CONTRIBUTEUR',
  VERIFICATEUR = 'VERIFICATEUR',
  PROFESSEUR = 'PROFESSEUR',
  ADMIN = 'ADMIN'
}

// ============================================
// MAH.AI — Clerk Utils
// ============================================
// Fonctions utilitaires pour Clerk
// ============================================

// ── CRÉER UN UTILISATEUR DANS LA DB ────────────────────────────
export async function syncUserToDb(clerkId: string, email: string, prenom: string) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existing = await db.user.findUnique({
      where: { clerkId },
    })
    
    if (existing) {
      return existing
    }
    
    // Créer un nouvel utilisateur
    const user = await db.user.create({
      data: {
        clerkId,
        email,
        prenom,
        credits: 10, // Crédits d'inscription offerts
        roles: [Role.ETUDIANT],
        statut: "ACTIF",
      },
    })
    
    return user
  } catch (error) {
    console.error('Erreur lors de la sync user:', error)
    throw error
  }
}

// ── METTRE À JOUR LES RÔLES ────────────────────────────────────
export async function updateUserRoles(clerkId: string, roles: Role[]) {
  try {
    const user = await db.user.update({
      where: { clerkId },
      data: { roles },
    })
    
    // Mettre à jour les metadata Clerk
    const client = await clerkClient()
    await client.users.updateUserMetadata(clerkId, {
      publicMetadata: { roles },
    })
    
    return user
  } catch (error) {
    console.error('Erreur lors de la mise à jour des rôles:', error)
    throw error
  }
}

// ── VÉRIFIER LES CRÉDITS ──────────────────────────────────────
export async function checkUserCredits(clerkId: string, requiredCredits: number) {
  const user = await db.user.findUnique({
    where: { clerkId },
    select: { credits: true },
  })
  
  if (!user) {
    throw new Error('Utilisateur non trouvé')
  }
  
  return user.credits >= requiredCredits
}

// ── DÉDUIRE DES CRÉDITS ───────────────────────────────────────
export async function deductCredits(clerkId: string, amount: number) {
  try {
    const user = await db.user.update({
      where: { clerkId },
      data: {
        credits: {
          decrement: amount,
        },
      },
    })
    
    return user.credits
  } catch (error) {
    console.error('Erreur lors de la déduction des crédits:', error)
    throw error
  }
}

// ── AJOUTER DES CRÉDITS ───────────────────────────────────────
export async function addCredits(clerkId: string, amount: number) {
  try {
    const user = await db.user.update({
      where: { clerkId },
      data: {
        credits: {
          increment: amount,
        },
      },
    })
    
    return user.credits
  } catch (error) {
    console.error('Erreur lors de l\'ajout des crédits:', error)
    throw error
  }
}
