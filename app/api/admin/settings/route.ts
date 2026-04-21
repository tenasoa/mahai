import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Vérifier si l'utilisateur est admin
async function checkAdmin(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    return { error: 'Non authentifié', status: 401 }
  }

  const userResult = await query('SELECT role FROM "User" WHERE id = $1', [session.user.id])
  const role = userResult.rows[0]?.role
  if (!role || String(role).toUpperCase() !== 'ADMIN') {
    return { error: 'Accès interdit', status: 403 }
  }

  return { userId: session.user.id }
}

// GET /api/admin/settings - Lister tous les paramètres
export async function GET(request: Request) {
  const auth = await checkAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const result = await query(
      `SELECT * FROM "SystemSetting" ORDER BY "category", "key"`,
      []
    )
    return NextResponse.json({ settings: result.rows })
  } catch (err) {
    console.error('Admin GET settings error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin/settings - Créer un paramètre
export async function POST(request: Request) {
  const auth = await checkAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await request.json()
    const { key, value, type = 'string', label, description, category = 'general' } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Clé et valeur requises' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO "SystemSetting" ("key", "value", "type", "label", "description", "category") 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [key, String(value), type, label, description, category]
    )

    return NextResponse.json({ setting: result.rows[0] })
  } catch (err: any) {
    if (err.message?.includes('unique constraint')) {
      return NextResponse.json({ error: 'Cette clé existe déjà' }, { status: 409 })
    }
    console.error('Admin POST settings error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH /api/admin/settings - Mettre à jour
export async function PATCH(request: Request) {
  const auth = await checkAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await request.json()
    const { key, value, label, description, isEditable } = body

    if (!key) {
      return NextResponse.json({ error: 'Clé requise' }, { status: 400 })
    }

    // Vérifier si le paramètre est éditable
    const checkResult = await query(
      'SELECT "isEditable" FROM "SystemSetting" WHERE "key" = $1',
      [key]
    )
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Paramètre non trouvé' }, { status: 404 })
    }

    if (!checkResult.rows[0].isEditable) {
      return NextResponse.json({ error: 'Ce paramètre ne peut pas être modifié' }, { status: 403 })
    }

    const result = await query(
      `UPDATE "SystemSetting" SET value = $2, "updatedAt" = NOW() 
       ${label !== undefined ? ', label = $3' : ''}
       ${description !== undefined ? ', description = $4' : ''}
       WHERE "key" = $1 RETURNING *`,
      [key, String(value), label, description].filter(v => v !== undefined)
    )

    return NextResponse.json({ setting: result.rows[0] })
  } catch (err) {
    console.error('Admin PATCH settings error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/admin/settings?key=xxx - Supprimer
export async function DELETE(request: Request) {
  const auth = await checkAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Clé requise' }, { status: 400 })
    }

    await query('DELETE FROM "SystemSetting" WHERE "key" = $1', [key])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin DELETE settings error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
