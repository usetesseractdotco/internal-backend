import fastifyRateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'

import { redis } from '@/libs/redis'

import { joinWaitlistRoute } from './join-waitlist-route'

export async function waitlistRoutes(app: FastifyInstance) {
  await app.register(fastifyRateLimit, {
    redis,
    max: 10,
    timeWindow: '1 minute',
    nameSpace: 'waitlist-rate-limit',
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

  app.register(joinWaitlistRoute)
}
