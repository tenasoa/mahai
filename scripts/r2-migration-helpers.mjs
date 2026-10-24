// Fonctions pures du script migrate-files-to-r2.mjs (testées dans __tests__/r2-migration.test.ts).

// Anciennes URLs publiques : Vercel Blob et Supabase Storage.
export const LEGACY_URL_PATTERN =
  "https://[a-z0-9-]+\\.public\\.blob\\.vercel-storage\\.com/[^\"'\\s)<>\\\\]+" +
  "|https://[a-z0-9]+\\.supabase\\.co/storage/v1/object/public/[^\"'\\s)<>\\\\]+"

const SUPABASE_PREFIX = '/storage/v1/object/public/'

function sanitizeSegment(segment) {
  const clean = segment.replace(/[^A-Za-z0-9._-]/g, '-').replace(/^\./, '_')
  return clean || '_'
}

/**
 * Clé R2 pour une ancienne URL, au même format que lib/storage.ts.
 * Vercel Blob : chemin conservé (avatars/…, editor-images/…).
 * Supabase : <bucket>/<chemin> (profiles/…, images/blog-content/…).
 */
export function legacyUrlToKey(url) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  let path
  if (parsed.hostname.endsWith('.public.blob.vercel-storage.com')) {
    path = parsed.pathname.slice(1)
  } else if (parsed.hostname.endsWith('.supabase.co') && parsed.pathname.startsWith(SUPABASE_PREFIX)) {
    path = parsed.pathname.slice(SUPABASE_PREFIX.length)
  } else {
    return null
  }
  const segments = path
    .split('/')
    .filter(Boolean)
    .map((s) => {
      try {
        return decodeURIComponent(s)
      } catch {
        return s
      }
    })
    .map(sanitizeSegment)
  if (segments.length === 0) return null
  return segments.join('/')
}

/** Associe chaque URL à une clé unique (suffixe -2, -3… en cas de collision après nettoyage). */
export function buildKeyMap(urls) {
  const map = new Map()
  const used = new Set()
  for (const url of [...new Set(urls)].sort()) {
    const base = legacyUrlToKey(url)
    if (!base) continue
    let key = base
    for (let n = 2; used.has(key); n++) {
      const dot = base.lastIndexOf('.')
      const slash = base.lastIndexOf('/')
      key = dot > slash ? `${base.slice(0, dot)}-${n}${base.slice(dot)}` : `${base}-${n}`
    }
    used.add(key)
    map.set(url, key)
  }
  return map
}

export function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`
}

/** UPDATE qui remplace une URL par une autre dans une colonne texte ou JSON. */
export function replaceStatement(table, column, dataType) {
  const col = quoteIdent(column)
  const isJson = dataType === 'json' || dataType === 'jsonb'
  const value = isJson ? `replace(${col}::text, $1, $2)::${dataType}` : `replace(${col}, $1, $2)`
  return `UPDATE ${quoteIdent(table)} SET ${col} = ${value} WHERE strpos(${col}::text, $1) > 0`
}
