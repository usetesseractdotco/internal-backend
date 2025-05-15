import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { setupUserNotificationPreferencesService } from '@/domain/services/users/setup-user-preferences-service'
import { authMiddleware } from '@/http/middleware/auth-middleware'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
import { notificationPreferencesErrors } from '@/shared/errors/users/notifications-preferences-errors'

const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  marketingNotifications: z.boolean(),
  securityAlerts: z.boolean(),
  accountUpdates: z.boolean(),
  newFeatures: z.boolean(),
})

export async function setupUserNotificationsPreferencesRoute(
  app: FastifyInstance,
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .put(
      '/notifications-preferences',
      {
        schema: {
          tags: ['users'],
          summary: 'Setup user notification preferences',
          security: [{ bearerAuth: [] }],
          body: notificationPreferencesSchema,
          response: {
            204: z.null(),
            404: z.object({
              message: z.enum([
                notificationPreferencesErrors
                  .NOTIFICATION_PREFERENCES_NOT_CREATED.message,
                commonUserErrors.USER_NOT_FOUND.message,
              ]),
              details: z.enum([
                notificationPreferencesErrors
                  .NOTIFICATION_PREFERENCES_NOT_CREATED.details,
                commonUserErrors.USER_NOT_FOUND.details,
              ]),
            }),
            401: z.object({
              message: z.literal('Unauthorized'),
            }),
            500: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (req, res) => {
        const { sub: userId } = await req.getCurrentUserId()

        const result = await setupUserNotificationPreferencesService({
          userId,
          ...req.body,
        })

        if (result.status === 'error') {
          return res.status(result.code).send({
            message: result.message,
            details:
              result.message ===
              notificationPreferencesErrors.NOTIFICATION_PREFERENCES_NOT_CREATED
                .message
                ? notificationPreferencesErrors
                    .NOTIFICATION_PREFERENCES_NOT_CREATED.details
                : commonUserErrors.USER_NOT_FOUND.details,
          })
        }

        return res.status(204).send()
      },
    )
}
