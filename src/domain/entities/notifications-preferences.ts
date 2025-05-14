import type { InferSelectModel } from 'drizzle-orm'

import type { notificationPreferences } from '@/db/schemas'

export type NotificationPreferences = InferSelectModel<
  typeof notificationPreferences
>
export type InsertNotificationPreferencesModel = Omit<
  NotificationPreferences,
  'createdAt' | 'updatedAt' | 'id'
> // We're not using inferInsertModel because it would make required fields optional
// (this happens because they have default values in the schema, but we want to enforce them at the type level)
