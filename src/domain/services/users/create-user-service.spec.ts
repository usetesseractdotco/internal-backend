import { createUserErrors } from '@/shared/errors/users/create-user-errors'
import { makeRawUser, makeUser } from '@/test/factories/make-user'

import { createUserService } from './create-user-service'

const sut = createUserService

it('should be able to create a valid user', async () => {
  const rawUser = makeRawUser({
    password: 'password',
  })

  const result = await sut({
    firstName: rawUser.firstName,
    lastName: rawUser.lastName,
    email: rawUser.email,
    password: rawUser.password,
    avatarUrl: rawUser.avatarUrl ?? null,
  })

  expect(result).toBeDefined()
  expect(result.status).toBe('ok')
  expect(result.code).toBe(204)
  if (result.status !== 'ok') throw new Error('User not created')
  expect(result.data).toBeNull()
})

it('should not be able to create a user with an already registered email', async () => {
  const user = await makeUser()
  if (!user) throw new Error('Failed to create test user')

  const result = await sut({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: user.password,
    avatarUrl: user.avatarUrl,
  })

  expect(result).toBeDefined()
  expect(result.status).toBe('error')
  expect(result.code).toBe(createUserErrors.USER_ALREADY_EXISTS.code)
})
