import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as organizationsRepository from '@/db/repositories/organizations-repository'
import type { User } from '@/domain/entities/users'
import { createOrganizationErrors } from '@/shared/errors/organizations/create-organization-errors'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
import { makeOrganization } from '@/test/factories/make-organization'
import { makeUser } from '@/test/factories/make-user'
import { error } from '@/utils/api-response'
import { setUserCache } from '@/utils/cache/users/set-user-cache'

import { createOrganizationService } from './create-organization'

describe('Create Organization Service', () => {
  let user: User

  beforeEach(async () => {
    user = (await makeUser())!
  })

  it('should create an organization successfully', async () => {
    // Cache the user to test cache retrieval
    await setUserCache({ user })

    // Act
    const result = await createOrganizationService({
      name: 'Test Organization',
      ownerId: user.id,
      logoUrl: 'https://example.com/logo.png',
    })

    // Assert
    expect(result.status).toBe('ok')
    if (result.status === 'ok') {
      expect(result.data.name).toBe('Test Organization')
      expect(result.data.ownerId).toBe(user.id)
      expect(result.data.logoUrl).toBe('https://example.com/logo.png')
    }
  })

  it('should create an organization successfully when user is not in cache', async () => {
    // Act
    const result = await createOrganizationService({
      name: 'Test Organization',
      ownerId: user.id,
    })

    // Assert
    expect(result.status).toBe('ok')
    if (result.status === 'ok') {
      expect(result.data.name).toBe('Test Organization')
      expect(result.data.ownerId).toBe(user.id)
    }
  })

  it('should return error if user not found', async () => {
    // Act
    const result = await createOrganizationService({
      name: 'Test Organization',
      ownerId: 'non-existent-id',
    })

    // Assert
    expect(result).toEqual(
      error({
        message: commonUserErrors.USER_NOT_FOUND.message,
        code: commonUserErrors.USER_NOT_FOUND.code,
      }),
    )
  })

  it('should return error if user has reached max organizations limit', async () => {
    // Create 3 organizations for the user to reach the limit
    await makeOrganization({ ownerId: user.id })
    await makeOrganization({ ownerId: user.id })
    await makeOrganization({ ownerId: user.id })

    // Act
    const result = await createOrganizationService({
      name: 'Test Organization',
      ownerId: user.id,
    })

    // Assert
    expect(result).toEqual(
      error({
        message: createOrganizationErrors.MAX_ORGANIZATIONS_REACHED.message,
        code: createOrganizationErrors.MAX_ORGANIZATIONS_REACHED.code,
      }),
    )
  })

  it('should return error if organization creation fails', async () => {
    // This is an exceptional case where mocking is necessary
    // as we need to simulate a database failure that's hard to trigger otherwise
    const createOrganizationSpy = vi.spyOn(
      organizationsRepository,
      'createOrganization',
    )
    createOrganizationSpy.mockResolvedValueOnce(null)

    // Act
    const result = await createOrganizationService({
      name: 'Test Organization',
      ownerId: user.id,
    })

    // Assert
    expect(result).toEqual(
      error({
        message: createOrganizationErrors.FAILED_TO_CREATE_ORGANIZATION.message,
        code: createOrganizationErrors.FAILED_TO_CREATE_ORGANIZATION.code,
      }),
    )

    // Restore the original implementation
    createOrganizationSpy.mockRestore()
  })
})
