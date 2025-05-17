import type { FastifyInstance } from 'fastify'

import { createOrganizationRoute } from './create-organization-route'
import { deleteOrganizationRoute } from './delete-organization-route'

export async function organizationsRoutes(app: FastifyInstance) {
  app.register(createOrganizationRoute)
  app.register(deleteOrganizationRoute)
}
