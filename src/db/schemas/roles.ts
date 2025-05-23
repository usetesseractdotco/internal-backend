import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { organizationInvites } from './org-invites'

export const roles = pgTable('roles', {
  id: text('id').primaryKey().unique().$defaultFn(createId),

  name: text('name').notNull(),
  description: text('description').notNull(),

  // todo: add permissions

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const rolesRelations = relations(roles, ({ many }) => ({
  organizationInvites: many(organizationInvites),
}))
