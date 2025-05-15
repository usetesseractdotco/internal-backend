import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { getProfileService } from '@/domain/services/users/get-profile-service'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'

export async function getOwnProfileRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        tags: ['users'],
        summary: 'Get own profile',
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            id: z.string(),
            email: z.string(),
            firstName: z.string(),
            lastName: z.string(),
            avatarUrl: z.string().nullable(),
            isEmailVerified: z.boolean(),
            createdAt: z.date(),
            updatedAt: z.date(),
          }),
          404: z.object({
            message: z.literal(commonUserErrors.USER_NOT_FOUND.message),
            details: z.literal(commonUserErrors.USER_NOT_FOUND.details),
          }),
        },
      },
    },
    async (req, res) => {
      const { sub: userId } = await req.getCurrentUserId()

      const result = await getProfileService({ userId })

      if (result.status === 'error')
        return res.status(result.code).send({
          message: result.message,
          details: commonUserErrors.USER_NOT_FOUND.details,
        })

      return res.status(result.code).send(result.data)
    },
  )
}
