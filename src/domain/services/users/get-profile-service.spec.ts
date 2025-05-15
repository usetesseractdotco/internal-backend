import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
import { makeUser } from '@/test/factories/make-user'
import { getCachedUserById } from '@/utils/cache/users/get-cached-user'
import { setUserCache } from '@/utils/cache/users/set-user-cache'

import { getProfileService } from './get-profile-service'

const sut = getProfileService

describe('Get Profile Service', () => {
  it('should return user profile from cache if available', async () => {
    const user = await makeUser()
    if (!user) throw new Error('Failed to create test user')

    await setUserCache({ user })

    const result = await sut({ userId: user.id })

    expect(result.status).toBe('ok')
    expect(result.code).toBe(200)

    if (result.status === 'ok') {
      expect(result.data).not.toHaveProperty('password')

      expect(result.data).toHaveProperty('id', user.id)
      expect(result.data).toHaveProperty('email', user.email)
      expect(result.data).toHaveProperty('firstName', user.firstName)
      expect(result.data).toHaveProperty('lastName', user.lastName)
    }
  })

  it('should fetch user from database if not found in cache', async () => {
    const user = await makeUser()
    if (!user) throw new Error('Failed to create test user')

    const cahedUser = await getCachedUserById({ id: user.id })
    expect(cahedUser).toBeNull()

    const result = await sut({ userId: user.id })

    expect(result.status).toBe('ok')
    expect(result.code).toBe(200)

    if (result.status === 'ok') {
      expect(result.data).not.toHaveProperty('password')

      expect(result.data).toHaveProperty('id', user.id)
      expect(result.data).toHaveProperty('email', user.email)
    }
  })

  it('should return error when user is not found in cache or database', async () => {
    const result = await sut({ userId: 'non-existent-id' })

    expect(result.status).toBe('error')
    expect(result.code).toBe(commonUserErrors.USER_NOT_FOUND.code)

    if (result.status === 'error') {
      expect(result.message).toBe(commonUserErrors.USER_NOT_FOUND.message)
    }
  })
})
