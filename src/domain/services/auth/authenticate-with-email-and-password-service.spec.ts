import bcrypt from 'bcryptjs'

import { authWithEmailErrors } from '@/shared/errors/auth/auth-with-email-errors'
import { makeSession } from '@/test/factories/make-sessions'
import { makeRawUser, makeUser } from '@/test/factories/make-user'
import { getCachedUserById } from '@/utils/cache/users/get-cached-user'
import { setUserCache } from '@/utils/cache/users/set-user-cache'

import { authenticateWithEmailAndPassword } from './authenticate-with-email-and-password-service'

const sut = authenticateWithEmailAndPassword

it('should be able to create a valid user', async () => {
  const rawUser = await makeUser({
    password: 'password',
  })

  if (!rawUser) throw new Error('User not created')

  const result = await sut({
    email: rawUser.email,
    password: 'password',
    ipAddress: '127.0.0.1',
    userAgent: 'test',
  })

  expect(result).toBeDefined()
  expect(result.code).toBe(204)
  if (result.code !== 204) throw new Error('User not created')
  if (result.status === 'ok') expect(result.data).toBeTruthy()
})

it('should be able to authenticate with cached user', async () => {
  // Create user
  const rawUser = await makeUser()
  if (!rawUser) throw new Error('User not created')

  // Generate hashed password that will match the test password
  const password = 'cached-user-test-password'
  const hashedPassword = await bcrypt.hash(password, 10)

  // Set cache with our test user and the known password hash
  const userWithPassword = {
    ...rawUser,
    password: hashedPassword,
  }
  await setUserCache({ user: userWithPassword })

  const cachedUser = await getCachedUserById({ id: rawUser.id })
  expect(cachedUser).toBeDefined()
  expect(cachedUser?.password).toBe(hashedPassword)

  // Attempt authentication - this should use the cached path (lines 47-63)
  const result = await sut({
    email: rawUser.email,
    password,
    ipAddress: '127.0.0.1',
    userAgent: 'test-cache',
  })

  // Verify success
  expect(result).toBeDefined()
  expect(result.code).toBe(204)
  expect(result.status).toBe('ok')
  if (result.status === 'ok') {
    expect(result.data.accessToken).toBeTruthy()
    expect(result.data.refreshToken).toBeTruthy()
  }
})

it('should not be able to create a valid user if the session is already active', async () => {
  const rawUser = await makeUser()

  if (!rawUser) throw new Error('User not created')

  await makeSession({
    userId: rawUser.id,
    ipAddress: '127.0.0.1',
    userAgent: 'test',
    status: 'active',
  })

  const result = await sut({
    email: rawUser.email,
    password: 'password',
    ipAddress: '127.0.0.1',
    userAgent: 'test',
  })

  expect(result).toBeDefined()
  expect(result.code).toBe(
    authWithEmailErrors.USER_ALREADY_HAS_SESSION_ACTIVE.code,
  )
  if (result.code !== authWithEmailErrors.USER_ALREADY_HAS_SESSION_ACTIVE.code)
    throw new Error('Succeded')
  if (result.status === 'error') {
    expect(result.message).toEqual(
      authWithEmailErrors.USER_ALREADY_HAS_SESSION_ACTIVE.message,
    )
  }
})

it('should not be able to create a valid user if the user does not exist', async () => {
  const rawUser = makeRawUser({
    password: 'password',
  })

  const result = await sut({
    email: rawUser.email,
    password: 'password',
    ipAddress: '127.0.0.1',
    userAgent: 'test',
  })

  expect(result).toBeDefined()
  expect(result.code).toBe(401)
  if (result.code !== 401) throw new Error('Succeded')
  if (result.status === 'error') {
    expect(result.message).toEqual(
      authWithEmailErrors.INVALID_CREDENTIALS.message,
    )
  }
})

it('should not be able to create a valid user if the user password is invalid', async () => {
  const rawUser = await makeUser()

  if (!rawUser) throw new Error('User not created')

  const result = await sut({
    email: rawUser.email,
    password: 'invalid-password',
    ipAddress: '127.0.0.1',
    userAgent: 'test',
  })

  expect(result).toBeDefined()
  expect(result.code).toBe(401)
  if (result.code !== 401) throw new Error('Succeded')
  if (result.status === 'error') {
    expect(result.message).toEqual(
      authWithEmailErrors.INVALID_CREDENTIALS.message,
    )
  }
})

it('should handle existing non-active sessions by deleting them', async () => {
  const rawUser = await makeUser()
  if (!rawUser) throw new Error('User not created')

  // Create an existing but non-active session
  await makeSession({
    userId: rawUser.id,
    ipAddress: '127.0.0.1',
    userAgent: 'test',
    status: 'inactive', // Not an active session
  })

  // This should delete the existing session and create a new one (lines 101-105)
  const result = await sut({
    email: rawUser.email,
    password: 'password',
    ipAddress: '127.0.0.1',
    userAgent: 'test',
  })

  expect(result).toBeDefined()
  expect(result.code).toBe(204)
  expect(result.status).toBe('ok')
  if (result.status === 'ok') {
    expect(result.data.accessToken).toBeTruthy()
    expect(result.data.refreshToken).toBeTruthy()
  }
})
