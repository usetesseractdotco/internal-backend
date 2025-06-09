import { faker } from '@faker-js/faker'

import * as waitlistRepository from '@/db/repositories/waitlist-repository'
import { waitlistErrors } from '@/shared/errors/waitlist/waitlist-errors'
import * as cacheModule from '@/utils/cache/waitlist'

import { joinWaitlistService } from './join-waitlist-service'

const sut = joinWaitlistService

it('should be able to add a valid email to the waitlist', async () => {
  const email = faker.internet.email()

  const result = await sut({ email })

  expect(result).toBeDefined()
  expect(result.status).toBe('ok')
  expect(result.code).toBe(204)
  if (result.status !== 'ok') throw new Error('Email not added to waitlist')
  expect(result.data).toBeNull()

  const cachedWaitlistEntry = await cacheModule.getCachedWaitlistEntryByEmail({
    email,
  })

  expect(cachedWaitlistEntry).toBeTruthy()
})

it('should not be able to add an email that is already in the waitlist', async () => {
  const email = faker.internet.email()

  await waitlistRepository.joinWaitlist({ email })

  const result = await sut({ email })

  expect(result).toBeDefined()
  expect(result.status).toBe('error')
  expect(result.code).toBe(waitlistErrors.USER_ALREADY_IN_WAITLIST.code)
})

it('should return error when waitlist addition fails', async () => {
  const email = faker.internet.email()

  const joinWaitlistSpy = vi
    .spyOn(waitlistRepository, 'joinWaitlist')
    .mockRejectedValueOnce(new Error('Database error'))

  const result = await sut({ email })

  expect(joinWaitlistSpy).toHaveBeenCalled()
  expect(result.status).toBe('error')
  expect(result.code).toBe(waitlistErrors.INTERNAL_SERVER_ERROR.code)

  if (result.status === 'error') {
    expect(result.message).toBe(waitlistErrors.INTERNAL_SERVER_ERROR.message)
  }

  joinWaitlistSpy.mockRestore()
})

it('should check cache before checking database for existing waitlist entry', async () => {
  const email = faker.internet.email()

  const getWaitlistEntryByEmailSpy = vi.spyOn(
    waitlistRepository,
    'getWaitlistEntryByEmail',
  )

  await cacheModule.setWaitlistEntryCache({ email })

  const result = await sut({ email })

  expect(result.status).toBe('error')
  expect(result.code).toBe(waitlistErrors.USER_ALREADY_IN_WAITLIST.code)

  expect(getWaitlistEntryByEmailSpy).not.toHaveBeenCalled()

  getWaitlistEntryByEmailSpy.mockRestore()
})
