import fastifyRateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'

import { redis } from '@/libs/redis'

import { authenticateWithEmailAndPasswordRoute } from './authenticate-with-email-and-password-route'
import { setup2FARoute } from './setup-2fa'

export async function authRoutes(app: FastifyInstance) {
  await app.register(fastifyRateLimit, {
    redis,
    nameSpace: 'auth-rate-limit',
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

  app.register(authenticateWithEmailAndPasswordRoute)
  app.register(setup2FARoute)
}
