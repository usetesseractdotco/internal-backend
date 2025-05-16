import { createId } from '@paralleldrive/cuid2'
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { users } from './users'

export const securityPreferences = pgTable('security_preferences', {
  id: text('id').primaryKey().$defaultFn(createId).unique(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id)
    .unique(),

  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  twoFactorSecret: text('two_factor_secret').notNull().default(''),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})
