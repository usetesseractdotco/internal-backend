import type { FastifyInstance } from 'fastify'

import { createOrganizationInviteRoute } from './create-organization-invite-route'
import { revokeInviteRoute } from './revoke-invite-route'

export async function organizationsInvitesRoutes(app: FastifyInstance) {
  app.register(createOrganizationInviteRoute)
  app.register(revokeInviteRoute)
}
