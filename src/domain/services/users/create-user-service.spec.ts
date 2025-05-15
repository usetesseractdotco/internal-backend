import { vi } from 'vitest'

import * as usersRepository from '@/db/repositories/users-repository'
import { createUserErrors } from '@/shared/errors/users/create-user-errors'
import { makeRawUser, makeUser } from '@/test/factories/make-user'
import * as cacheModule from '@/utils/cache/users/get-cached-user'

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

  // Verify user was cached
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

  // Mock the repository to return null on creation (simulating DB failure)
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

  // Restore original implementation
  createUserSpy.mockRestore()
})

it('should check cache before checking database for existing user', async () => {
  // Create a mock user that matches the User type exactly
  const mockUser = {
    id: 'test-id-1234',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'password',
    avatarUrl: null,
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // Spy on database function to verify it's not called
  const getUserByEmailSpy = vi.spyOn(usersRepository, 'getUserByEmail')

  // Mock the cache to return a user (simulating user in cache)
  const getCachedUserByEmailSpy = vi
    .spyOn(cacheModule, 'getCachedUserByEmail')
    .mockResolvedValueOnce(mockUser)

  // Attempt to create user with same email
  const result = await sut({
    firstName: mockUser.firstName,
    lastName: mockUser.lastName,
    email: mockUser.email,
    password: mockUser.password,
    avatarUrl: mockUser.avatarUrl,
  })

  // Should fail with USER_ALREADY_EXISTS
  expect(result.status).toBe('error')
  expect(result.code).toBe(createUserErrors.USER_ALREADY_EXISTS.code)

  // Verify cache function was called
  expect(getCachedUserByEmailSpy).toHaveBeenCalledWith({
    email: mockUser.email,
  })

  // Since first check was with cache, database function should not be called
  expect(getUserByEmailSpy).not.toHaveBeenCalled()

  // Restore original implementations
  getUserByEmailSpy.mockRestore()
  getCachedUserByEmailSpy.mockRestore()
})
