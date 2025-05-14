import { upsertNotificationPreferences } from '@/db/repositories/notifications-preferences-repository'
import { getUserById } from '@/db/repositories/users-repository'
import type { InsertNotificationPreferencesModel } from '@/domain/entities/notifications-preferences'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
import { notificationPreferencesErrors } from '@/shared/errors/users/notifications-preferences-errors'
import { error, success } from '@/utils/api-response'

/**
 * Sets up or updates a user's notification preferences.
 *
 * - Attempts to retrieve the user from the database by ID.
 * - If the user is not found, returns a 404 error with USER_NOT_FOUND.
 * - If the user is found, creates or updates their notification preferences.
 * - If preferences creation/update fails, returns an error with NOTIFICATION_PREFERENCES_NOT_CREATED.
 * - Returns a success response with code 204 if preferences are set up successfully.
 *
 * @param params - The notification preferences parameters
 * @param params.userId - The user's ID to set preferences for
 * @param params.emailNotifications - Whether to enable email notifications
 * @param params.marketingNotifications - Whether to enable marketing notifications
 * @param params.securityAlerts - Whether to enable security alerts
 * @param params.accountUpdates - Whether to enable account update notifications
 * @param params.newFeatures - Whether to enable new feature notifications
 * @returns An object with status 'success' and code 204 if set up, or 'error' with code and message if failed
 */
export async function setupUserNotificationPreferencesService({
  userId,
  ...preferences
}: InsertNotificationPreferencesModel) {
  try {
    const user = await getUserById({ id: userId })

    if (!user)
      return error({
        message: commonUserErrors.USER_NOT_FOUND.message,
        code: commonUserErrors.USER_NOT_FOUND.code,
      })

    const notificationPreferences = await upsertNotificationPreferences({
      userId,
      ...preferences,
    })

    if (!notificationPreferences)
      return error({
        message:
          notificationPreferencesErrors.NOTIFICATION_PREFERENCES_NOT_CREATED
            .message,
        code: notificationPreferencesErrors.NOTIFICATION_PREFERENCES_NOT_CREATED
          .code,
      })

    return success({
      data: null,
      code: 204,
    })
  } catch (err) {
    return error({
      message:
        notificationPreferencesErrors.NOTIFICATION_PREFERENCES_NOT_CREATED
          .message,
      code: notificationPreferencesErrors.NOTIFICATION_PREFERENCES_NOT_CREATED
        .code,
    })
  }
}
