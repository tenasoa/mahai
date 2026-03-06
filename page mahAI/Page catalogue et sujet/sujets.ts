// lib/db/queries/sujets.ts - Requêtes pour les sujets

import { prisma } from '../prisma';
import type { Sujet, SujetFilters, SortOption, PaginatedResult } from '@/types';

/**
 * Récupérer tous les sujets publiés avec filtres et pagination
 */
export async function getSujets(
  filters: SujetFilters = {},
  page: number = 1,
  pageSize: number = 12,
  sort: SortOption = 'recents'
): Promise<PaginatedResult<Sujet>> {
  // Construction du where clause
  const where: any = {
    statut: filters.statut ?? 'PUBLIE',
  };

  if (filters.typeExamen && filters.typeExamen.length > 0) {
    where.typeExamen = { in: filters.typeExamen };
  }

  if (filters.matiere && filters.matiere.length > 0) {
    where.matiere = { in: filters.matiere };
  }

  if (filters.serie && filters.serie.length > 0) {
    where.serie = { in: filters.serie };
  }

  if (filters.anneeMin || filters.anneeMax) {
    where.annee = {};
    if (filters.anneeMin) where.annee.gte = filters.anneeMin;
    if (filters.anneeMax) where.annee.lte = filters.anneeMax;
  }

  if (filters.maxCredits) {
    where.prixCredits = { lte: filters.maxCredits };
  }

  if (filters.search) {
    where.OR = [
      { titre: { contains: filters.search, mode: 'insensitive' } },
      { contenuTexte: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Construction du orderBy
  let orderBy: any = { createdAt: 'desc' };
  
  switch (sort) {
    case 'populaires':
      orderBy = { nbAchats: 'desc' };
      break;
    case 'mieux_notes':
      orderBy = { notemoyenne: 'desc' };
      break;
    case 'prix_croissant':
      orderBy = { prixCredits: 'asc' };
      break;
    case 'prix_decroissant':
      orderBy = { prixCredits: 'desc' };
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }

  // Exécution des requêtes en parallèle
  const [items, total] = await Promise.all([
    prisma.sujet.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        contributeur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            photo: true,
          },
        },
      },
    }),
    prisma.sujet.count({ where }),
  ]);

  return {
    items: items as Sujet[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Récupérer un sujet par ID avec toutes les relations
 */
export async function getSujetById(id: string): Promise<Sujet | null> {
  const sujet = await prisma.sujet.findUnique({
    where: { id },
    include: {
      contributeur: {
        select: {
          id: true,
          prenom: true,
          nom: true,
          photo: true,
          bio: true,
        },
      },
      verificateur: {
        select: {
          id: true,
          prenom: true,
          nom: true,
        },
      },
    },
  });

  return sujet as Sujet | null;
}

/**
 * Vérifier si un user a accès à un sujet
 */
export async function userHasAccessToSujet(
  userId: string,
  sujetId: string
): Promise<boolean> {
  const achat = await prisma.achat.findFirst({
    where: {
      userId,
      sujetId,
      typeAcces: { in: ['SUJET', 'EXAMEN_BLANC'] },
    },
  });

  return !!achat;
}

/**
 * Récupérer les sujets similaires (même matière, même type d'examen)
 */
export async function getSimilarSujets(
  sujetId: string,
  limit: number = 4
): Promise<Sujet[]> {
  const sujet = await prisma.sujet.findUnique({
    where: { id: sujetId },
    select: { typeExamen: true, matiere: true, serie: true },
  });

  if (!sujet) return [];

  const similar = await prisma.sujet.findMany({
    where: {
      id: { not: sujetId },
      statut: 'PUBLIE',
      typeExamen: sujet.typeExamen,
      matiere: sujet.matiere,
      ...(sujet.serie && { serie: sujet.serie }),
    },
    orderBy: {
      nbAchats: 'desc',
    },
    take: limit,
    include: {
      contributeur: {
        select: {
          id: true,
          prenom: true,
          nom: true,
        },
      },
    },
  });

  return similar as Sujet[];
}

/**
 * Incrémenter le compteur d'achats d'un sujet
 */
export async function incrementSujetAchats(sujetId: string): Promise<void> {
  await prisma.sujet.update({
    where: { id: sujetId },
    data: {
      nbAchats: {
        increment: 1,
      },
    },
  });
}
