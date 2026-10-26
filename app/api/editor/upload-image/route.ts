import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireRole, isAuthFailure } from '@/lib/auth-guards'
import { deleteFile, keyFromUrl, publicUrl, putFile, readImageUpload } from '@/lib/storage'
import crypto from 'crypto'

// SVG volontairement exclu : un SVG peut embarquer du <script> et provoquer
// un XSS s'il est ouvert directement. Seuls les formats raster sont acceptés,
// vérifiés sur le contenu du fichier (readImageUpload).
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(req: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────
    const guard = await requireRole(['CONTRIBUTEUR', 'ADMIN', 'PROFESSEUR'])
    if (isAuthFailure(guard)) {
      return NextResponse.json({ error: guard.error }, { status: guard.status })
    }
    const userId = guard.userId

    // ── Parse multipart form ────────────────────────────────────────
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const submissionId = formData.get('submissionId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
    }

    // ── Validation ──────────────────────────────────────────────────
    const upload = await readImageUpload(file, MAX_SIZE)
    if (!upload.ok) {
      return NextResponse.json({ error: upload.error }, { status: 400 })
    }

    // ── Upload vers R2 ──────────────────────────────────────────────
    const uniqueName = `${crypto.randomUUID()}.${upload.extension}`
    const key = submissionId
      ? `editor-images/${userId}/${submissionId}/${uniqueName}`
      : `editor-images/${userId}/unsaved/${uniqueName}`

    await putFile(key, upload.data, upload.contentType)
    const url = publicUrl(key)

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
            userId,
            url,
            file.name,
            upload.contentType,
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
      url,
      pathname: key,
      filename: file.name,
      size: file.size,
      mimeType: upload.contentType,
    })
  } catch (error) {
    console.error('upload-image error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur d\'upload' },
      { status: 500 }
    )
  }
}

// Méthode DELETE — supprimer une image de R2
export async function DELETE(req: NextRequest) {
  try {
    const guard = await requireRole(['CONTRIBUTEUR', 'ADMIN', 'PROFESSEUR'])
    if (isAuthFailure(guard)) {
      return NextResponse.json({ error: guard.error }, { status: guard.status })
    }

    const { url } = await req.json() as { url?: string }
    if (!url) return NextResponse.json({ error: 'URL manquante' }, { status: 400 })

    // Seules les images de l'éditeur stockées sur R2 se suppriment ici
    // (pas les anciennes URLs Vercel Blob, ni les avatars ou le blog).
    const key = keyFromUrl(url)
    if (!key || !key.startsWith('editor-images/')) {
      return NextResponse.json({ error: 'URL non gérée' }, { status: 400 })
    }

    // ── Contrôle de propriété (anti-IDOR) ───────────────────────────
    // Les images sont stockées sous `editor-images/{userId}/...`. On
    // n'autorise la suppression que si la clé appartient à l'utilisateur,
    // ou si une ligne SubjectImage le désigne comme auteur, ou s'il est
    // ADMIN. Sinon un utilisateur pourrait supprimer les images d'autrui.
    let isOwner = key.startsWith(`editor-images/${guard.userId}/`)
    if (!isOwner && guard.role !== 'ADMIN') {
      try {
        const owned = await query(
          'SELECT 1 FROM "SubjectImage" WHERE url = $1 AND "authorId" = $2 LIMIT 1',
          [url, guard.userId],
        )
        isOwner = owned.rows.length > 0
      } catch { /* table absente — on retombe sur le refus */ }
    }
    if (!isOwner && guard.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    await deleteFile(key)

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
