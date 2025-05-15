import type { Session } from '@/domain/entities/sessions'

import { getCache } from '../get-cache'

export async function getCachedSessionById({
  id,
  userId,
  ipAddress,
  userAgent,
}: {
  id: string
  userId: string
  ipAddress: string
  userAgent: string
}) {
  const cacheKey = `session:${id}:${userId}:${ipAddress}:${userAgent}`
  const cachedSession = await getCache<Session>(cacheKey)

  return cachedSession
}
