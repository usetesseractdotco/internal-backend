import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { members } from './members'
import { users } from './users'

export const orgs = pgTable('orgs', {
  id: text('id').primaryKey().$defaultFn(createId),

  name: text('name').notNull(),
  slug: text('slug').notNull(),
  logoUrl: text('logo_url'),

  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const orgsRelations = relations(orgs, ({ many, one }) => ({
  owner: one(users, {
    fields: [orgs.ownerId],
    references: [users.id],
  }),
  members: many(members),
}))
