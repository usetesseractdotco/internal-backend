import { render } from '@react-email/components'
import type { FastifyInstance } from 'fastify'
import { type ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { createOrganizationInviteService } from '@/domain/services/organizations/invites/create-organization-invite-service'
import { InviteEmail } from '@/emails/invite-email'
import { emailServiceFactory } from '@/factories/email-factory'
import { authMiddleware } from '@/http/middleware/auth-middleware'

export async function createOrganizationInviteRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      '/',
      {
        schema: {
          tags: ['organizations', 'invites'],
          summary: 'Create an organization invite',
          description: 'Create an organization invite for a user',
          security: [{ bearerAuth: [] }],
          response: {
            204: z.null(),
            400: z.object({
              message: z.string(),
              code: z.number(),
            }),
          },
          body: z.object({
            organizationId: z.string(),
            roleId: z.string().nullable(),
            email: z.string(),
          }),
        },
      },
      async (req, res) => {
        const { organizationId, email, roleId } = req.body

        const result = await createOrganizationInviteService({
          organizationId,
          roleId,
          email,
        })

        if (result.status !== 'ok') return res.status(result.code).send(result)

        const emailService = emailServiceFactory('resend')
        const renderedTemplate = await render(
          InviteEmail({
            organizationName: result.data.organizationName,
            inviteUrl: result.data.inviteUrl,
          }),
        )

        await emailService.sendEmail(
          {
            to: [email],
            subject: `You have been invited to join ${result.data.organizationName}`,
            html: renderedTemplate,
          },
          {
            type: 'invites',
            idempotencyKey: result.data.id,
          },
        )

        return res.status(result.code).send()
      },
    )
}
