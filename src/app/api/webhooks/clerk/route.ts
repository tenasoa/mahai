import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db/prisma'

// ============================================
// MAH.AI — Webhook Clerk
// ============================================
// Synchronisation automatique Clerk → Supabase
// ============================================

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env'
    )
  }

  // Récupérer les headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // Vérifier la présence des headers
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Récupérer le body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Créer le webhook Svix
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Vérifier la signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Traiter l'événement
  const eventType = evt.type

  switch (eventType) {
    case 'user.created': {
      // Nouvel utilisateur créé
      const { id, email_addresses, first_name, last_name } = evt.data
      
      const email = email_addresses[0]?.email_address
      const prenom = first_name || email?.split('@')[0] || 'Utilisateur'
      const nom = last_name

      try {
        await db.user.create({
          data: {
            clerkId: id,
            email: email!,
            prenom,
            nom: nom || null,
            credits: 10, // Crédits d'inscription offerts
            roles: ['ETUDIANT'],
          },
        })
        
        console.log(`✅ Utilisateur créé : ${email}`)
      } catch (error) {
        console.error('Erreur création user:', error)
        return new Response('Error creating user', { status: 500 })
      }
      break
    }

    case 'user.updated': {
      // Utilisateur mis à jour
      const { id, email_addresses, first_name, last_name } = evt.data
      
      const email = email_addresses[0]?.email_address
      const prenom = first_name
      const nom = last_name

      try {
        await db.user.update({
          where: { clerkId: id },
          data: {
            email: email,
            prenom: prenom || undefined,
            nom: nom || undefined,
          },
        })
        
        console.log(`✅ Utilisateur mis à jour : ${email}`)
      } catch (error) {
        console.error('Erreur mise à jour user:', error)
      }
      break
    }

    case 'user.deleted': {
      // Utilisateur supprimé
      const { id } = evt.data

      try {
        await db.user.delete({
          where: { clerkId: id },
        })
        
        console.log(`✅ Utilisateur supprimé : ${id}`)
      } catch (error) {
        console.error('Erreur suppression user:', error)
      }
      break
    }

    default:
      console.log(`⚠️ Événement non traité : ${eventType}`)
  }

  return new Response('', { status: 200 })
}
