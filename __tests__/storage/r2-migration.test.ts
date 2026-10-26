/**
 * @jest-environment node
 */
import { buildKeyMap, legacyUrlToKey, replaceStatement } from '../../scripts/r2-migration-helpers.mjs'

describe('legacyUrlToKey', () => {
  it('garde le chemin des URLs Vercel Blob', () => {
    expect(legacyUrlToKey('https://abc123.public.blob.vercel-storage.com/avatars/u-1/avatar.png')).toBe(
      'avatars/u-1/avatar.png',
    )
  })

  it('préfixe les URLs Supabase par leur bucket', () => {
    expect(
      legacyUrlToKey('https://xyz.supabase.co/storage/v1/object/public/images/blog-content/a1-17.png'),
    ).toBe('images/blog-content/a1-17.png')
  })

  it('nettoie les caractères hors du format des clés', () => {
    expect(legacyUrlToKey('https://xyz.supabase.co/storage/v1/object/public/profiles/u/mon%20image%C3%A9.png')).toBe(
      'profiles/u/mon-image-.png',
    )
    expect(legacyUrlToKey('https://abc.public.blob.vercel-storage.com/.hidden')).toBe('_hidden')
  })

  it('ignore les autres URLs', () => {
    expect(legacyUrlToKey('https://lh3.googleusercontent.com/a/photo.jpg')).toBeNull()
    expect(legacyUrlToKey('https://xyz.supabase.co/auth/v1/user')).toBeNull()
    expect(legacyUrlToKey('pas une url')).toBeNull()
  })
})

describe('buildKeyMap', () => {
  it('rend les clés uniques après nettoyage', () => {
    const map = buildKeyMap([
      'https://xyz.supabase.co/storage/v1/object/public/profiles/u/a b.png',
      'https://xyz.supabase.co/storage/v1/object/public/profiles/u/a%20b.png',
      'https://xyz.supabase.co/storage/v1/object/public/profiles/u/a-b.png',
      'https://lh3.googleusercontent.com/x.png',
    ])
    expect([...map.values()].sort()).toEqual(['profiles/u/a-b-2.png', 'profiles/u/a-b-3.png', 'profiles/u/a-b.png'])
    expect(map.has('https://lh3.googleusercontent.com/x.png')).toBe(false)
  })
})

describe('replaceStatement', () => {
  it('cite les identifiants et recaste les colonnes JSON', () => {
    expect(replaceStatement('User', 'profilePicture', 'text')).toBe(
      'UPDATE "User" SET "profilePicture" = replace("profilePicture", $1, $2) WHERE strpos("profilePicture"::text, $1) > 0',
    )
    expect(replaceStatement('Subject', 'content', 'jsonb')).toBe(
      'UPDATE "Subject" SET "content" = replace("content"::text, $1, $2)::jsonb WHERE strpos("content"::text, $1) > 0',
    )
    expect(replaceStatement('a"b', 'c', 'text')).toContain('"a""b"')
  })
})
