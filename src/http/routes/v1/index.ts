import type { FastifyInstance } from 'fastify'

import { authRoutes } from './auth'
import { usersRoutes } from './users'

export function apiV1Routes(app: FastifyInstance) {
  app.register(authRoutes, { prefix: '/auth' })
  app.register(usersRoutes, { prefix: '/users' })
}
