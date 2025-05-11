import { redis } from '@/libs/redis'

export const deleteCache = async (key: string) => {
  await redis.del(key)
}
