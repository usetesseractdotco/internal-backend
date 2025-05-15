import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { createOrganizationService } from '@/domain/services/organizations/create-organization'
import { authMiddleware } from '@/http/middleware/auth-middleware'
import { createOrganizationErrors } from '@/shared/errors/organizations/create-organization-errors'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'

/**
 * Creates a new organization for the authenticated user
 *
 * @route POST /v1/organizations
 * @param {FastifyInstance} app - Fastify instance
 * @returns {Promise<void>}
 *
 * @throws {ErrorResult}
 * - With code 400 and message 'FAILED_TO_CREATE_ORGANIZATION' if:
 *   - The organization could not be created due to a database error
 * - With code 400 and message 'MAX_ORGANIZATIONS_REACHED' if:
 *   - The user already has the maximum number of organizations (3)
 * - With code 401 and various messages if:
 *   - The user is not authenticated
 *   - The session is not found
 *   - The session has expired
 *   - The session has been revoked
 *
 * @example
 * // Request body
 * {
 *   "name": "My Organization",
 *   "logoUrl": "https://example.com/logo.png" // optional
 * }
 *
 * @response 204 - Organization created successfully
 */
export async function createOrganizationRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      '/',
      {
        schema: {
          tags: ['organizations'],
          body: z.object({
            name: z.string(),
            logoUrl: z.string().optional(),
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
              message: z.literal(
                createOrganizationErrors.FAILED_TO_CREATE_ORGANIZATION.message,
              ),
              details: z.literal(
                createOrganizationErrors.FAILED_TO_CREATE_ORGANIZATION.details,
              ),
            }),
          },
        },
      },
      async (req, res) => {
        const { sub: ownerId } = await req.getCurrentUserId()
        const { name, logoUrl } = req.body

        const result = await createOrganizationService({
          name,
          logoUrl,
          ownerId,
        })

        if (result.status === 'error')
          return res.status(result.code).send({
            message: result.message,
            details:
              result.message ===
              createOrganizationErrors.FAILED_TO_CREATE_ORGANIZATION.message
                ? createOrganizationErrors.FAILED_TO_CREATE_ORGANIZATION.details
                : result.message ===
                    createOrganizationErrors.MAX_ORGANIZATIONS_REACHED.message
                  ? createOrganizationErrors.MAX_ORGANIZATIONS_REACHED.details
                  : commonUserErrors.USER_NOT_FOUND.details,
          })

        return res.status(result.code).send()
      },
    )
}
