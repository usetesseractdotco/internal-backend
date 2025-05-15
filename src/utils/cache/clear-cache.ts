import { redis } from '@/libs/redis'

export async function clearCache(): Promise<void> {
  await redis.flushall()
}
