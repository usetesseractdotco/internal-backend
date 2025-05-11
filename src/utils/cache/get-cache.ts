import { redis } from '@/libs/redis'

export const getCache = async <T>(key: string): Promise<T | null> => {
  const cachedData = await redis.get(key)

  return cachedData ? (JSON.parse(cachedData) as T) : null
}
