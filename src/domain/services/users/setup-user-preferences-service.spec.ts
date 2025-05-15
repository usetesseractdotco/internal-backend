import { afterEach, describe, expect, it, vi } from 'vitest'

import * as notificationPreferencesRepository from '@/db/repositories/notifications-preferences-repository'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
import { notificationPreferencesErrors } from '@/shared/errors/users/notifications-preferences-errors'
import { makeUser } from '@/test/factories/make-user'

import { setupUserNotificationPreferencesService } from './setup-user-preferences-service'

describe('Setup User Notification Preferences Service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should successfully setup notification preferences for a user', async () => {
    const user = await makeUser()
    if (!user) throw new Error('Failed to create test user')

    const preferences = {
      userId: user.id,
      emailNotifications: true,
      marketingNotifications: false,
      securityAlerts: true,
      accountUpdates: true,
      newFeatures: false,
    }

    const result = await setupUserNotificationPreferencesService(preferences)
    expect(result.status).toBe('ok')

    if (result.status === 'ok') {
      expect(result.data).toBe(null)
      expect(result.code).toBe(204)
    }
  })

  it('should return error when user does not exist', async () => {
    const preferences = {
      userId: 'non-existent-user-id',
      emailNotifications: true,
      marketingNotifications: false,
      securityAlerts: true,
      accountUpdates: true,
      newFeatures: false,
    }

    const result = await setupUserNotificationPreferencesService(preferences)
    expect(result.status).toBe('error')

    if (result.status === 'error') {
      expect(result.message).toBe(commonUserErrors.USER_NOT_FOUND.message)
      expect(result.code).toBe(commonUserErrors.USER_NOT_FOUND.code)
    }
  })

  it('should return error when upsertNotificationPreferences returns null', async () => {
    const user = await makeUser()
    if (!user) throw new Error('Failed to create test user')

    // It's ok to mock the repository in this case to simulate a DB failure
    vi.spyOn(
      notificationPreferencesRepository,
      'upsertNotificationPreferences',
    ).mockResolvedValueOnce(null)

    const preferences = {
      userId: user.id,
      emailNotifications: true,
      marketingNotifications: false,
      securityAlerts: true,
      accountUpdates: true,
      newFeatures: false,
    }

    const result = await setupUserNotificationPreferencesService(preferences)
    expect(result.status).toBe('error')

    if (result.status === 'error') {
      expect(result.message).toBe(
        notificationPreferencesErrors.NOTIFICATION_PREFERENCES_NOT_CREATED
          .message,
      )
      expect(result.code).toBe(
        notificationPreferencesErrors.NOTIFICATION_PREFERENCES_NOT_CREATED.code,
      )
    }
  })

  it('should handle notification preferences creation failure', async () => {
    const user = await makeUser()
    if (!user) throw new Error('Failed to create test user')

    // It's ok to mock the repository in this case to simulate a DB failure
    vi.spyOn(
      notificationPreferencesRepository,
      'upsertNotificationPreferences',
    ).mockRejectedValueOnce(new Error('Database error'))

    const preferences = {
      userId: user.id,
      emailNotifications: true,
      marketingNotifications: false,
      securityAlerts: true,
      accountUpdates: true,
      newFeatures: false,
    }

    const result = await setupUserNotificationPreferencesService(preferences)
    expect(result.status).toBe('error')

    if (result.status === 'error') {
      expect(result.message).toBe(
        notificationPreferencesErrors.NOTIFICATION_PREFERENCES_NOT_CREATED
          .message,
      )
      expect(result.code).toBe(
        notificationPreferencesErrors.NOTIFICATION_PREFERENCES_NOT_CREATED.code,
      )
    }
  })
})
