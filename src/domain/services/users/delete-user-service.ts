import { deleteUser, getUserById } from '@/db/repositories/users-repository'
import type { User } from '@/domain/entities/users'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
import { error, success } from '@/utils/api-response'
import { deleteUserCache } from '@/utils/cache/users/delete-user-cache'
import { getCachedUserById } from '@/utils/cache/users/get-cached-user'

/**
 * Deletes a user by their ID.
 *
 * - Attempts to retrieve the user from the cache by ID.
 * - If not found in cache, attempts to retrieve the user from the database by ID.
 * - If the user is not found in either cache or database, returns a 404 error with USER_NOT_FOUND.
 * - If the user is found, deletes the user from the database and removes their cache entry.
 * - Returns a success response with code 204 if deletion is successful.
 *
 * @param params - The parameters for deletion
 * @param params.id - The user's ID to delete
 * @returns An object with status 'success' and code 204 if deleted, or 'error' with code and message if failed
 */
export async function deleteUserService({ id }: { id: string }) {
  let user: User | null = null

  user = await getCachedUserById({ id })

  if (!user) {
    user = await getUserById({
      id,
    })

    if (!user)
      return error({
        code: commonUserErrors.USER_NOT_FOUND.code,
        message: commonUserErrors.USER_NOT_FOUND.message,
      })
  }

  await deleteUser(id)
  await deleteUserCache({ id, email: user.email })

  return success({
    data: null,
    code: 204,
  })
}
