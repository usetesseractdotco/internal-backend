import { beforeEach, describe, expect, it } from 'vitest'

import type { OrgInvite } from '@/domain/entities/org-invites'
import type { Org } from '@/domain/entities/orgs'
import type { User } from '@/domain/entities/users'
import { commonOrgInviteErrors } from '@/shared/errors/organizations/invites/common-org-invite-errors'
import { commonMemberErrors } from '@/shared/errors/organizations/members/common-members-errors'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
import { makeInvite } from '@/test/factories/make-invite'
import { makeMember } from '@/test/factories/make-member'
import { makeOrganization } from '@/test/factories/make-organization'
import { makeUser } from '@/test/factories/make-user'
import { error } from '@/utils/api-response'
import { setInviteCache } from '@/utils/cache/invites/set-invite-cache'

import { retrieveInviteService } from './retrive-invite-service'

describe('Retrieve Invite Service', () => {
  let user: User
  let organization: Org
  let invite: OrgInvite

  beforeEach(async () => {
    user = (await makeUser())!
    organization = (await makeOrganization({ ownerId: user.id }))!
    invite = (await makeInvite({
      organizationId: organization.id,
      role: 'member',
    }))!
  })

  describe('Success Cases', () => {
    it('should retrieve invite and create member successfully with cached invite', async () => {
      // Cache the invite to test cache retrieval
      await setInviteCache({
        id: invite.id,
        invite,
      })

      // Act
      const result = await retrieveInviteService({
        inviteId: invite.id,
        userId: user.id,
      })

      // Assert
      expect(result.status).toBe('ok')
      if (result.status === 'ok') {
        expect(result.code).toBe(201)
        expect(result.data).toEqual({
          id: expect.any(String),
          organizationId: organization.id,
          userId: user.id,
          role: invite.role,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      }
    })

    it('should retrieve invite and create member successfully when invite is not cached', async () => {
      // Act
      const result = await retrieveInviteService({
        inviteId: invite.id,
        userId: user.id,
      })

      // Assert
      expect(result.status).toBe('ok')
      if (result.status === 'ok') {
        expect(result.code).toBe(201)
        expect(result.data).toEqual({
          id: expect.any(String),
          organizationId: organization.id,
          userId: user.id,
          role: invite.role,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      }
    })

    it('should create member with admin role when invite has admin role', async () => {
      // Create an invite with admin role
      const adminInvite = (await makeInvite({
        organizationId: organization.id,
        role: 'admin',
      }))!

      // Act
      const result = await retrieveInviteService({
        inviteId: adminInvite.id,
        userId: user.id,
      })

      // Assert
      expect(result.status).toBe('ok')
      if (result.status === 'ok' && result.data) {
        expect(result.code).toBe(201)
        expect(result.data.role).toBe('admin')
        expect(result.data.userId).toBe(user.id)
        expect(result.data.organizationId).toBe(organization.id)
      }
    })

    it('should create member with developer role when invite has developer role', async () => {
      // Create an invite with developer role
      const developerInvite = (await makeInvite({
        organizationId: organization.id,
        role: 'developer',
      }))!

      // Act
      const result = await retrieveInviteService({
        inviteId: developerInvite.id,
        userId: user.id,
      })

      // Assert
      expect(result.status).toBe('ok')
      if (result.status === 'ok' && result.data) {
        expect(result.code).toBe(201)
        expect(result.data.role).toBe('developer')
        expect(result.data.userId).toBe(user.id)
        expect(result.data.organizationId).toBe(organization.id)
      }
    })
  })

  describe('Error Cases', () => {
    it('should return error when invite does not exist', async () => {
      // Act
      const result = await retrieveInviteService({
        inviteId: 'non-existent-invite-id',
        userId: user.id,
      })

      // Assert
      expect(result).toEqual(
        error({
          message: commonOrgInviteErrors.INVITE_NOT_FOUND.message,
          code: commonOrgInviteErrors.INVITE_NOT_FOUND.code,
        }),
      )
    })

    it('should return error when user does not exist', async () => {
      // Act
      const result = await retrieveInviteService({
        inviteId: invite.id,
        userId: 'non-existent-user-id',
      })

      // Assert
      expect(result).toEqual(
        error({
          message: commonUserErrors.USER_NOT_FOUND.message,
          code: commonUserErrors.USER_NOT_FOUND.code,
        }),
      )
    })

    it('should return error when user is already a member of the organization', async () => {
      // Create an existing member
      await makeMember({
        userId: user.id,
        organizationId: organization.id,
        role: 'member',
      })

      // Act
      const result = await retrieveInviteService({
        inviteId: invite.id,
        userId: user.id,
      })

      // Assert
      expect(result).toEqual(
        error({
          message: commonMemberErrors.MEMBER_ALREADY_EXISTS.message,
          code: commonMemberErrors.MEMBER_ALREADY_EXISTS.code,
        }),
      )
    })

    it('should return error when invite exists but user does not exist in cache scenario', async () => {
      // Cache the invite to test cache retrieval path
      await setInviteCache({
        id: invite.id,
        invite,
      })

      // Act
      const result = await retrieveInviteService({
        inviteId: invite.id,
        userId: 'non-existent-user-id',
      })

      // Assert
      expect(result).toEqual(
        error({
          message: commonUserErrors.USER_NOT_FOUND.message,
          code: commonUserErrors.USER_NOT_FOUND.code,
        }),
      )
    })

    it('should return error when user is already a member in cached invite scenario', async () => {
      // Cache the invite
      await setInviteCache({
        id: invite.id,
        invite,
      })

      // Create an existing member
      await makeMember({
        userId: user.id,
        organizationId: organization.id,
        role: 'admin',
      })

      // Act
      const result = await retrieveInviteService({
        inviteId: invite.id,
        userId: user.id,
      })

      // Assert
      expect(result).toEqual(
        error({
          message: commonMemberErrors.MEMBER_ALREADY_EXISTS.message,
          code: commonMemberErrors.MEMBER_ALREADY_EXISTS.code,
        }),
      )
    })

    it('should return error when invite is expired', async () => {
      // Create an expired invite (1 day ago)
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 1)

      const expiredInvite = (await makeInvite({
        organizationId: organization.id,
        role: 'member',
        expiresAt: expiredDate,
      }))!

      // Act
      const result = await retrieveInviteService({
        inviteId: expiredInvite.id,
        userId: user.id,
      })

      // Assert
      expect(result).toEqual(
        error({
          message: commonOrgInviteErrors.INVITE_EXPIRED.message,
          code: commonOrgInviteErrors.INVITE_EXPIRED.code,
        }),
      )
    })

    it('should return error when invite is expired with cached invite', async () => {
      // Create an expired invite (1 day ago)
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 1)

      const expiredInvite = (await makeInvite({
        organizationId: organization.id,
        role: 'member',
        expiresAt: expiredDate,
      }))!

      // Cache the expired invite
      await setInviteCache({
        id: expiredInvite.id,
        invite: expiredInvite,
      })

      // Act
      const result = await retrieveInviteService({
        inviteId: expiredInvite.id,
        userId: user.id,
      })

      // Assert
      expect(result).toEqual(
        error({
          message: commonOrgInviteErrors.INVITE_EXPIRED.message,
          code: commonOrgInviteErrors.INVITE_EXPIRED.code,
        }),
      )
    })
  })

  describe('Integration Tests', () => {
    it('should create the member in the database with correct data', async () => {
      // Act
      const result = await retrieveInviteService({
        inviteId: invite.id,
        userId: user.id,
      })

      // Verify the result is successful
      expect(result.status).toBe('ok')

      // Verify member was actually created in database by trying to create the same member again
      // which should fail due to the existing member
      const secondResult = await retrieveInviteService({
        inviteId: invite.id,
        userId: user.id,
      })

      expect(secondResult.status).toBe('error')
      expect(secondResult.code).toBe(
        commonMemberErrors.MEMBER_ALREADY_EXISTS.code,
      )
    })

    it('should cache the invite after fetching from database', async () => {
      // Ensure invite is not cached initially
      // First call should fetch from DB and cache the invite
      const result = await retrieveInviteService({
        inviteId: invite.id,
        userId: user.id,
      })

      expect(result.status).toBe('ok')

      // Create a new user to test with cached invite
      const newUser = (await makeUser())!

      // Second call with different user should use cached invite
      const cachedResult = await retrieveInviteService({
        inviteId: invite.id,
        userId: newUser.id,
      })

      expect(cachedResult.status).toBe('ok')
      if (cachedResult.status === 'ok' && cachedResult.data) {
        expect(cachedResult.data.userId).toBe(newUser.id)
        expect(cachedResult.data.organizationId).toBe(organization.id)
        expect(cachedResult.data.role).toBe(invite.role)
      }
    })

    it('should handle different invite roles correctly', async () => {
      const roles: Array<'admin' | 'billing' | 'developer' | 'member'> = [
        'admin',
        'billing',
        'developer',
        'member',
      ]

      for (const role of roles) {
        // Create a unique user and invite for each role
        const testUser = (await makeUser())!
        const roleInvite = (await makeInvite({
          organizationId: organization.id,
          role,
        }))!

        // Act
        const result = await retrieveInviteService({
          inviteId: roleInvite.id,
          userId: testUser.id,
        })

        // Assert
        expect(result.status).toBe('ok')
        if (result.status === 'ok' && result.data) {
          expect(result.data.role).toBe(role)
          expect(result.data.userId).toBe(testUser.id)
          expect(result.data.organizationId).toBe(organization.id)
        }
      }
    })

    it('should return proper member data structure', async () => {
      // Act
      const result = await retrieveInviteService({
        inviteId: invite.id,
        userId: user.id,
      })

      // Assert
      expect(result.status).toBe('ok')
      if (result.status === 'ok' && result.data) {
        // Verify the member data structure matches what's expected
        expect(result.data).toHaveProperty('id')
        expect(result.data).toHaveProperty('organizationId')
        expect(result.data).toHaveProperty('userId')
        expect(result.data).toHaveProperty('role')
        expect(result.data).toHaveProperty('createdAt')
        expect(result.data).toHaveProperty('updatedAt')
        // Verify data types
        expect(typeof result.data.id).toBe('string')
        expect(typeof result.data.organizationId).toBe('string')
        expect(typeof result.data.userId).toBe('string')
        expect(typeof result.data.role).toBe('string')
        expect(result.data.createdAt).toBeInstanceOf(Date)
        expect(result.data.updatedAt).toBeInstanceOf(Date)

        // Verify the data values are correct
        expect(result.data.organizationId).toBe(organization.id)
        expect(result.data.userId).toBe(user.id)
        expect(result.data.role).toBe(invite.role)
      }
    })
  })
})
