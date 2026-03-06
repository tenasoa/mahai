// app/api/webhooks/clerk/route.ts - Webhook pour synchroniser Clerk → Supabase

import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { syncClerkUser } from '@/lib/auth/clerk';

/**
 * POST /api/webhooks/clerk
 * Webhook pour synchroniser les événements Clerk vers notre DB
 */
export async function POST(request: NextRequest) {
  // Récupérer le webhook secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET manquant');
  }

  // Récupérer les headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // Si pas de headers, c'est une requête invalide
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Headers manquants' },
      { status: 400 }
    );
  }

  // Récupérer le body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Créer une instance Svix avec le secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  // Vérifier la signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;
  } catch (err) {
    console.error('Erreur vérification webhook:', err);
    return NextResponse.json(
      { error: 'Signature invalide' },
      { status: 400 }
    );
  }

  // Gérer les événements
  const { id, ...data } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook reçu: ${eventType}`, id);

  try {
    switch (eventType) {
      case 'user.created':
      case 'user.updated':
        // Synchroniser l'utilisateur
        await syncClerkUser(data);
        console.log(`✅ User ${eventType}:`, id);
        break;

      case 'user.deleted':
        // Supprimer l'utilisateur de notre DB (soft delete)
        const { prisma } = await import('@/lib/db/prisma');
        await prisma.user.update({
          where: { clerkId: id },
          data: {
            // Soft delete - on garde les données mais on désactive le compte
            email: `deleted_${id}@deleted.com`,
          },
        });
        console.log(`✅ User deleted:`, id);
        break;

      default:
        console.log(`⚠️ Événement non géré: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur traitement webhook:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
