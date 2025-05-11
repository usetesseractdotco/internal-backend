import fastifySwagger from '@fastify/swagger'
import fastify from 'fastify'
import type { FastifyInstance } from 'fastify/types/instance'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { logger } from '@/adapters/logger'
import { env } from '@/env'

import { configureSecurity } from './config/sec'
import { errorHandler } from './error-handler'
import { routes } from './routes'
import { transformSwaggerSchema } from './transform-schema'

const app: FastifyInstance = buildFastifyInstance()

export function startServer() {
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  // Configure security features
  configureSecurity(app).catch((error) => {
    logger.error('Failed to configure security:', error)
    process.exit(1)
  })

  app.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Tesseract',
        version: '0.1.0',
      },
      servers: [
        {
          url: env.app.BASE_URL,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: (schema) => {
      try {
        return transformSwaggerSchema(schema)
      } catch (err) {
        return schema
      }
    },
  })

  app.setErrorHandler(errorHandler)

  routes(app)

  app
    .listen({
      port: env.app.PORT,
      host: '0.0.0.0',
    })
    .then(() => {
      logger.info(`HTTP server running at ${env.app.BASE_URL}`)
    })
}

export function buildFastifyInstance() {
  return fastify()
}
