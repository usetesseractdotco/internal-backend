import type { FastifyInstance } from 'fastify'

import { createOrganizationRoute } from './create-organization-route'

export async function organizationsRoutes(app: FastifyInstance) {
  app.register(createOrganizationRoute)
}
