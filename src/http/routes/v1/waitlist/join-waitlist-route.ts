import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { joinWaitlistService } from '@/domain/services/waitlist/join-waitlist-service'
import { waitlistErrors } from '@/shared/errors/waitlist/waitlist-errors'

export async function joinWaitlistRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        tags: ['waitlist'],
        summary: 'Join waitlist',
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          200: z.object({
            message: z.literal('Email added to waitlist'),
          }),
          409: z.object({
            message: z.literal(waitlistErrors.USER_ALREADY_IN_WAITLIST.message),
          }),
        },
      },
    },
    async (req, res) => {
      const { email } = req.body

      const result = await joinWaitlistService({ email })

      if (result.status === 'error')
        return res.status(result.code).send({
          message: result.message,
        })

      return res.status(result.code).send()
    },
  )
}
