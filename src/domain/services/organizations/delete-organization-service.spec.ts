import * as organizationsRepository from '@/db/repositories/organizations-repository'
import type { Org } from '@/domain/entities/orgs'
import type { User } from '@/domain/entities/users'
import { commonOrganizationErrors } from '@/shared/errors/organizations/common-organization-errors'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
import { makeOrganization } from '@/test/factories/make-organization'
import { makeUser } from '@/test/factories/make-user'
import { error, success } from '@/utils/api-response'
import { getCachedOrganization } from '@/utils/cache/organizations/get-cached-org'
import { setUserCache } from '@/utils/cache/users/set-user-cache'

import { deleteOrganizationService } from './delete-organization-service'

describe('Delete Organization Service', () => {
  let user: User
  let organization: Org

  beforeEach(async () => {
    user = (await makeUser())!
    organization = (await makeOrganization({ ownerId: user.id }))!
  })

  it('should delete organization successfully when user is owner', async () => {
    // Act
    const result = await deleteOrganizationService({
      organizationId: organization.id,
      userId: user.id,
    })

    // Assert
    expect(result).toEqual(
      success({
        data: organization,
      }),
    )
  })

  it('should return error if user is not organization owner', async () => {
    // Arrange
    const otherUser = (await makeUser())!

    // Act
    const result = await deleteOrganizationService({
      organizationId: organization.id,
      userId: otherUser.id,
    })

    // Assert
    expect(result).toEqual(
      error({
        message: commonOrganizationErrors.NOT_ORGANIZATION_OWNER.message,
        code: commonOrganizationErrors.NOT_ORGANIZATION_OWNER.code,
      }),
    )
  })

  it('should return error if user not found', async () => {
    // Act
    const result = await deleteOrganizationService({
      organizationId: organization.id,
      userId: 'non-existent-id',
    })

    // Assert
    expect(result).toEqual(
      error({
        message: commonUserErrors.USER_NOT_FOUND.message,
        code: commonUserErrors.USER_NOT_FOUND.code,
      }),
    )
  })

  it('should return error if organization not found', async () => {
    // Cache the user to test cache retrieval
    await setUserCache({ user })

    // Act
    const result = await deleteOrganizationService({
      organizationId: 'non-existent-id',
      userId: user.id,
    })

    // Assert
    expect(result).toEqual(
      error({
        message: commonOrganizationErrors.ORGANIZATION_NOT_FOUND.message,
        code: commonOrganizationErrors.ORGANIZATION_NOT_FOUND.code,
      }),
    )
  })

  it('should find user from cache and return error if organization not found', async () => {
    // Cache the user
    await setUserCache({ user })

    // Act
    const result = await deleteOrganizationService({
      organizationId: 'non-existent-id',
      userId: user.id,
    })

    // Assert
    expect(result).toEqual(
      error({
        message: commonOrganizationErrors.ORGANIZATION_NOT_FOUND.message,
        code: commonOrganizationErrors.ORGANIZATION_NOT_FOUND.code,
      }),
    )
  })

  it('should find organization from cache and return error if user not found', async () => {
    // Cache the organization
    await getCachedOrganization({ id: organization.id })

    // Act
    const result = await deleteOrganizationService({
      organizationId: organization.id,
      userId: 'non-existent-id',
    })

    // Assert
    expect(result).toEqual(
      error({
        message: commonUserErrors.USER_NOT_FOUND.message,
        code: commonUserErrors.USER_NOT_FOUND.code,
      }),
    )
  })

  it('should find both user and organization from cache and delete successfully', async () => {
    // Cache both user and organization
    await setUserCache({ user })
    await getCachedOrganization({ id: organization.id })

    // Act
    const result = await deleteOrganizationService({
      organizationId: organization.id,
      userId: user.id,
    })

    // Assert
    expect(result).toEqual(
      success({
        data: organization,
      }),
    )
  })

  it('should return error if organization deletion fails', async () => {
    // Arrange
    const deleteOrganizationSpy = vi
      .spyOn(organizationsRepository, 'deleteOrganization')
      .mockResolvedValueOnce(null)

    // Act
    const result = await deleteOrganizationService({
      organizationId: organization.id,
      userId: user.id,
    })

    // Assert
    expect(result).toEqual(
      error({
        message: commonOrganizationErrors.FAILED_TO_DELETE_ORGANIZATION.message,
        code: commonOrganizationErrors.FAILED_TO_DELETE_ORGANIZATION.code,
      }),
    )

    // Cleanup
    deleteOrganizationSpy.mockRestore()
  })
})
