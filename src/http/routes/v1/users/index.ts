import type { FastifyInstance } from 'fastify'

import { createUserRoute } from './create-user-route'
import { deleteUserRoute } from './delete-user-route'
import { setupUserNotificationsPreferencesRoute } from './setup-user-notifications-preferences-route'

export async function usersRoutes(app: FastifyInstance) {
  app.register(createUserRoute)
  app.register(deleteUserRoute)
  app.register(setupUserNotificationsPreferencesRoute)
}
