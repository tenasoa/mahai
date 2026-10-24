#!/usr/bin/env node
/**
 * Phase 2 : copie les fichiers de Vercel Blob et Supabase Storage vers R2, puis réécrit leurs
 * URLs partout en base (toutes les colonnes texte et JSON du schéma public).
 *
 *   node --env-file=.env scripts/migrate-files-to-r2.mjs            # inventaire, ne change rien
 *   node --env-file=.env scripts/migrate-files-to-r2.mjs --apply    # copie puis réécrit
 *   node --env-file=.env scripts/migrate-files-to-r2.mjs --rollback r2-migration-<date>.json
 *
 * Variables : DIRECT_URL, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
 * R2_PUBLIC_URL (recommandée : sans elle, les nouvelles URLs sont relatives, /files/<clé>).
 *
 * Les fichiers d'origine ne sont pas supprimés. --apply écrit la correspondance des URLs dans
 * r2-migration-<date>.json, que --rollback utilise pour remettre les anciennes URLs.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import pg from 'pg'
import { AwsClient } from 'aws4fetch'
import { LEGACY_URL_PATTERN, buildKeyMap, quoteIdent, replaceStatement } from './r2-migration-helpers.mjs'

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const rollbackIndex = args.indexOf('--rollback')
const rollbackFile = rollbackIndex >= 0 ? args[rollbackIndex + 1] : null

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    console.error(`Variable manquante : ${name}`)
    process.exit(1)
  }
  return value
}

async function textColumns(client) {
  const { rows } = await client.query(`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('text', 'character varying', 'json', 'jsonb')
    ORDER BY table_name, column_name`)
  return rows
}

// Remplace chaque URL par sa nouvelle valeur, dans une transaction. Les URLs les plus longues
// passent d'abord, pour qu'une URL préfixe d'une autre ne corrompe pas la seconde.
async function rewrite(client, columns, mapping) {
  const pairs = [...mapping].sort((a, b) => b[0].length - a[0].length)
  let updated = 0
  await client.query('BEGIN')
  try {
    for (const { table_name, column_name, data_type } of columns) {
      const sql = replaceStatement(table_name, column_name, data_type)
      for (const [from, to] of pairs) {
        const res = await client.query(sql, [from, to])
        if (res.rowCount) {
          updated += res.rowCount
          console.log(`  ${table_name}.${column_name} : ${res.rowCount} ligne(s) pour ${from}`)
        }
      }
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
  return updated
}

async function main() {
  const client = new pg.Client({ connectionString: requireEnv('DIRECT_URL') })
  await client.connect()
  try {
    const columns = await textColumns(client)

    if (rollbackFile) {
      const saved = JSON.parse(readFileSync(rollbackFile, 'utf8'))
      const reverse = new Map(Object.entries(saved).map(([from, to]) => [to, from]))
      console.log(`Retour arrière : ${reverse.size} URL(s)`)
      const updated = await rewrite(client, columns, reverse)
      console.log(`Terminé : ${updated} mise(s) à jour.`)
      return
    }

    // 1. Inventaire des anciennes URLs
    const found = new Map() // url -> ["Table.colonne", …]
    for (const { table_name, column_name } of columns) {
      const col = quoteIdent(column_name)
      const { rows } = await client.query(
        `SELECT DISTINCT (regexp_matches(${col}::text, $1, 'g'))[1] AS url
         FROM ${quoteIdent(table_name)} WHERE ${col} IS NOT NULL`,
        [`(${LEGACY_URL_PATTERN})`],
      )
      for (const { url } of rows) {
        const where = found.get(url) ?? []
        where.push(`${table_name}.${column_name}`)
        found.set(url, where)
      }
    }

    const keys = buildKeyMap([...found.keys()])
    console.log(`${found.size} URL(s) trouvée(s), ${keys.size} à copier.`)
    for (const [url, where] of found) {
      console.log(`  ${keys.get(url) ?? '(ignorée)'}  ←  ${url}  [${where.join(', ')}]`)
    }
    if (!apply) {
      console.log('\nInventaire seulement. Relancer avec --apply pour copier et réécrire.')
      return
    }

    // 2. Copie vers R2
    const r2 = new AwsClient({
      accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
      service: 's3',
      region: 'auto',
    })
    const base = `https://${requireEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com/${requireEnv('R2_BUCKET')}`
    const publicBase = (process.env.R2_PUBLIC_URL ?? '').trim().replace(/\/+$/, '') || '/files'

    const mapping = new Map()
    const failures = []
    for (const [url, key] of keys) {
      try {
        const source = await fetch(url)
        if (!source.ok) throw new Error(`téléchargement ${source.status}`)
        const body = await source.arrayBuffer()
        const put = await r2.fetch(`${base}/${key}`, {
          method: 'PUT',
          body,
          headers: { 'Content-Type': source.headers.get('content-type') ?? 'application/octet-stream' },
        })
        if (!put.ok) throw new Error(`envoi R2 ${put.status}`)
        mapping.set(url, `${publicBase}/${key}`)
        console.log(`  copié  ${key}`)
      } catch (error) {
        failures.push(url)
        console.error(`  ÉCHEC  ${url} : ${error.message}`)
      }
    }

    // 3. Réécriture des URLs copiées (les échecs gardent leur ancienne URL)
    const file = `r2-migration-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    writeFileSync(file, JSON.stringify(Object.fromEntries(mapping), null, 2))
    console.log(`\nCorrespondance enregistrée dans ${file}`)
    const updated = await rewrite(client, columns, mapping)
    console.log(`Terminé : ${mapping.size} fichier(s) copié(s), ${updated} mise(s) à jour, ${failures.length} échec(s).`)
    if (failures.length) process.exitCode = 1
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
