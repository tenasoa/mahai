"""Génère db/schema.ts (Drizzle, SQLite/D1) depuis le catalogue Postgres reconstruit.

    python3 scripts/db/gen-drizzle-schema.py db/reference/postgres-catalog.json db/schema.ts

Le catalogue vient de scripts/db/rebuild-postgres-schema.sh.
"""
import json
import re
import sys

catalog = json.load(open(sys.argv[1]))
out_path = sys.argv[2]

enums = catalog['enums']
tables = {}
for c in catalog['columns']:
    tables.setdefault(c['t'], []).append(c)
constraints = {}
for c in catalog['constraints']:
    constraints.setdefault(c['t'], []).append(c)
indexes = {}
for i in catalog['indexes']:
    indexes.setdefault(i['t'], []).append(i)


def var_name(table):
    if table == 'User':
        return 'user'
    if '_' in table or table.islower():
        parts = table.split('_')
        return parts[0] + ''.join(p.title() for p in parts[1:])
    return table[0].lower() + table[1:]


def js_key(col):
    return col if re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*', col) else json.dumps(col)


def strip_casts(expr):
    expr = re.sub(r'::(text|character varying|integer|jsonb|"?[A-Za-z]+"?)(\[\])?', '', expr)
    return expr


def check_to_sqlite(definition):
    m = re.fullmatch(r'CHECK \((.*)\)', definition)
    expr = m.group(1) if m else definition
    expr = strip_casts(expr)
    # x = ANY (ARRAY['a', 'b'])  ->  x IN ('a', 'b')
    expr = re.sub(r'\(?\(?([A-Za-z_"]+)\)? = ANY \(\(?ARRAY\[([^\]]*)\]\)?\)\)?', r'\1 IN (\2)', expr)
    return expr


def default_expr(col):
    d = col['def']
    if d is None:
        return ''
    udt = col['udt']
    if d in ('now()', 'CURRENT_TIMESTAMP'):
        return ".default(sql`(cast(unixepoch('subsec') * 1000 as integer))`)"
    if d == 'CURRENT_DATE':
        return ".default(sql`(date('now'))`)"
    if 'gen_random_uuid()' in d:
        return '.$defaultFn(() => crypto.randomUUID())'
    if d in ('true', 'false'):
        return f'.default({d})'
    if re.fullmatch(r'-?\d+(\.\d+)?', d):
        return f'.default({d})'
    m = re.fullmatch(r"'(.*)'::(.+)", d)
    if m:
        value, cast = m.group(1), m.group(2)
        if cast in ('jsonb', 'json'):
            return f".default(sql`'{value}'`)"
        if cast.endswith('[]'):
            return ".default(sql`'[]'`)"
        return f'.default({json.dumps(value)})'
    raise ValueError(f'défaut non géré : {col["t"]}.{col["c"]} = {d}')


def column_expr(col):
    name = col['c']
    udt = col['udt']
    if col['type'] == 'USER-DEFINED':
        values = ', '.join(json.dumps(v) for v in enums[udt])
        base = f"text({json.dumps(name)}, {{ enum: [{values}] }})"
    elif udt in ('text', 'varchar', 'bpchar', 'uuid', 'date'):
        base = f'text({json.dumps(name)})'
    elif udt in ('int4', 'int2', 'int8'):
        base = f'integer({json.dumps(name)})'
    elif udt == 'bool':
        base = f"integer({json.dumps(name)}, {{ mode: 'boolean' }})"
    elif udt == 'float8':
        base = f'real({json.dumps(name)})'
    elif udt in ('timestamptz', 'timestamp'):
        base = f"integer({json.dumps(name)}, {{ mode: 'timestamp_ms' }})"
    elif udt in ('jsonb', 'json'):
        base = f"text({json.dumps(name)}, {{ mode: 'json' }})"
    elif udt == '_text':
        base = f"text({json.dumps(name)}, {{ mode: 'json' }}).$type<string[]>()"
    else:
        raise ValueError(f'type non géré : {col["t"]}.{name} {udt}')
    return base


def parse_cols(text):
    return [c.strip().strip('"') for c in text.split(',')]


lines = [
    '// Généré par scripts/db/gen-drizzle-schema.py depuis db/reference/postgres-catalog.json (phase 3 du plan',
    '// docs/plans/2026-10-23-migration-cloudflare.md). Ne pas modifier à la main : corriger le générateur.',
    "// Les dates sont des millisecondes (Date côté JS), le JSON est stocké en texte, les booléens en 0/1.",
    "import { sql } from 'drizzle-orm'",
    'import {',
    '  sqliteTable,',
    '  text,',
    '  integer,',
    '  real,',
    '  index,',
    '  uniqueIndex,',
    '  primaryKey,',
    '  check,',
    '  type AnySQLiteColumn,',
    "} from 'drizzle-orm/sqlite-core'",
    '',
]

table_order = sorted(tables)
for table in table_order:
    cols = tables[table]
    cons = constraints.get(table, [])
    pk_cols = []
    for c in cons:
        if c['type'] == 'p':
            pk_cols = parse_cols(re.search(r'PRIMARY KEY \((.*)\)', c['def']).group(1))
    fks = {}
    for c in cons:
        if c['type'] == 'f':
            m = re.match(r'FOREIGN KEY \((.*?)\) REFERENCES "?([A-Za-z_]+)"?\((.*?)\)(.*)', c['def'])
            src = parse_cols(m.group(1))
            if len(src) != 1:
                raise ValueError(c)
            on_delete = re.search(r'ON DELETE (CASCADE|SET NULL|RESTRICT|NO ACTION|SET DEFAULT)', m.group(4))
            fks[src[0]] = (m.group(2), m.group(3).strip('"'), on_delete.group(1).lower() if on_delete else None)

    v = var_name(table)
    lines.append(f'export const {v} = sqliteTable(')
    lines.append(f'  {json.dumps(table)},')
    lines.append('  {')
    for col in cols:
        expr = column_expr(col)
        if len(pk_cols) == 1 and pk_cols[0] == col['c']:
            expr += '.primaryKey()'
        if not col['null'] and not (len(pk_cols) == 1 and pk_cols[0] == col['c']):
            expr += '.notNull()'
        expr += default_expr(col)
        if col['c'] == 'updatedAt' and col['def'] is None and col['udt'] in ('timestamptz', 'timestamp'):
            expr += ".default(sql`(cast(unixepoch('subsec') * 1000 as integer))`)"
        if col['c'] == 'updatedAt' and col['udt'] in ('timestamptz', 'timestamp'):
            expr += '.$onUpdate(() => new Date())'
        if col['c'] in fks:
            ref_table, ref_col, on_delete = fks[col['c']]
            opts = f", {{ onDelete: '{on_delete}' }}" if on_delete and on_delete != 'no action' else ''
            expr += f'.references((): AnySQLiteColumn => {var_name(ref_table)}.{js_key(ref_col)}{opts})'
        lines.append(f'    {js_key(col["c"])}: {expr},')
    lines.append('  },')

    extras = []
    if len(pk_cols) > 1:
        cols_js = ', '.join(f't.{js_key(c)}' for c in pk_cols)
        extras.append(f'primaryKey({{ columns: [{cols_js}] }})')
    constraint_names = {c['name'] for c in cons}
    seen_checks = set()
    for c in cons:
        if c['type'] == 'u':
            ucols = parse_cols(re.search(r'UNIQUE \((.*)\)', c['def']).group(1))
            cols_js = ', '.join(f't.{js_key(x)}' for x in ucols)
            extras.append(f"uniqueIndex({json.dumps(c['name'])}).on({cols_js})")
        elif c['type'] == 'c':
            if check_to_sqlite(c['def']) in seen_checks:
                continue
            seen_checks.add(check_to_sqlite(c['def']))
            extras.append(f"check({json.dumps(c['name'])}, sql`{check_to_sqlite(c['def'])}`)")
    for col in cols:
        if col['type'] == 'USER-DEFINED':
            values = ', '.join("'" + x + "'" for x in enums[col['udt']])
            name = f"{table}_{col['c']}_enum"
            extras.append(f'check({json.dumps(name)}, sql`"{col["c"]}" IN ({values})`)')
    for idx in indexes.get(table, []):
        if idx['name'] in constraint_names:
            continue
        m = re.match(r'CREATE (UNIQUE )?INDEX (\S+) ON public\.\S+ USING btree \((.*?)\)( WHERE (.*))?$', idx['def'])
        if not m:
            raise ValueError(idx)
        unique, raw_cols, where = m.group(1), m.group(3), m.group(5)
        if 'EXTRACT(' in raw_cols:
            # Index par mois/année : sans objet avec des dates en millisecondes (filtrer par plage)
            continue
        parts = []
        for part in [p.strip() for p in raw_cols.split(',')]:
            part = re.sub(r' (DESC|ASC)$', '', part)
            if re.fullmatch(r'"?[A-Za-z_][A-Za-z0-9_]*"?', part):
                parts.append(f't.{js_key(part.strip(chr(34)))}')
            else:
                parts.append(f'sql`{strip_casts(part)}`')
        fn = 'uniqueIndex' if unique else 'index'
        expr = f"{fn}({json.dumps(idx['name'])}).on({', '.join(parts)})"
        if where:
            expr += f'.where(sql`{check_to_sqlite(where)}`)'
        extras.append(expr)
    if extras:
        lines.append('  (t) => [')
        for e in extras:
            lines.append(f'    {e},')
        lines.append('  ],')
    lines.append(')')
    lines.append('')

open(out_path, 'w').write('\n'.join(lines))
print(f'{len(table_order)} tables écrites dans {out_path}')
