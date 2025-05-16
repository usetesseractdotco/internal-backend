import type { FastifyInstance } from 'fastify'

import { authenticateWithEmailAndPasswordRoute } from './authenticate-with-email-and-password-route'
import { setup2FARoute } from './setup-2fa'

export async function authRoutes(app: FastifyInstance) {
  app.register(authenticateWithEmailAndPasswordRoute)
  app.register(setup2FARoute)
}
