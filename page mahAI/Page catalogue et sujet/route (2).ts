// app/api/achats/route.ts - API pour acheter un sujet

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/clerk';
import { acheterSujet } from '@/lib/utils/credits';
import type { TypeAcces } from '@/types';

/**
 * POST /api/achats
 * Acheter un accès à un sujet avec des crédits
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Parser le body
    const body = await request.json();
    const { sujetId, typeAcces } = body;

    // Validation
    if (!sujetId || !typeAcces) {
      return NextResponse.json(
        { success: false, message: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    const validTypes: TypeAcces[] = ['SUJET', 'CORRECTION_IA', 'CORRECTION_PROF', 'EXAMEN_BLANC'];
    if (!validTypes.includes(typeAcces)) {
      return NextResponse.json(
        { success: false, message: 'Type d\'accès invalide' },
        { status: 400 }
      );
    }

    // Effectuer l'achat
    const result = await acheterSujet(user.id, sujetId, typeAcces);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        achatId: result.achatId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Erreur achat:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur serveur',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/achats
 * Récupérer les achats de l'utilisateur connecté
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { prisma } = await import('@/lib/db/prisma');

    const achats = await prisma.achat.findMany({
      where: { userId: user.id },
      include: {
        sujet: {
          select: {
            id: true,
            titre: true,
            typeExamen: true,
            matiere: true,
            annee: true,
            prixCredits: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ achats });
  } catch (error) {
    console.error('Erreur récupération achats:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
