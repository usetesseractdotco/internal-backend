import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
import { makeUser } from '@/test/factories/make-user'

import { deleteUserService } from './delete-user-service'

const sut = deleteUserService

it('should be able to delete an existing user', async () => {
  const user = await makeUser()
  if (!user) throw new Error('Failed to create test user')

  const result = await sut({
    id: user.id,
  })

  expect(result).toBeDefined()
  expect(result.status).toBe('ok')
  expect(result.code).toBe(204)
  if (result.status !== 'ok') throw new Error('User not deleted')
  expect(result.data).toBeNull()
})

it('should not be able to delete a non-existing user', async () => {
  const result = await sut({
    id: 'non-existing-id',
  })

  expect(result).toBeDefined()
  expect(result.status).toBe('error')
  expect(result.code).toBe(commonUserErrors.USER_NOT_FOUND.code)
})
