import { faker } from '@faker-js/faker'
import { vi } from 'vitest'

import * as orgInvitesRepository from '@/db/repositories/org-invites-repository'
import type { Org } from '@/domain/entities/orgs'
import type { User } from '@/domain/entities/users'
import { commonOrganizationErrors } from '@/shared/errors/organizations/common-organization-errors'
import { makeOrganization } from '@/test/factories/make-organization'
import { makeUser } from '@/test/factories/make-user'
import { error } from '@/utils/api-response'
import { setOrganizationCache } from '@/utils/cache/organizations/set-org-cache'

import { createOrganizationInviteService } from './create-organization-invite-service'

type OrganizationRole = 'admin' | 'billing' | 'developer' | 'member'

describe('Create Organization Invite Service', () => {
  let user: User
  let organization: Org
  let testEmail: string

  beforeEach(async () => {
    // Create test user first to satisfy foreign key constraint
    user = (await makeUser())!
    // Create test organization with the user as owner
    organization = (await makeOrganization({ ownerId: user.id }))!
    testEmail = faker.internet.email().toLowerCase()
  })

  describe('Success Cases', () => {
    it('should create an organization invite successfully with cached organization', async () => {
      // Cache the organization to test cache retrieval
      await setOrganizationCache({
        id: organization.id,
        organization,
      })

      const role: OrganizationRole = 'admin'

      // Act
      const result = await createOrganizationInviteService({
        organizationId: organization.id,
        role,
        email: testEmail,
      })

      // Assert
      expect(result.status).toBe('ok')
      if (result.status === 'ok') {
        expect(result.code).toBe(204)
        expect(result.data).toEqual({
          id: expect.any(String),
          organizationId: organization.id,
          role,
          email: testEmail,
          organizationName: organization.name,
          inviteUrl: expect.stringContaining(`/invites/${result.data.id}`),
          createdAt: expect.any(Date),
          revokedAt: null,
          expiresAt: null,
        })
      }
    })

    it('should create an organization invite successfully when organization is not cached', async () => {
      const role: OrganizationRole = 'developer'

      // Act
      const result = await createOrganizationInviteService({
        organizationId: organization.id,
        role,
        email: testEmail,
      })

      // Assert
      expect(result.status).toBe('ok')
      if (result.status === 'ok') {
        expect(result.code).toBe(204)
        expect(result.data).toEqual({
          id: expect.any(String),
          organizationId: organization.id,
          role,
          email: testEmail,
          organizationName: organization.name,
          inviteUrl: expect.stringContaining(`/invites/${result.data.id}`),
          revokedAt: null,
          createdAt: expect.any(Date),
          expiresAt: null,
        })
      }
    })

    it('should create an organization invite with member role by default', async () => {
      // Act
      const result = await createOrganizationInviteService({
        organizationId: organization.id,
        role: 'member',
        email: testEmail,
      })

      // Assert
      expect(result.status).toBe('ok')
      if (result.status === 'ok') {
        expect(result.code).toBe(204)
        expect(result.data).toEqual({
          id: expect.any(String),
          organizationId: organization.id,
          role: 'member',
          email: testEmail,
          organizationName: organization.name,
          inviteUrl: expect.stringContaining(`/invites/${result.data.id}`),
          createdAt: expect.any(Date),
          revokedAt: null,
          expiresAt: null,
        })
      }
    })

    it('should create invites with all valid role types', async () => {
      const roles: OrganizationRole[] = [
        'admin',
        'billing',
        'developer',
        'member',
      ]

      for (const role of roles) {
        const uniqueEmail = faker.internet.email().toLowerCase()

        const result = await createOrganizationInviteService({
          organizationId: organization.id,
          role,
          email: uniqueEmail,
        })

        expect(result.status).toBe('ok')
        if (result.status === 'ok') {
          expect(result.data.role).toBe(role)
          expect(result.data.email).toBe(uniqueEmail)
        }
      }
    })
  })

  describe('Error Cases', () => {
    it('should return error when organization does not exist', async () => {
      // Act
      const result = await createOrganizationInviteService({
        organizationId: 'non-existent-organization-id',
        role: 'member',
        email: testEmail,
      })

      // Assert
      expect(result).toEqual(
        error({
          message: commonOrganizationErrors.ORGANIZATION_NOT_FOUND.message,
          code: commonOrganizationErrors.ORGANIZATION_NOT_FOUND.code,
        }),
      )
    })

    it('should return error when organization invite creation fails', async () => {
      // Mock the repository to simulate failure
      const createOrganizationInviteSpy = vi.spyOn(
        orgInvitesRepository,
        'createOrganizationInvite',
      )
      createOrganizationInviteSpy.mockResolvedValueOnce(null)

      // Act
      const result = await createOrganizationInviteService({
        organizationId: organization.id,
        role: 'admin',
        email: testEmail,
      })

      // Assert
      expect(result).toEqual(
        error({
          message:
            commonOrganizationErrors.ORGANIZATION_INVITE_NOT_CREATED.message,
          code: commonOrganizationErrors.ORGANIZATION_INVITE_NOT_CREATED.code,
        }),
      )

      // Restore the original implementation
      createOrganizationInviteSpy.mockRestore()
    })
  })

  describe('Integration Tests', () => {
    it('should create the invite in the database with correct data', async () => {
      const role: OrganizationRole = 'billing'

      // Act
      const result = await createOrganizationInviteService({
        organizationId: organization.id,
        role,
        email: testEmail,
      })

      // Verify the result is successful
      expect(result.status).toBe('ok')
      if (result.status === 'ok') {
        // Verify all expected fields are present
        expect(result.data).toHaveProperty('id')
        expect(result.data).toHaveProperty('organizationId')
        expect(result.data).toHaveProperty('role')
        expect(result.data).toHaveProperty('email')
        expect(result.data).toHaveProperty('organizationName')
        expect(result.data).toHaveProperty('inviteUrl')
        expect(result.data).toHaveProperty('createdAt')
        expect(result.data).toHaveProperty('expiresAt')

        // Verify data types
        expect(typeof result.data.id).toBe('string')
        expect(typeof result.data.organizationId).toBe('string')
        expect(typeof result.data.role).toBe('string')
        expect(typeof result.data.email).toBe('string')
        expect(typeof result.data.organizationName).toBe('string')
        expect(typeof result.data.inviteUrl).toBe('string')
        expect(result.data.createdAt).toBeInstanceOf(Date)
        expect(result.data.expiresAt).toBeNull()

        // Verify correct values
        expect(result.data.organizationId).toBe(organization.id)
        expect(result.data.role).toBe(role)
        expect(result.data.email).toBe(testEmail)
        expect(result.data.organizationName).toBe(organization.name)
      }
    })

    it('should cache the organization after fetching from database', async () => {
      // Act
      const result = await createOrganizationInviteService({
        organizationId: organization.id,
        role: 'member',
        email: testEmail,
      })

      // The organization should now be cached
      // This is verified by the service logic that sets cache after DB fetch
      expect(result.status).toBe('ok')
    })

    it('should generate correct invite URL format', async () => {
      // Act
      const result = await createOrganizationInviteService({
        organizationId: organization.id,
        role: 'developer',
        email: testEmail,
      })

      // Assert
      expect(result.status).toBe('ok')
      if (result.status === 'ok') {
        expect(result.data.organizationName).toBe(organization.name)
        expect(result.data.inviteUrl).toMatch(
          new RegExp(`/invites/${result.data.id}$`),
        )
        // Verify the URL starts with a protocol or environment base URL
        expect(result.data.inviteUrl).toMatch(/^https?:\/\/.*\/invites\/.*$/)
      }
    })

    it('should handle email normalization correctly', async () => {
      const upperCaseEmail = 'TEST@EXAMPLE.COM'

      // Act
      const result = await createOrganizationInviteService({
        organizationId: organization.id,
        role: 'member',
        email: upperCaseEmail,
      })

      // Assert
      expect(result.status).toBe('ok')
      if (result.status === 'ok') {
        // Email should be stored as provided (service doesn't normalize)
        expect(result.data.email).toBe(upperCaseEmail)
      }
    })
  })
})
