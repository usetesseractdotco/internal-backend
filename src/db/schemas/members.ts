import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { orgs } from './orgs'
import { users } from './users'

export const rolesEnum = pgEnum('member_roles', [
  'admin',
  'billing',
  'developer',
  'member',
])

export const members = pgTable('members', {
  id: text('id').primaryKey().$defaultFn(createId),
  organizationId: text('organization_id')
    .notNull()
    .references(() => orgs.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  role: rolesEnum('role').default('member'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const membersRelations = relations(members, ({ one }) => ({
  organization: one(orgs, {
    fields: [members.organizationId],
    references: [orgs.id],
  }),
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
}))
