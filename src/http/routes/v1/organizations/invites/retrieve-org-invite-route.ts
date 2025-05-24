import type { FastifyInstance } from 'fastify'
import { type ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { retrieveInviteService } from '@/domain/services/organizations/invites/retrive-invite-service'
import { authMiddleware } from '@/http/middleware/auth-middleware'

export async function retriveOrgInviteRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      '/:inviteId',
      {
        schema: {
          tags: ['organizations', 'invites'],
          summary: 'Retrieve an organization invite',
          description: 'Retrieve an organization invite for a user',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              data: z.object({
                id: z.string(),
                organizationId: z.string(),
                role: z.string(),
                createdAt: z.date(),
                updatedAt: z.date(),
              }),
            }),
            400: z.object({
              message: z.string(),
              code: z.number(),
            }),
          },
          params: z.object({
            inviteId: z.string(),
          }),
          body: z.object({
            userId: z.string(),
          }),
        },
      },
      async (req, res) => {
        const { inviteId } = req.params
        const { userId } = req.body

        const result = await retrieveInviteService({
          inviteId,
          userId,
        })

        if (result.status !== 'ok') return res.status(result.code).send(result)

        return res.status(result.code).send({
          data: {
            ...result.data,
            role: result.data.role ?? 'member',
          },
        })
      },
    )
}
