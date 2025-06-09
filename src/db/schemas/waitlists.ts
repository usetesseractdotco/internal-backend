import { createId } from '@paralleldrive/cuid2'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const waitlist = pgTable('waitlist', {
  id: text('id').primaryKey().$defaultFn(createId),

  email: text('email').notNull().unique(),

  joinedAt: timestamp('joined_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})
