import * as usersRepository from '@/db/repositories/users-repository'
import { createUserErrors } from '@/shared/errors/users/create-user-errors'
import { makeRawUser, makeUser } from '@/test/factories/make-user'
import * as cacheModule from '@/utils/cache/users/get-cached-user'
import { setUserCache } from '@/utils/cache/users/set-user-cache'

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

  const cachedUser = await cacheModule.getCachedUserByEmail({
    email: rawUser.email,
  })
  expect(cachedUser).toBeTruthy()
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

it('should return error when user creation fails', async () => {
  const rawUser = makeRawUser({
    password: 'password',
  })

  // It's ok to mock the repository in this case to simulate a DB failure
  const createUserSpy = vi
    .spyOn(usersRepository, 'createUser')
    .mockResolvedValueOnce(null)

  const result = await sut({
    firstName: rawUser.firstName,
    lastName: rawUser.lastName,
    email: rawUser.email,
    password: rawUser.password,
    avatarUrl: rawUser.avatarUrl ?? null,
  })

  expect(createUserSpy).toHaveBeenCalled()
  expect(result.status).toBe('error')
  expect(result.code).toBe(createUserErrors.USER_NOT_CREATED.code)

  if (result.status === 'error') {
    expect(result.message).toBe(createUserErrors.USER_NOT_CREATED.message)
  }

  createUserSpy.mockRestore()
})

it('should check cache before checking database for existing user', async () => {
  const rawUser = await makeUser()

  if (!rawUser) throw new Error('User not created')

  const getUserByEmailSpy = vi.spyOn(usersRepository, 'getUserByEmail')

  await setUserCache({ user: rawUser })

  const result = await sut({
    firstName: rawUser.firstName,
    lastName: rawUser.lastName,
    email: rawUser.email,
    password: rawUser.password,
    avatarUrl: rawUser.avatarUrl ?? null,
  })

  expect(result.status).toBe('error')
  expect(result.code).toBe(createUserErrors.USER_ALREADY_EXISTS.code)

  expect(getUserByEmailSpy).not.toHaveBeenCalled()

  getUserByEmailSpy.mockRestore()
})
