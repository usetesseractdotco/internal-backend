import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticateWithEmailAndPassword } from '@/domain/services/auth/authenticate-with-email-and-password-service'
import { authWithEmailErrors } from '@/shared/errors/auth/auth-with-email-errors'

/**
 * Registers the route for authenticating a user with email and password.
 *
 * POST /auth/login
 *
 * req body:
 *   - email: string (required, must be a valid email)
 *   - password: string (required)
 *
 * Responses:
 *   - 204: Authentication successful (no content)
 *   - 400: Invalid credentials
 *     - error: 'INVALID_CREDENTIALS'
 *     - details: 'Invalid credentials'
 *
 * @param app - The Fastify instance to register the route on.
 */
// Registers the POST /login route for user authentication (the /auth prefix is already applied in the parent router)
export async function authenticateWithEmailAndPasswordRoute(
  app: FastifyInstance,
) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/login',
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
            error: z.enum([
              authWithEmailErrors.INVALID_CREDENTIALS.message,
              authWithEmailErrors.USER_ALREADY_HAS_SESSION_ACTIVE.message,
            ]),
            details: z.enum([
              authWithEmailErrors.INVALID_CREDENTIALS.details,
              authWithEmailErrors.USER_ALREADY_HAS_SESSION_ACTIVE.details,
            ]),
          }),
        },
      },
    },
    async (req, res) => {
      const { email, password } = req.body

      const userAgent = req.headers['user-agent']
      const forwardedFor = req.headers['x-forwarded-for']
      const remoteAddress = req.socket?.remoteAddress
      const forwardedForArray =
        typeof forwardedFor === 'string' ? forwardedFor.split(',') : []
      const ipAddress =
        forwardedForArray.length > 0
          ? forwardedForArray[0]?.trim()
          : remoteAddress || ''

      if (!userAgent || !ipAddress)
        return res.status(400).send({
          error: authWithEmailErrors.INVALID_CREDENTIALS.message,
          details: authWithEmailErrors.INVALID_CREDENTIALS.details,
        })

      const result = await authenticateWithEmailAndPassword({
        email,
        password,
        ipAddress,
        userAgent,
      })

      if (result.status === 'error') {
        return res.status(result.code).send({
          error: result.message,
          details: authWithEmailErrors.INVALID_CREDENTIALS.details,
        })
      }

      return res.status(204).send()
    },
  )
}
