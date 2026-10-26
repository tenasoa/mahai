/**
 * Stockage des fichiers (avatars, images de l'éditeur, images du blog) sur Cloudflare R2.
 *
 * Deux accès au même bucket :
 * - sur Workers (et `next dev` via initOpenNextCloudflareForDev) : le binding R2 `FILES` ;
 * - ailleurs (Vercel, scripts Node) : l'API S3 de R2, avec R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
 *   R2_SECRET_ACCESS_KEY et R2_BUCKET.
 *
 * Les URLs publiques pointent vers R2_PUBLIC_URL (domaine public du bucket) si elle est
 * définie, sinon vers la route `/files/<clé>` de l'application.
 */
import { AwsClient } from 'aws4fetch'

// Sous-ensemble de l'API R2Bucket utilisé ici (les types runtime de workerd ne sont pas chargés).
interface R2ObjectBodyLike {
  body: ReadableStream
  size: number
  httpEtag: string
  httpMetadata?: { contentType?: string }
}

interface R2BucketLike {
  put(
    key: string,
    value: ArrayBuffer,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>
  get(key: string): Promise<R2ObjectBodyLike | null>
  delete(key: string): Promise<void>
}

export interface StoredFile {
  body: ReadableStream
  contentType: string
  size: number
  etag: string | null
}

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

// Clés produites par l'application : segments ASCII simples, sans « .. ».
const KEY_PATTERN = /^[A-Za-z0-9_-][A-Za-z0-9._-]*(\/[A-Za-z0-9_-][A-Za-z0-9._-]*)*$/

export function isValidKey(key: string): boolean {
  return key.length > 0 && key.length <= 512 && KEY_PATTERN.test(key)
}

/**
 * Type réel d'une image d'après ses premiers octets. Le type annoncé par le navigateur
 * n'est pas fiable : seul le contenu décide de ce qu'on stocke et sert.
 */
export function detectImageType(bytes: Uint8Array): string | null {
  const starts = (sig: number[], offset = 0) =>
    bytes.length >= offset + sig.length && sig.every((b, i) => bytes[offset + i] === b)

  if (starts([0xff, 0xd8, 0xff])) return 'image/jpeg'
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png'
  if (starts([0x47, 0x49, 0x46, 0x38])) return 'image/gif'
  // RIFF....WEBP
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return 'image/webp'
  return null
}

export type ImageUpload =
  | { ok: true; data: ArrayBuffer; contentType: string; extension: string }
  | { ok: false; error: string }

/** Lit et valide une image envoyée par l'utilisateur (JPG, PNG, WebP ou GIF). */
export async function readImageUpload(file: File, maxBytes: number): Promise<ImageUpload> {
  if (file.size > maxBytes) {
    return { ok: false, error: `Fichier trop volumineux (max ${Math.round(maxBytes / 1024 / 1024)} Mo)` }
  }
  const data = await file.arrayBuffer()
  const contentType = detectImageType(new Uint8Array(data, 0, Math.min(16, data.byteLength)))
  if (!contentType) {
    return { ok: false, error: 'Type de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.' }
  }
  return { ok: true, data, contentType, extension: IMAGE_EXTENSIONS[contentType] }
}

function getBinding(): R2BucketLike | null {
  // Même lecture que getCloudflareContext() d'OpenNext, sans importer le paquet (qui tire
  // wrangler dans le bundle serveur) ni lever d'erreur hors de Workers.
  const context = (globalThis as Record<symbol, any>)[Symbol.for('__cloudflare-context__')]
  return (context?.env?.FILES as R2BucketLike | undefined) ?? null
}

function getS3(): { client: AwsClient; base: string } {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    throw new Error(
      'Stockage R2 non configuré : binding FILES absent et R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, ' +
        'R2_SECRET_ACCESS_KEY ou R2_BUCKET manquant',
    )
  }
  return {
    client: new AwsClient({
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      service: 's3',
      region: 'auto',
    }),
    base: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}`,
  }
}

function assertKey(key: string) {
  if (!isValidKey(key)) throw new Error(`Clé de stockage invalide : ${key}`)
}

export async function putFile(key: string, data: ArrayBuffer, contentType: string): Promise<void> {
  assertKey(key)
  const bucket = getBinding()
  if (bucket) {
    await bucket.put(key, data, { httpMetadata: { contentType } })
    return
  }

  const { client, base } = getS3()
  const res = await client.fetch(`${base}/${key}`, {
    method: 'PUT',
    body: data,
    headers: { 'Content-Type': contentType },
  })
  if (!res.ok) throw new Error(`Échec de l'envoi vers R2 (${res.status})`)
}

export async function getFile(key: string): Promise<StoredFile | null> {
  if (!isValidKey(key)) return null
  const bucket = getBinding()
  if (bucket) {
    const object = await bucket.get(key)
    if (!object) return null
    return {
      body: object.body,
      contentType: object.httpMetadata?.contentType ?? 'application/octet-stream',
      size: object.size,
      etag: object.httpEtag,
    }
  }

  const { client, base } = getS3()
  const res = await client.fetch(`${base}/${key}`)
  if (res.status === 404) return null
  if (!res.ok || !res.body) throw new Error(`Échec de la lecture sur R2 (${res.status})`)
  return {
    body: res.body,
    contentType: res.headers.get('content-type') ?? 'application/octet-stream',
    size: Number(res.headers.get('content-length') ?? 0),
    etag: res.headers.get('etag'),
  }
}

export async function deleteFile(key: string): Promise<void> {
  assertKey(key)
  const bucket = getBinding()
  if (bucket) {
    await bucket.delete(key)
    return
  }

  const { client, base } = getS3()
  const res = await client.fetch(`${base}/${key}`, { method: 'DELETE' })
  if (!res.ok && res.status !== 404) throw new Error(`Échec de la suppression sur R2 (${res.status})`)
}

function publicBase(): string | null {
  const base = process.env.R2_PUBLIC_URL?.trim().replace(/\/+$/, '')
  return base || null
}

export function publicUrl(key: string): string {
  return `${publicBase() ?? '/files'}/${key}`
}

/**
 * Clé R2 d'une URL produite par publicUrl(), ou null si l'URL n'est pas à nous
 * (anciennes URLs Vercel Blob ou Supabase Storage, liens externes).
 */
export function keyFromUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const base = publicBase()
  let key: string | null = null
  if (url.startsWith('/files/')) key = url.slice('/files/'.length)
  else if (base && url.startsWith(`${base}/`)) key = url.slice(base.length + 1)
  return key && isValidKey(key) ? key : null
}
