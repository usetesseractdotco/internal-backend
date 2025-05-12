import { createId } from '@paralleldrive/cuid2'
import bcrypt from 'bcryptjs'

import {
  createSession,
  deleteSessionByToken,
  findSessionByUserIdIpAddressAndUserAgent,
} from '@/db/repositories/sessions-repository'
import { getUserByEmail } from '@/db/repositories/users-repository'
import { authWithEmailErrors } from '@/shared/errors/auth/auth-with-email-errors'
import { error, success } from '@/utils/api-response'
import { getCachedUserByEmail } from '@/utils/cache/users/get-cached-user'
import { setUserCache } from '@/utils/cache/users/set-user-cache'
import { comparePassword } from '@/utils/password/index.'
import { ACCESS_TOKEN_EXPIRY_MS } from '@/utils/sessions'
import { createSessionUtil } from '@/utils/sessions/'
/**
 * Authenticates a user using their email and password
 *
 * @param email - The user's email address
 * @param password - The user's password
 * @param ipAddress - The user's IP address
 * @param userAgent - The user's user agent
 *
 * @throws {ErrorResult}
 * - With code 400 and message 'INVALID_CREDENTIALS' if:
 *   - The user email is not found
 *   - The password does not match
 *
 * Note: Error messages are intentionally vague to prevent user enumeration attacks
 */

export async function authenticateWithEmailAndPassword({
  email,
  password,
  ipAddress,
  userAgent,
}: {
  email: string
  password: string
  ipAddress: string
  userAgent: string
}) {
  const cachedUser = await getCachedUserByEmail({ email })

  if (cachedUser) {
    const isPasswordValid = await bcrypt.compare(password, cachedUser.password)

    if (isPasswordValid)
      return success({
        data: null,
        code: 204,
      })
  }

  const user = await getUserByEmail({ email })

  if (!user)
    return error({
      code: authWithEmailErrors.INVALID_CREDENTIALS.code,
      message: authWithEmailErrors.INVALID_CREDENTIALS.message,
      // details: authWithEmailErrors.INVALID_CREDENTIALS.details,
    })

  await setUserCache({ user })

  const isPasswordValid = await comparePassword(password, user.password)

  if (!isPasswordValid)
    return error({
      code: authWithEmailErrors.INVALID_CREDENTIALS.code,
      message: authWithEmailErrors.INVALID_CREDENTIALS.message,
      // details: authWithEmailErrors.INVALID_CREDENTIALS.details,
    })

  const existingSession = await findSessionByUserIdIpAddressAndUserAgent({
    userId: user.id,
    ipAddress,
    userAgent,
  })

  if (existingSession) {
    const isSessionActive = existingSession.status === 'active'

    if (isSessionActive) {
      return error({
        message: authWithEmailErrors.USER_ALREADY_HAS_SESSION_ACTIVE.message,
        code: authWithEmailErrors.USER_ALREADY_HAS_SESSION_ACTIVE.code,
      })
    }

    await deleteSessionByToken({
      token: existingSession.token,
      userId: user.id,
    })
  }

  const sessionId = createId()

  const { accessToken, refreshToken } = await createSessionUtil({
    userId: user.id,
    sessionId,
  })

  await createSession({
    id: sessionId,
    token: accessToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + ACCESS_TOKEN_EXPIRY_MS),
    ipAddress,
    userAgent,
  })

  return success({
    data: {
      accessToken,
      refreshToken,
    },
    code: 204,
  })
}
