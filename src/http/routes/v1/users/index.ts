import fastifyRateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'

import { redis } from '@/libs/redis'

import { createUserRoute } from './create-user-route'
import { deleteUserRoute } from './delete-user-route'
import { getOwnProfileRoute } from './get-own-profile'
import { getUserProfileRoute } from './get-user-profile'
import { setupUserNotificationsPreferencesRoute } from './setup-user-notifications-preferences-route'

export async function usersRoutes(app: FastifyInstance) {
  await app.register(fastifyRateLimit, {
    redis,
    nameSpace: 'users-rate-limit',
    continueExceeding: true,
    skipOnError: false,
    enableDraftSpec: true,
    addHeadersOnExceeding: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
  })

  app.register(createUserRoute)
  app.register(deleteUserRoute)
  app.register(setupUserNotificationsPreferencesRoute)
  app.register(getOwnProfileRoute)
  app.register(getUserProfileRoute)
}
