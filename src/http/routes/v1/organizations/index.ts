import fastifyRateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'

import { redis } from '@/libs/redis'

import { createOrganizationRoute } from './create-organization-route'
import { deleteOrganizationRoute } from './delete-organization-route'
import { organizationsInvitesRoutes } from './invites'

export async function organizationsRoutes(app: FastifyInstance) {
  await app.register(fastifyRateLimit, {
    redis,
    nameSpace: 'organizations-rate-limit',
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

  app.register(createOrganizationRoute)
  app.register(deleteOrganizationRoute)

  app.register(organizationsInvitesRoutes, {
    prefix: '/:organizationId/invites',
  })
}
