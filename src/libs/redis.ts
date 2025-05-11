import Redis from 'ioredis'

import { env } from '@/env'

export const redis = new Redis({
  host: env.redis.REDIS_HOST,
  port: env.redis.REDIS_PORT,
  password: env.redis.REDIS_PASSWORD,
})
