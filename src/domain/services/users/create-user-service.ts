import { createUser, getUserByEmail } from '@/db/repositories/users-repository'
import { createUserErrors } from '@/shared/errors/users/create-user-errors'
import { error, success } from '@/utils/api-response'
import { getCachedUserByEmail } from '@/utils/cache/users/get-cached-user'
import { setUserCache } from '@/utils/cache/users/set-user-cache'

/**
 * Creates a new user if the email does not already exist (checked in cache and DB).
 *
 * - Checks if the user exists in cache or database by email.
 * - If user exists, returns a 400 error with USER_ALREADY_EXISTS.
 * - If not, creates the user, sets the cache, and returns success (204).
 * - If user creation fails, returns a 500 error with USER_NOT_CREATED.
 *
 * @param params - The user data for creation
 * @param params.email - The user's email address
 * @param params.password - The user's password
 * @param params.firstName - The user's first name
 * @param params.lastName - The user's last name
 * @param params.avatarUrl - The user's avatar URL (nullable)
 * @returns An object with status 'success' and code 204 if created, or 'error' with code and message if failed
 */
export async function createUserService({
  email,
  password,
  firstName,
  lastName,
  avatarUrl,
}: {
  email: string
  password: string
  firstName: string
  lastName: string
  avatarUrl: string | null
}) {
  const cachedUserAlreadyExits = await getCachedUserByEmail({ email })

  if (cachedUserAlreadyExits) {
    return error({
      code: createUserErrors.USER_ALREADY_EXISTS.code,
      message: createUserErrors.USER_ALREADY_EXISTS.message,
    })
  }

  const userAlreadyExits = await getUserByEmail({
    email,
  })

  if (userAlreadyExits)
    return error({
      code: createUserErrors.USER_ALREADY_EXISTS.code,
      message: createUserErrors.USER_ALREADY_EXISTS.message,
    })

  const user = await createUser({
    email,
    password,
    firstName,
    lastName,
    avatarUrl,
    isEmailVerified: false,
  })

  if (!user)
    return error({
      code: createUserErrors.USER_NOT_CREATED.code,
      message: createUserErrors.USER_NOT_CREATED.message,
    })

  await setUserCache({ user })

  return success({
    data: null,
    code: 204,
  })
}
