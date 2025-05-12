import type { FastifyInstance } from 'fastify'

import { authenticateWithEmailAndPasswordRoute } from './authenticate-with-email-and-password-route'

export async function authRoutes(app: FastifyInstance) {
  app.register(authenticateWithEmailAndPasswordRoute)
}
