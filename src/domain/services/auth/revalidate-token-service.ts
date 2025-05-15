import { isAfter } from 'date-fns'

import {
  findSessionByIdIpAndUserAgent,
  updateSessionRefreshedAt,
} from '@/db/repositories/sessions-repository'
import type { Session } from '@/domain/entities/sessions'
import { error, success } from '@/utils/api-response'
import { getCache, ONE_WEEK_IN_SECONDS, setCache } from '@/utils/cache'
import { createRefreshToken } from '@/utils/sessions'

export async function revalidateToken({
  userId,
  jti,
  ipAddress,
  userAgent,
}: {
  userId: string
  jti: string
  ipAddress: string
  userAgent: string
}) {
  const cacheKey = `session:${jti}:${userId}:${ipAddress}:${userAgent}`
  const cachedSession = await getCache<Session>(cacheKey)

  let session = cachedSession

  if (!session) {
    session = await findSessionByIdIpAndUserAgent({
      id: jti,
      userId,
      ipAddress,
      userAgent,
    })

    if (session) {
      await setCache(cacheKey, JSON.stringify(session), ONE_WEEK_IN_SECONDS)
    }
  }

  if (!session)
    return error({
      message: 'Session not found' as const,
      code: 404,
    })

  const isSessionExpired = isAfter(new Date(), new Date(session.expiresAt))

  if (isSessionExpired)
    return error({
      message: 'Session expired' as const,
      code: 401,
    })

  const isSessionRevoked = session.status === 'revoked'

  if (isSessionRevoked)
    return error({
      message: 'Session revoked' as const,
      code: 401,
    })

  const { refreshToken } = await createRefreshToken({
    userId,
    sessionId: session.id,
  })

  await updateSessionRefreshedAt(session.id, session.userId)

  return success({
    data: refreshToken,
    code: 200,
  })
}
