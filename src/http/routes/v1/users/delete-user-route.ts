import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { deleteUserService } from '@/domain/services/users/delete-user-service'
import { deleteUserErrors } from '@/shared/errors/users/delete-user-errors'

/**
 * Registers the route for deleting a user.
 *
 * DELETE /users/:id
 *
 * Path parameters:
 *   - id: string (required, the ID of the user to delete)
 *
 * Responses:
 *   - 204: User deleted successfully (no content)
 *   - 400: User not found or could not be deleted
 *     - error: Error message
 *     - details: Additional error details
 *
 * @param app - The Fastify instance to register the route on.
 */
// Registers the POST / route for user creation (the /users prefix is already applied in the parent router)
export async function deleteUserRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/:id',
    {
      schema: {
        tags: ['users'],
        summary: 'Delete a user',
        params: z.object({
          id: z.string(),
        }),
        response: {
          204: z.null(),
          400: z.object({
            error: z.literal(deleteUserErrors.USER_NOT_FOUND.message),
            details: z.literal(deleteUserErrors.USER_NOT_FOUND.details),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const result = await deleteUserService({
        id,
      })

      if (result.status === 'error') {
        return reply.status(result.code).send({
          error: result.message,
          details: deleteUserErrors.USER_NOT_FOUND.details,
        })
      }

      return reply.status(204).send()
    },
  )
}
