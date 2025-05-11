import type { Config } from 'drizzle-kit'

import { env } from './src/env'

export default {
  schema: 'src/db/schemas/index.ts',
  out: 'priv/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: env.db.DATABASE_URL },
  migrations: {
    prefix: 'timestamp',
  },
} satisfies Config
