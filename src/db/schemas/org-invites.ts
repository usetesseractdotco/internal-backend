import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { orgs } from './orgs'

export const orgInviteRolesEnum = pgEnum('organization_invite_roles', [
  'admin',
  'billing',
  'developer',
  'member',
])

export const organizationInvites = pgTable('organization_invites', {
  id: text('id').primaryKey().unique().$defaultFn(createId),

  organizationId: text('organization_id')
    .references(() => orgs.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  email: text('email').notNull(),
  role: orgInviteRolesEnum('role').default('member'),

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
  }),
)
