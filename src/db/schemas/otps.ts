import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { users } from '.'

export const otps = pgTable('otps', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  code: text('otp').notNull(),

  userId: text('user_id').references(() => users.id),

  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const otpsRelations = relations(otps, ({ one }) => ({
  user: one(users, {
    fields: [otps.userId],
    references: [users.id],
  }),
}))
