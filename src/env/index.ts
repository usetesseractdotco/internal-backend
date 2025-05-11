import { z } from 'zod'

export const env = {
  db: loadDbEnvs(),
  app: loadAppEnvs(),
  redis: loadRedisEnvs(),
}

function loadAppEnvs() {
  const schema = z.object({
    NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
    PORT: z.number().default(3333),
    BASE_URL: z.string(),
    JWT_SECRET: z.string(),
    CLIENT_URL: z.string(),
  })

  return schema.parse(process.env)
}

function loadDbEnvs() {
  const schema = z.object({
    DATABASE_URL: z.string(),
  })

  return schema.parse(process.env)
}

function loadRedisEnvs() {
  const schema = z.object({
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number(),
    REDIS_PASSWORD: z.string(),
  })

  return schema.parse(process.env)
}
