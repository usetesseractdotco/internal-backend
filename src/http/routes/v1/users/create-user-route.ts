import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { createUserService } from '@/domain/services/users/create-user-service'
import { createUserErrors } from '@/shared/errors/users/create-user-errors'

/**
 * Registers the route for creating a new user.
 *
 * POST /users
 *
 * Request body:
 *   - email: string (required, must be a valid email)
 *   - password: string (required)
 *   - firstName: string (required)
 *   - lastName: string (required)
 *   - avatarUrl: string | null (optional)
 *
 * Responses:
 *   - 204: User created successfully (no content)
 *   - 400: User already exists or could not be created
 *     - error: Error message
 *     - details: Additional error details
 *
 * @param app - The Fastify instance to register the route on.
 */
// Registers the POST / route for user creation (the /users prefix is already applied in the parent router)
export async function createUserRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        tags: ['users'],
        summary: 'Create a new user',
        body: z.object({
          email: z.string().email(),
          password: z.string(),
          firstName: z.string(),
          lastName: z.string(),
          avatarUrl: z.string().nullable(),
        }),
        response: {
          204: z.null(),
          400: z.object({
            error: z.enum([
              createUserErrors.USER_ALREADY_EXISTS.message,
              createUserErrors.USER_NOT_CREATED.message,
            ]),
            details: z.enum([
              createUserErrors.USER_ALREADY_EXISTS.details,
              createUserErrors.USER_NOT_CREATED.details,
            ]),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password, firstName, lastName, avatarUrl } = request.body

      const result = await createUserService({
        email,
        password,
        firstName,
        lastName,
        avatarUrl,
      })

      if (result.status === 'error') {
        return reply.status(result.code).send({
          error: result.message,
          details:
            result.message === createUserErrors.USER_ALREADY_EXISTS.message
              ? createUserErrors.USER_ALREADY_EXISTS.details
              : createUserErrors.USER_NOT_CREATED.details,
        })
      }

      return reply.status(204).send()
    },
  )
}
