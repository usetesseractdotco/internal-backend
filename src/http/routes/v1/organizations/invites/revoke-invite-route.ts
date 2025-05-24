import type { FastifyInstance } from 'fastify/types/instance'
import { type ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { revokeInviteService } from '@/domain/services/organizations/invites/revoke-invite-service'

export function revokeInviteRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/:inviteId/revoke',
    {
      schema: {
        tags: ['invites', 'organizations'],
        description: 'Revoke an organization invite',
        params: z.object({
          inviteId: z.string(),
          organizationId: z.string(),
        }),
        response: {
          204: z.null(),
          404: z.object({
            message: z.enum(['Invite not found', 'User not found']),
          }),
        },
      },
    },
    async (req, res) => {
      const { inviteId, organizationId } = req.params

      const result = await revokeInviteService({
        inviteId,
        organizationId,
      })

      if (result.status === 'error')
        return res.status(result.code).send({ message: result.message })
    },
  )
}
