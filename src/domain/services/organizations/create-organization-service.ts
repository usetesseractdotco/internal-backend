import {
  createOrganization,
  getOrganizationsCountByUserId,
} from '@/db/repositories/organizations-repository'
import { getUserById } from '@/db/repositories/users-repository'
import { createOrganizationErrors } from '@/shared/errors/organizations/create-organization-errors'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
import { error, success } from '@/utils/api-response'
import { getCachedUserById } from '@/utils/cache/users/get-cached-user'

/**
 * Creates a new organization
 * @param name The name of the organization
 * @param ownerId The ID of the user who will be the owner of the organization
 * @param logoUrl The URL of the organization's logo
 * @returns The created organization
 */
export async function createOrganizationService({
  name,
  logoUrl,
  ownerId,
}: {
  name: string
  ownerId: string
  logoUrl?: string
}) {
  let user = await getCachedUserById({ id: ownerId })

  if (!user) {
    user = await getUserById({ id: ownerId })

    if (!user)
      return error({
        message: commonUserErrors.USER_NOT_FOUND.message,
        code: commonUserErrors.USER_NOT_FOUND.code,
      })
  }

  const organizationsCount = await getOrganizationsCountByUserId(ownerId)

  if (organizationsCount >= 3)
    return error({
      message: createOrganizationErrors.MAX_ORGANIZATIONS_REACHED.message,
      code: createOrganizationErrors.MAX_ORGANIZATIONS_REACHED.code,
    })

  const organization = await createOrganization({
    name,
    ownerId,
    logoUrl,
  })

  if (!organization)
    return error({
      message: createOrganizationErrors.FAILED_TO_CREATE_ORGANIZATION.message,
      code: createOrganizationErrors.FAILED_TO_CREATE_ORGANIZATION.code,
    })

  return success({
    data: organization,
  })
}
