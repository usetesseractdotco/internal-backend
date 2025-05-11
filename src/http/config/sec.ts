import fastifyRateLimit from '@fastify/rate-limit'
import type { FastifyInstance, FastifyRequest } from 'fastify'

export async function configureSecurity(app: FastifyInstance) {
  // Rate limiting
  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (_req: FastifyRequest, ctx: { after: string }) => ({
      code: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded, retry in ${ctx.after}`,
    }),
  })
}
