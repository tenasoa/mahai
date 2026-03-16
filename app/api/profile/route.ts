import { NextRequest, NextResponse } from 'next/server'
import { getProfileAction, updateProfileAction } from '@/actions/profile'

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'userId depuis les headers ou cookies
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const result = await getProfileAction(userId)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ profile: result.data })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const result = await updateProfileAction(userId, body)
    
    if (!result.success) {
      if (result.error === 'Données invalides') {
        return NextResponse.json({ 
          error: result.error,
          details: result.details 
        }, { status: 400 })
      }
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Profil mis à jour avec succès',
      profile: result.data 
    })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
