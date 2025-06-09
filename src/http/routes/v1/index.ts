import type { FastifyInstance } from 'fastify'

import { waitlistRoutes } from './waitlist'

export function apiV1Routes(app: FastifyInstance) {
  /** commented till app launch
  app.register(authRoutes, { prefix: '/auth' })
  app.register(usersRoutes, { prefix: '/users' })
  app.register(organizationsRoutes, { prefix: '/organizations' }
   */

  app.register(waitlistRoutes, { prefix: '/waitlist' })
}
