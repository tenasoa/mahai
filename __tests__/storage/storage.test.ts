/**
 * @jest-environment node
 */
import {
  deleteFile,
  detectImageType,
  getFile,
  isValidKey,
  keyFromUrl,
  publicUrl,
  putFile,
  readImageUpload,
} from '@/lib/storage'

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]
const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0, 0]
const GIF = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]
const WEBP = [0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50]
const CONTEXT = Symbol.for('__cloudflare-context__')
const R2_VARS = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'R2_PUBLIC_URL']

const bytes = (values: number[]) => new Uint8Array(values)

afterEach(() => {
  delete (globalThis as any)[CONTEXT]
  for (const name of R2_VARS) delete process.env[name]
  jest.restoreAllMocks()
})

describe('detectImageType', () => {
  it('reconnaît JPG, PNG, GIF et WebP à leurs premiers octets', () => {
    expect(detectImageType(bytes(JPEG))).toBe('image/jpeg')
    expect(detectImageType(bytes(PNG))).toBe('image/png')
    expect(detectImageType(bytes(GIF))).toBe('image/gif')
    expect(detectImageType(bytes(WEBP))).toBe('image/webp')
  })

  it('refuse le reste, dont le SVG et le HTML', () => {
    const text = (s: string) => new TextEncoder().encode(s)
    expect(detectImageType(text('<svg xmlns="http://www.w3.org/2000/svg">'))).toBeNull()
    expect(detectImageType(text('<html><script>alert(1)</script>'))).toBeNull()
    expect(detectImageType(bytes([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x41, 0x56, 0x49, 0x20]))).toBeNull()
    expect(detectImageType(bytes([]))).toBeNull()
  })
})

describe('isValidKey', () => {
  it('accepte les clés produites par l’application', () => {
    expect(isValidKey('avatars/u-1/0b7c.png')).toBe(true)
    expect(isValidKey('editor-images/u/sub_1/a.webp')).toBe(true)
  })

  it('refuse les chemins relatifs, vides ou cachés', () => {
    for (const key of ['', '../etc/passwd', 'a/../b', 'a//b', '/a', 'a/', '.env', 'a/.x', 'a b', 'a\\b']) {
      expect(isValidKey(key)).toBe(false)
    }
    expect(isValidKey('a'.repeat(513))).toBe(false)
  })
})

describe('publicUrl / keyFromUrl', () => {
  it('passe par la route /files sans domaine public', () => {
    expect(publicUrl('blog/x.png')).toBe('/files/blog/x.png')
    expect(keyFromUrl('/files/blog/x.png')).toBe('blog/x.png')
  })

  it('utilise R2_PUBLIC_URL quand elle est définie', () => {
    process.env.R2_PUBLIC_URL = 'https://files.mahai.mg/'
    expect(publicUrl('blog/x.png')).toBe('https://files.mahai.mg/blog/x.png')
    expect(keyFromUrl('https://files.mahai.mg/blog/x.png')).toBe('blog/x.png')
    // Les URLs relatives déjà enregistrées restent reconnues
    expect(keyFromUrl('/files/blog/x.png')).toBe('blog/x.png')
  })

  it('ignore les URLs qui ne viennent pas du bucket', () => {
    process.env.R2_PUBLIC_URL = 'https://files.mahai.mg'
    expect(keyFromUrl(null)).toBeNull()
    expect(keyFromUrl('https://abc.public.blob.vercel-storage.com/avatars/u/avatar.png')).toBeNull()
    expect(keyFromUrl('https://files.mahai.mg.evil.com/x.png')).toBeNull()
    expect(keyFromUrl('/files/../secret')).toBeNull()
  })
})

describe('readImageUpload', () => {
  it('se fie au contenu, pas au type annoncé', async () => {
    const upload = await readImageUpload(new File([bytes(PNG)], 'x.txt', { type: 'text/plain' }), 1024)
    expect(upload).toMatchObject({ ok: true, contentType: 'image/png', extension: 'png' })
  })

  it('refuse un faux PNG', async () => {
    const file = new File(['<svg onload="alert(1)"/>'], 'x.png', { type: 'image/png' })
    expect(await readImageUpload(file, 1024)).toEqual({ ok: false, error: expect.stringContaining('non supporté') })
  })

  it('refuse un fichier trop lourd', async () => {
    const file = new File([new Uint8Array(2 * 1024 * 1024)], 'x.png', { type: 'image/png' })
    expect(await readImageUpload(file, 1024 * 1024)).toEqual({ ok: false, error: 'Fichier trop volumineux (max 1 Mo)' })
  })
})

describe('binding R2 (Workers)', () => {
  function installBucket() {
    const bucket = {
      put: jest.fn().mockResolvedValue({}),
      get: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    }
    ;(globalThis as any)[CONTEXT] = { env: { FILES: bucket } }
    return bucket
  }

  it('écrit, lit et supprime via le binding FILES', async () => {
    const bucket = installBucket()
    const data = bytes(PNG).buffer
    await putFile('blog/a.png', data, 'image/png')
    expect(bucket.put).toHaveBeenCalledWith('blog/a.png', data, { httpMetadata: { contentType: 'image/png' } })

    const body = new ReadableStream()
    bucket.get.mockResolvedValueOnce({ body, size: 12, httpEtag: '"e"', httpMetadata: { contentType: 'image/png' } })
    expect(await getFile('blog/a.png')).toEqual({ body, contentType: 'image/png', size: 12, etag: '"e"' })

    bucket.get.mockResolvedValueOnce(null)
    expect(await getFile('blog/absent.png')).toBeNull()

    await deleteFile('blog/a.png')
    expect(bucket.delete).toHaveBeenCalledWith('blog/a.png')
  })

  it('refuse une clé invalide sans toucher au bucket', async () => {
    const bucket = installBucket()
    await expect(putFile('../x', new ArrayBuffer(1), 'image/png')).rejects.toThrow('Clé de stockage invalide')
    await expect(getFile('../x')).resolves.toBeNull()
    expect(bucket.put).not.toHaveBeenCalled()
    expect(bucket.get).not.toHaveBeenCalled()
  })
})

describe('API S3 de R2 (hors Workers)', () => {
  function configure() {
    process.env.R2_ACCOUNT_ID = 'acc'
    process.env.R2_ACCESS_KEY_ID = 'key'
    process.env.R2_SECRET_ACCESS_KEY = 'secret'
    process.env.R2_BUCKET = 'mahai-assets'
  }

  it('signe les requêtes vers le bon bucket', async () => {
    configure()
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))
    await putFile('blog/a.png', bytes(PNG).buffer, 'image/png')

    const request = fetchMock.mock.calls[0][0] as Request
    expect(request.method).toBe('PUT')
    expect(request.url).toBe('https://acc.r2.cloudflarestorage.com/mahai-assets/blog/a.png')
    expect(request.headers.get('authorization')).toMatch(/^AWS4-HMAC-SHA256 Credential=key\//)
    expect(request.headers.get('content-type')).toBe('image/png')
  })

  it('renvoie null pour un fichier absent et accepte de supprimer un absent', async () => {
    configure()
    jest.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('', { status: 404 }))
    await expect(getFile('blog/absent.png')).resolves.toBeNull()
    await expect(deleteFile('blog/absent.png')).resolves.toBeUndefined()
  })

  it('remonte les erreurs de R2', async () => {
    configure()
    jest.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('', { status: 403 }))
    await expect(putFile('blog/a.png', new ArrayBuffer(1), 'image/png')).rejects.toThrow('403')
  })

  it('explique ce qui manque quand rien n’est configuré', async () => {
    await expect(putFile('blog/a.png', new ArrayBuffer(1), 'image/png')).rejects.toThrow('Stockage R2 non configuré')
  })
})
