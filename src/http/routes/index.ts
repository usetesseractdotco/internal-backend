import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifySwaggerUi from '@fastify/swagger-ui'
import type { FastifyInstance } from 'fastify'

import { env } from '@/env'

import { apiV1Routes } from './v1'

export function routes(app: FastifyInstance) {
  if (env.app.NODE_ENV === 'dev') {
    app.register(fastifySwaggerUi, {
      routePrefix: '/docs',
    })
  }

  app.register(fastifyCors, {
    origin: env.app.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600, // 10 minutes
  })

  app.register(fastifyCookie)

  app.register(fastifyMultipart)

  app.register(apiV1Routes, { prefix: '/api/v1' })
}
