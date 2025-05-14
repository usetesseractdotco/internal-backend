import { createId } from '@paralleldrive/cuid2'
import { boolean, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { users } from './users'

export const frequencyEnum = pgEnum('notification_frequency', [
  'realtime',
  'hourly',
  'daily',
  'weekly',
  'never',
])

export const notificationPreferences = pgTable('notification_preferences', {
  id: text('id').primaryKey().$defaultFn(createId).unique(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id)
    .unique(),

  emailNotifications: boolean('email_notifications').notNull().default(true),
  marketingNotifications: boolean('marketing_notifications')
    .notNull()
    .default(false),

  securityAlerts: boolean('security_alerts').notNull().default(true),
  accountUpdates: boolean('account_updates').notNull().default(true),
  newFeatures: boolean('new_features').notNull().default(true),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})
