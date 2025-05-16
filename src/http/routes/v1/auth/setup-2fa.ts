import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { setup2FA } from '@/domain/services/auth/setup-2fa-service'
import { setup2FAErrors } from '@/shared/errors/auth/setup-2fa-errors'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'

export async function setup2FARoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/setup-2fa',
    {
      schema: {
        tags: ['auth'],
        summary: 'Setup 2FA',
        security: [{ bearerAuth: [] }],
      },
    },
    async (req, res) => {
      const { sub: userId } = await req.getCurrentUserId()

      const result = await setup2FA({
        userId,
      })

      if (result.status === 'error') {
        return res.status(result.code).send({
          message: result.message,
          details:
            result.message === commonUserErrors.USER_NOT_FOUND.message
              ? commonUserErrors.USER_NOT_FOUND.details
              : setup2FAErrors.twoFactorAlreadyEnabled.details,
        })
      }

      return res.status(result.code).send(result)
    },
  )
}
