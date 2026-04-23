import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import crypto from 'crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

function getBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN non configuré')
  return token
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const userRes = await query('SELECT id, role FROM "User" WHERE id = $1', [session.user.id])
    const user = userRes.rows[0]

    if (!user || !['CONTRIBUTEUR', 'ADMIN', 'PROFESSEUR'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // ── Parse multipart form ────────────────────────────────────────
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const submissionId = formData.get('submissionId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
    }

    // ── Validation ──────────────────────────────────────────────────
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Type non supporté. Formats acceptés : JPG, PNG, WebP, GIF, SVG.` },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (max 10 Mo, reçu ${(file.size / 1024 / 1024).toFixed(1)} Mo)` },
        { status: 400 }
      )
    }

    // ── Upload vers Vercel Blob ──────────────────────────────────────
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const uniqueName = `${crypto.randomUUID()}.${ext}`
    const blobPath = submissionId
      ? `editor-images/${user.id}/${submissionId}/${uniqueName}`
      : `editor-images/${user.id}/unsaved/${uniqueName}`

    const blob = await put(blobPath, file, {
      access: 'public',
      token: getBlobToken(),
      contentType: file.type,
    })

    // ── Log dans SubjectImage (best-effort) ─────────────────────────
    if (submissionId) {
      try {
        await query(
          `INSERT INTO "SubjectImage" (id, "submissionId", "authorId", url, filename, "mimeType", size)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING`,
          [
            crypto.randomUUID(),
            submissionId,
            user.id,
            blob.url,
            file.name,
            file.type,
            file.size,
          ]
        )
      } catch (e) {
        // Table may not exist yet — silencieux, l'upload est quand même valide
        console.warn('SubjectImage insert skipped:', (e as Error).message)
      }
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
    })
  } catch (error) {
    console.error('upload-image error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur d\'upload' },
      { status: 500 }
    )
  }
}

// Méthode DELETE — supprimer une image Vercel Blob
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { url } = await req.json() as { url?: string }
    if (!url) return NextResponse.json({ error: 'URL manquante' }, { status: 400 })

    const { del } = await import('@vercel/blob')
    await del(url, { token: getBlobToken() })

    // Supprimer de SubjectImage si existant
    try {
      await query('DELETE FROM "SubjectImage" WHERE url = $1', [url])
    } catch { /* ignore */ }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('delete-image error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur suppression' },
      { status: 500 }
    )
  }
}
