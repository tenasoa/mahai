import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { requireAdmin, isAuthFailure } from '@/lib/auth-guards'
import { publicUrl, putFile, readImageUpload } from '@/lib/storage'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB, sous la limite de corps des requêtes

// Images insérées dans les articles du blog (éditeur RichTextEditor, admin uniquement).
export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin()
    if (isAuthFailure(guard)) {
      return NextResponse.json({ error: guard.error }, { status: guard.status })
    }

    const formData = await req.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
    }

    const upload = await readImageUpload(file, MAX_SIZE)
    if (!upload.ok) {
      return NextResponse.json({ error: upload.error }, { status: 400 })
    }

    const key = `blog/${crypto.randomUUID()}.${upload.extension}`
    await putFile(key, upload.data, upload.contentType)

    return NextResponse.json({ success: true, url: publicUrl(key) })
  } catch (error) {
    console.error('admin upload-image error:', error)
    return NextResponse.json({ error: 'Erreur d\'upload' }, { status: 500 })
  }
}
