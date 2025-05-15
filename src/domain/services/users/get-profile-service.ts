import { getUserById } from '@/db/repositories/users-repository'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
import { error, success } from '@/utils/api-response'
import { getCachedUserById } from '@/utils/cache/users/get-cached-user'

export async function getProfileService({ userId }: { userId: string }) {
  let user = await getCachedUserById({ id: userId })

  if (!user) {
    user = await getUserById({
      id: userId,
    })

    if (!user) {
      return error({
        code: commonUserErrors.USER_NOT_FOUND.code,
        message: commonUserErrors.USER_NOT_FOUND.message,
      })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user

  return success({
    data: userWithoutPassword,
    code: 200,
  })
}
