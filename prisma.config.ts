import 'dotenv/config'
import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg')
      const pg = await import('pg')
      const pool = new pg.default.Pool({ connectionString: process.env.DATABASE_URL })
      return new PrismaPg(pool)
    },
    seed: 'npx tsx prisma/seed.ts',
  },
})
