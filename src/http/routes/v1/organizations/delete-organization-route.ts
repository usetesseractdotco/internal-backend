import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { deleteOrganizationService } from '@/domain/services/organizations/delete-organization-service'
import { authMiddleware } from '@/http/middleware/auth-middleware'
import { commonOrganizationErrors } from '@/shared/errors/organizations/common-organization-errors'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'

/**
 * Deletes an organization for the authenticated user
 *
 * @route DELETE /v1/organizations/:id
 * @param {FastifyInstance} app - Fastify instance
 * @returns {Promise<void>}
 *
 * @throws {ErrorResult}
 * - With code 400 and message 'FAILED_TO_DELETE_ORGANIZATION' if:
 *   - The organization could not be deleted due to a database error
 * - With code 400 and message 'ORGANIZATION_NOT_FOUND' if:
 *   - The organization with the given ID does not exist
 * - With code 400 and message 'NOT_ORGANIZATION_OWNER' if:
 *   - The authenticated user is not the owner of the organization
 * - With code 401 and various messages if:
 *   - The user is not authenticated
 *   - The session is not found
 *   - The session has expired
 *   - The session has been revoked
 *
 * @example
 * // Request params
 * {
 *   "id": "123e4567-e89b-12d3-a456-426614174000"
 * }
 *
 * @response 204 - Organization deleted successfully
 */
export async function deleteOrganizationRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .delete(
      '/:id',
      {
        schema: {
          tags: ['organizations'],
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            204: z.null(),
            401: z.object({
              message: z.enum([
                commonUserErrors.UNAUTHORIZED.message,
                commonUserErrors.SESSION_NOT_FOUND.message,
                commonUserErrors.SESSION_EXPIRED.message,
                commonUserErrors.SESSION_REVOKED.message,
              ]),
              details: z.enum([
                commonUserErrors.UNAUTHORIZED.details,
                commonUserErrors.SESSION_NOT_FOUND.details,
                commonUserErrors.SESSION_EXPIRED.details,
                commonUserErrors.SESSION_REVOKED.details,
              ]),
            }),
            400: z.object({
              message: z.enum([
                commonOrganizationErrors.FAILED_TO_DELETE_ORGANIZATION.message,
                commonOrganizationErrors.ORGANIZATION_NOT_FOUND.message,
                commonOrganizationErrors.NOT_ORGANIZATION_OWNER.message,
              ]),
              details: z.enum([
                commonOrganizationErrors.FAILED_TO_DELETE_ORGANIZATION.details,
                commonOrganizationErrors.ORGANIZATION_NOT_FOUND.details,
                commonOrganizationErrors.NOT_ORGANIZATION_OWNER.details,
              ]),
            }),
          },
        },
      },
      async (req, res) => {
        const { sub: userId } = await req.getCurrentUserId()
        const { id: organizationId } = req.params

        const result = await deleteOrganizationService({
          organizationId,
          userId,
        })

        if (result.status === 'error') {
          return res.status(result.code).send({
            message: result.message,
            details:
              result.message ===
              commonOrganizationErrors.FAILED_TO_DELETE_ORGANIZATION.message
                ? commonOrganizationErrors.FAILED_TO_DELETE_ORGANIZATION.details
                : result.message ===
                    commonOrganizationErrors.ORGANIZATION_NOT_FOUND.message
                  ? commonOrganizationErrors.ORGANIZATION_NOT_FOUND.details
                  : result.message ===
                      commonOrganizationErrors.NOT_ORGANIZATION_OWNER.message
                    ? commonOrganizationErrors.NOT_ORGANIZATION_OWNER.details
                    : commonUserErrors.USER_NOT_FOUND.details,
          })
        }

        return res.status(204).send()
      },
    )
}
