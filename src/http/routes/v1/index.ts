import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticateWithEmailAndPassword } from '@/domain/services/auth/authenticate-with-email/authenticate-with-email-and-password-service'
import { authWithEmailErrors } from '@/shared/errors/auth/auth-with-email-errors'

export function apiV1Routes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/auth/login',
    {
      schema: {
        tags: ['auth'],
        summary: 'Login with email and password',
        body: z.object({
          email: z.string().email(),
          password: z.string(),
        }),
        response: {
          204: z.null(),
          400: z.object({
            error: z.literal('INVALID_CREDENTIALS'),
            details: z.literal('Invalid credentials'),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const result = await authenticateWithEmailAndPassword({ email, password })

      if (result.status === 'error') {
        return reply.status(result.code).send({
          error: result.message,
          details: authWithEmailErrors.INVALID_CREDENTIALS.details,
        })
      }

      return reply.status(204).send()
    },
  )
}
