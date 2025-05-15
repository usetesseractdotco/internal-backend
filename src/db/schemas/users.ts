import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { members } from './members'
import { notificationPreferences } from './notification-preferences'
import { orgs } from './orgs'
import { otps } from './otps'
import { securityPreferences } from './security-preferences'
import { sessions } from './sessions'

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(createId),

  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  password: text('password').notNull(),
  avatarUrl: text('avatar_url'),
  isEmailVerified: boolean('is_email_verified').notNull().default(false),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const usersRelations = relations(users, ({ many, one }) => ({
  ownedOrgs: many(orgs),
  memberOf: many(members),
  sessions: many(sessions),
  otps: many(otps),
  notificationPreferences: one(notificationPreferences),
  securityPreferences: one(securityPreferences),
}))
