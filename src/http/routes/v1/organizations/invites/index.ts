import type { FastifyInstance } from 'fastify'

import { createOrganizationInviteRoute } from './create-organization-invite-route'

export async function organizationsInvitesRoutes(app: FastifyInstance) {
  app.register(createOrganizationInviteRoute)
}
