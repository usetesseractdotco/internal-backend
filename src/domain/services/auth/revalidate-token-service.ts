import { isAfter } from 'date-fns'

import {
  findSessionByIdIpAndUserAgent,
  updateSessionRefreshedAt,
} from '@/db/repositories/sessions-repository'
import { error, success } from '@/utils/api-response'
import { getCachedSessionById } from '@/utils/cache/sessions/get-cached-session'
import { setSessionCache } from '@/utils/cache/sessions/set-session-cache'
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
  const cachedSession = await getCachedSessionById({
    id: jti,
    userId,
    ipAddress,
    userAgent,
  })
  let session = cachedSession

  if (!session) {
    session = await findSessionByIdIpAndUserAgent({
      id: jti,
      userId,
      ipAddress,
      userAgent,
    })

    if (session) {
      await setSessionCache({ session })
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
