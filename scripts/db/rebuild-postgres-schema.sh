#!/bin/bash
# Reconstruit le schéma Postgres de Mah.AI en rejouant les fichiers SQL du dépôt sur un Postgres
# local jetable, puis écrit db/reference/postgres-schema.sql et db/reference/postgres-catalog.json.
# Ces deux fichiers servent à générer le schéma D1 : python3 scripts/db/gen-drizzle-schema.py
#
#   scripts/db/rebuild-postgres-schema.sh <dossier-de-travail>
#
# Prérequis : binaires Postgres 16 (PG_BIN, par défaut /usr/lib/postgresql/16/bin). Lancé en root,
# le serveur tourne sous l'utilisateur postgres : le dossier de travail doit lui être accessible.
#
# Les migrations n'ont jamais été tenues dans un ordre unique ; l'ordre ci-dessous est celui qui
# reproduit toutes les tables utilisées par le code. Deux fichiers sont rejoués corrigés
# (scripts/db/patches) : leurs clés étrangères UUID visent "User".id qui est en TEXT.
set -u
R="$(cd "$(dirname "$0")/../.." && pwd)"
W="${1:?dossier de travail requis}"
PG_BIN="${PG_BIN:-/usr/lib/postgresql/16/bin}"
PORT="${PGPORT_REBUILD:-5499}"
# Le chemin du socket Unix est limité à 107 caractères : PG_SOCKET_DIR permet d'en choisir un court.
D="$W/pgdata"; S="${PG_SOCKET_DIR:-$W/pgsock}"
run() { if [ "$(id -u)" = 0 ]; then su postgres -s /bin/bash -c "$*"; else bash -c "$*"; fi; }

rm -rf "$D" "$S"; mkdir -p "$D" "$S"
[ "$(id -u)" = 0 ] && chown postgres "$D" "$S"
run "$PG_BIN/initdb -D $D -A trust >/dev/null && $PG_BIN/pg_ctl -D $D -o '-p $PORT -k $S' -l $D/log -w start >/dev/null" \
  || { echo "Postgres n'a pas démarré"; exit 1; }
P="psql -h $S -p $PORT -U postgres -d postgres -q"

# Bouchons des schémas fournis par Supabase (auth, storage, rôles)
$P >/dev/null 2>&1 <<'SQL'
CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
CREATE SCHEMA auth;
CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb, created_at timestamptz DEFAULT now(), email_confirmed_at timestamptz);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS 'SELECT NULL::uuid';
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS 'SELECT NULL::text';
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql AS 'SELECT NULL::jsonb';
CREATE SCHEMA storage;
CREATE TABLE storage.buckets (id text PRIMARY KEY, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
CREATE TABLE storage.objects (id uuid, bucket_id text, name text, owner uuid);
CREATE EXTENSION IF NOT EXISTS pgcrypto; CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SQL

FILES="$(cd "$R/migrations_manual" && ls 00_complete_schema.sql 01_structure.sql 01_add_user_profile_fields.sql 03_rls_policies.sql 08_*.sql 09_*.sql | sed "s#^#$R/migrations_manual/#")
$(ls "$R"/migrations/*.sql | sort | sed -E "s#.*/(008_add_admin_credit_fields|013_add_referral_program)\.sql#$R/scripts/db/patches/\1.sql#")
$(cd "$R/migrations_manual" && ls 01[0-9]_*.sql 02[0-9]_*.sql | sed "s#^#$R/migrations_manual/#")
$(ls "$R"/supabase/migrations/*.sql | sort)
$R/scripts/db/patches/20260505_drops.sql"

for f in $FILES; do
  errors=$($P -v ON_ERROR_STOP=0 -f "$f" 2>&1 | grep -E "ERROR" | grep -v "current transaction is aborted" | head -3)
  [ -n "$errors" ] && { echo "== $(basename "$f")"; echo "$errors"; }
done

run "$PG_BIN/pg_dump -h $S -p $PORT -U postgres -d postgres --schema-only --schema=public --no-owner --no-privileges" > "$W/schema.sql" \
  || { echo "pg_dump a échoué"; exit 1; }
psql -h "$S" -p "$PORT" -U postgres -d postgres -At > "$W/catalog.json" <<'SQL'
SELECT json_build_object(
 'columns', (SELECT json_agg(json_build_object('t',c.table_name,'c',c.column_name,'type',c.data_type,'udt',c.udt_name,'null',c.is_nullable='YES','def',c.column_default,'pos',c.ordinal_position) ORDER BY c.table_name,c.ordinal_position) FROM information_schema.columns c WHERE c.table_schema='public' AND c.table_name IN (SELECT tablename FROM pg_tables WHERE schemaname='public')),
 'constraints', (SELECT json_agg(json_build_object('t',cl.relname,'name',co.conname,'type',co.contype,'def',pg_get_constraintdef(co.oid)) ORDER BY cl.relname,co.conname) FROM pg_constraint co JOIN pg_class cl ON cl.oid=co.conrelid JOIN pg_namespace n ON n.oid=cl.relnamespace WHERE n.nspname='public'),
 'indexes', (SELECT json_agg(json_build_object('t',tablename,'name',indexname,'def',indexdef) ORDER BY tablename,indexname) FROM pg_indexes WHERE schemaname='public'),
 'enums', (SELECT json_object_agg(t.typname, (SELECT json_agg(e.enumlabel ORDER BY e.enumsortorder) FROM pg_enum e WHERE e.enumtypid=t.oid)) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
)
SQL
# Les fichiers de référence ne sont remplacés qu'une fois tout généré
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); json.dump(d, open(sys.argv[2],'w'), indent=1, ensure_ascii=False)" "$W/catalog.json" "$W/catalog.pretty.json" \
  || { echo "Catalogue illisible"; exit 1; }
mv "$W/schema.sql" "$R/db/reference/postgres-schema.sql"
mv "$W/catalog.pretty.json" "$R/db/reference/postgres-catalog.json"
run "$PG_BIN/pg_ctl -D $D stop >/dev/null"
echo "Tables : $(grep -c '^CREATE TABLE' "$R/db/reference/postgres-schema.sql")"
