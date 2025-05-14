import { db } from '@/db'
import { notificationPreferences as notificationPreferencesSchema } from '@/db/schemas'
import type { NotificationPreferences } from '@/domain/entities/notifications-preferences'

export async function upsertNotificationPreferences({
  userId,
  ...preferences
}: Omit<NotificationPreferences, 'createdAt' | 'updatedAt' | 'id'>) {
  const notificationPreferences = await db
    .insert(notificationPreferencesSchema)
    .values({
      userId,
      ...preferences,
    })
    .onConflictDoUpdate({
      target: [notificationPreferencesSchema.userId],
      set: {
        ...preferences,
      },
    })
    .returning()

  if (!notificationPreferences[0]) return null

  return notificationPreferences[0]
}
