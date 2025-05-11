import bcrypt from 'bcryptjs'

import { getUserByEmail } from '@/db/repositories/users-repository'
import { authWithEmailErrors } from '@/shared/errors/auth/auth-with-email-errors'
import { error, success } from '@/utils/api-response'
import { getCachedUserByEmail } from '@/utils/cache/users/get-cached-user'
import { setUserCache } from '@/utils/cache/users/set-user-cache'
/**
 * Authenticates a user using their email and password
 *
 * @param email - The user's email address
 * @param password - The user's password
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
}: {
  email: string
  password: string
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
      code: 400,
      message: authWithEmailErrors.INVALID_CREDENTIALS.message,
      // details: authWithEmailErrors.INVALID_CREDENTIALS.details,
    })

  await setUserCache({ user })

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid)
    return error({
      code: 400,
      message: authWithEmailErrors.INVALID_CREDENTIALS.message,
      // details: authWithEmailErrors.INVALID_CREDENTIALS.details,
    })

  return success({
    data: null,
    code: 204,
  })
}
