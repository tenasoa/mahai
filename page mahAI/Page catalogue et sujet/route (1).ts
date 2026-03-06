// app/api/user/route.ts - API pour récupérer les infos de l'utilisateur

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/clerk';
import { getUserCredits } from '@/lib/utils/credits';

/**
 * GET /api/user
 * Récupérer les informations de l'utilisateur connecté
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

    return NextResponse.json({
      id: user.id,
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      credits: user.credits,
      roles: user.roles,
      photo: user.photo,
    });
  } catch (error) {
    console.error('Erreur user:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/credits
 * Récupérer uniquement le solde de crédits
 */
export async function credits() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const credits = await getUserCredits(user.id);

    return NextResponse.json({ credits });
  } catch (error) {
    console.error('Erreur credits:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
