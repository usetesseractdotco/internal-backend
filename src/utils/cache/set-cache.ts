import { redis } from '@/libs/redis'

export const setCache = async (key: string, value: string, ttl: number) => {
  await redis.set(key, value, 'EX', ttl)
}
