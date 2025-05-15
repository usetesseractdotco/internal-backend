import { isAfter } from 'date-fns'

import {
  findSessionByIdIpAndUserAgent,
  updateSessionRefreshedAt,
} from '@/db/repositories/sessions-repository'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
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
      message: commonUserErrors.SESSION_NOT_FOUND.message,
      code: commonUserErrors.SESSION_NOT_FOUND.code,
    })

  const isSessionExpired = isAfter(new Date(), new Date(session.expiresAt))

  if (isSessionExpired)
    return error({
      message: commonUserErrors.SESSION_EXPIRED.message,
      code: commonUserErrors.SESSION_EXPIRED.code,
    })

  const isSessionRevoked = session.status === 'revoked'

  if (isSessionRevoked)
    return error({
      message: commonUserErrors.SESSION_REVOKED.message,
      code: commonUserErrors.SESSION_REVOKED.code,
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
