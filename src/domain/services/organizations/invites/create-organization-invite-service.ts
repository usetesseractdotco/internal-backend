import { createOrganizationInvite } from '@/db/repositories/org-invites-repository'
import { getOrganizationById } from '@/db/repositories/organizations-repository'
import { getRoleById } from '@/db/repositories/role-repository'
import { env } from '@/env'
import { commonOrganizationErrors } from '@/shared/errors/organizations/common-organization-errors'
import { error, success } from '@/utils/api-response'
import { getCachedOrganization } from '@/utils/cache/organizations/get-cached-org'
import { setOrganizationCache } from '@/utils/cache/organizations/set-org-cache'

/**
 * Creates a new organization
 * @param organizationId The ID of the organization
 * @param email The email of the user who will be invited to the organization
 * @returns The created organization invite
 */
export async function createOrganizationInviteService({
  organizationId,
  roleId,
  email,
}: {
  organizationId: string
  roleId: string | null
  email: string
}) {
  let organization = await getCachedOrganization({
    id: organizationId,
  })

  if (!organization) {
    organization = await getOrganizationById({
      id: organizationId,
    })

    if (!organization)
      return error({
        message: commonOrganizationErrors.ORGANIZATION_NOT_FOUND.message,
        code: commonOrganizationErrors.ORGANIZATION_NOT_FOUND.code,
      })

    setOrganizationCache({
      id: organization.id,
      organization,
    })
  }

  const role = roleId ? await getRoleById({ id: roleId }) : null

  const invite = await createOrganizationInvite({
    organizationId,
    roleId: role?.id,
    email,
  })

  if (!invite)
    return error({
      message: commonOrganizationErrors.ORGANIZATION_INVITE_NOT_CREATED.message,
      code: commonOrganizationErrors.ORGANIZATION_INVITE_NOT_CREATED.code,
    })

  return success({
    data: {
      ...invite,
      organizationName: organization.name,
      inviteUrl: `${env.app.CLIENT_URL}/invites/${invite.id}`,
    },
    code: 204,
  })
}
