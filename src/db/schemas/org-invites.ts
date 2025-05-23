import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { orgs } from './orgs'
import { roles } from './roles'

export const organizationInvites = pgTable('organization_invites', {
  id: text('id').primaryKey().unique().$defaultFn(createId),

  organizationId: text('organization_id').references(() => orgs.id, {
    onDelete: 'cascade',
  }),
  email: text('email').notNull(),
  roleId: text('role_id').references(() => roles.id, {
    onDelete: 'set null',
  }),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }),
})

export const organizationInvitesRelations = relations(
  organizationInvites,
  ({ one }) => ({
    organization: one(orgs, {
      fields: [organizationInvites.organizationId],
      references: [orgs.id],
    }),
    role: one(roles, {
      fields: [organizationInvites.roleId],
      references: [roles.id],
    }),
  }),
)
