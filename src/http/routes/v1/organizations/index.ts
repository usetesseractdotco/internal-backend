import type { FastifyInstance } from 'fastify'

import { createOrganizationRoute } from './create-organization-route'
import { deleteOrganizationRoute } from './delete-organization-route'
import { organizationsInvitesRoutes } from './invites'

export async function organizationsRoutes(app: FastifyInstance) {
  app.register(createOrganizationRoute)
  app.register(deleteOrganizationRoute)

  app.register(organizationsInvitesRoutes, {
    prefix: '/:organizationId/invites',
  })
}
