# Mah.AI - Database Migration Guide

## Overview

This project now uses **raw SQL queries** instead of SQL pur. All database operations are handled through the `pg` library with a PostgreSQL connection pool.

## Migration Steps

### 1. Run SQL Schema in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `migrations_manual/00_complete_schema.sql`
4. Click **Run** to execute the schema

### 2. Update Environment Variables

Make sure your `.env` file has the correct Supabase connection strings:

```env
# Database (for direct SQL queries)
DATABASE_URL=postgresql://postgres.[your-project]:[password]@aws-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[your-project]:[password]@aws-[region].pooler.supabase.com:5432/postgres

# Supabase (for Auth and Storage)
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

**Important:** 
- `DATABASE_URL` uses port 6543 (connection pooler - recommended for most queries)
- `DIRECT_URL` uses port 5432 (direct connection - required for migrations and some operations)

### 3. Install Dependencies

The project already has the required dependencies:

```bash
pnpm install
```

Required packages:
- `pg` - PostgreSQL client
- `@types/pg` - TypeScript types for pg

### 4. Verify Database Connection

Run your development server:

```bash
pnpm dev
```

Check the console for any database connection errors.

## Project Structure

### Database Layer

```
lib/
â”œâ”€â”€ db.ts              # PostgreSQL pool and query helpers
â”œâ”€â”€ db-client.ts          # Raw SQL implementation (API db compatibility layer)
â””â”€â”€ sql-queries.ts     # Pre-written SQL queries for common operations
```

### How It Works

1. **lib/db.ts** - Creates a PostgreSQL connection pool and exports:
   - `query(text, params)` - Execute any SQL query
   - `transaction(callback)` - Run queries in a transaction

2. **lib/db-client.ts** - Provides a la base de données-like API that uses raw SQL:
   - `db.user.findUnique()` - Find a user by ID or email
   - `db.subject.findUnique()` - Find a subject by ID
   - `db.purchase.create()` - Create a purchase record
   - etc.

3. **lib/sql-queries.ts** - Contains type-safe helper functions:
   - `getUserById(id)` - Get user by ID
   - `getSubjectById(id, userId?)` - Get subject with optional purchase status
   - `createPurchase(data)` - Create a new purchase
   - etc.

## Writing New Queries

### Using the query function

```typescript
import { query } from '@/lib/db'

// Simple query
const result = await query('SELECT * FROM "User" WHERE id = $1', [userId])
const user = result.rows[0]

// Insert with returning
const newUser = await query(
  'INSERT INTO "User" (email, password, prenom) VALUES ($1, $2, $3) RETURNING *',
  [email, password, prenom]
)
```

### Using transactions

```typescript
import { transaction } from '@/lib/db'

const result = await transaction(async (client) => {
  await client.query('UPDATE "User" SET credits = credits - 10 WHERE id = $1', [userId])
  await client.query('INSERT INTO "Purchase" ...')
  return { success: true }
})
```

### Using the la base de données compatibility layer

```typescript
import { la base de données } from '@/lib/la base de données'

const user = await db.user.findUnique({ where: { id: userId } })
const subject = await db.subject.findUnique({ where: { id: subjectId } })
```

## Common Operations

### Find a user by email
```typescript
const user = await db.user.findUnique({ where: { email: 'user@example.com' } })
```

### Update user credits
```typescript
await db.user.update({
  where: { id: userId },
  data: { credits: { decrement: 10 } }
})
```

### Create a purchase with transaction
```typescript
const [updatedUser, purchase, transactionRecord] = await db.$transaction([
  db.user.update({
    where: { id: userId },
    data: { credits: { decrement: subject.credits } }
  }),
  db.purchase.create({
    data: { userId, subjectId: subject.id, creditsAmount: subject.credits, status: 'COMPLETED' }
  }),
  db.creditTransaction.create({
    data: { userId, amount: subject.credits, type: 'SPEND', description: `Achat: ${subject.titre}` }
  })
])
```

## Benefits of Raw SQL

1. **No la base de données incompatibilities** - Direct control over SQL
2. **Better performance** - No ORM overhead
3. **Full PostgreSQL features** - Use all Supabase/Postgres capabilities
4. **Transparent queries** - See exactly what SQL is executed
5. **Smaller bundle** - No la base de données client to generate

## Troubleshooting

### Connection errors

1. Check your `DATABASE_URL` and `DIRECT_URL` in `.env`
2. Ensure your Supabase project allows connections from your IP
3. Verify SSL settings in `lib/db.ts`

### Query errors

1. Check table names are properly quoted (e.g., `"User"` not `User`)
2. Ensure column names match the schema (camelCase vs snake_case)
3. Verify enum values match the defined types

### Transaction errors

1. Make sure you're using `DIRECT_URL` (not pooled connection) for transactions
2. Check that all queries in the transaction use the same client

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
