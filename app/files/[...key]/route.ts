import { getFile } from '@/lib/storage'

/**
 * Sert un fichier du bucket R2 quand il n'a pas de domaine public (R2_PUBLIC_URL absent),
 * par exemple en local. Les clés contiennent un identifiant aléatoire : le contenu d'une
 * URL ne change jamais, d'où le cache « immutable ».
 */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params
  const file = await getFile(key.join('/'))
  if (!file) return new Response('Fichier introuvable', { status: 404 })

  const isImage = file.contentType.startsWith('image/') && file.contentType !== 'image/svg+xml'
  const headers = new Headers({
    'Content-Type': isImage ? file.contentType : 'application/octet-stream',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  })
  if (!isImage) headers.set('Content-Disposition', 'attachment')
  if (file.size) headers.set('Content-Length', String(file.size))
  if (file.etag) headers.set('ETag', file.etag)

  return new Response(file.body, { headers })
}
