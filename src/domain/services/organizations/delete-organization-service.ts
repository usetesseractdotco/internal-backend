import {
  deleteOrganization,
  getOrganizationById,
} from '@/db/repositories/organizations-repository'
import { getUserById } from '@/db/repositories/users-repository'
import { commonOrganizationErrors } from '@/shared/errors/organizations/common-organization-errors'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
import { error, success } from '@/utils/api-response'
import { getCachedOrganization } from '@/utils/cache/organizations/get-cached-org'
import { getCachedUserById } from '@/utils/cache/users/get-cached-user'

export async function deleteOrganizationService({
  organizationId,
  userId,
}: {
  organizationId: string
  userId: string
}) {
  let user = await getCachedUserById({
    id: userId,
  })

  if (!user) {
    user = await getUserById({
      id: userId,
    })
  }

  if (!user)
    return error({
      message: commonUserErrors.USER_NOT_FOUND.message,
      code: commonUserErrors.USER_NOT_FOUND.code,
    })

  let organization = await getCachedOrganization({
    id: organizationId,
  })

  if (!organization) {
    organization = await getOrganizationById({
      id: organizationId,
    })
  }

  if (!organization)
    return error({
      message: commonOrganizationErrors.ORGANIZATION_NOT_FOUND.message,
      code: commonOrganizationErrors.ORGANIZATION_NOT_FOUND.code,
    })

  if (organization.ownerId !== userId)
    return error({
      message: commonOrganizationErrors.NOT_ORGANIZATION_OWNER.message,
      code: commonOrganizationErrors.NOT_ORGANIZATION_OWNER.code,
    })

  const deletedOrganization = await deleteOrganization({
    id: organizationId,
  })

  if (!deletedOrganization)
    return error({
      message: commonOrganizationErrors.FAILED_TO_DELETE_ORGANIZATION.message,
      code: commonOrganizationErrors.FAILED_TO_DELETE_ORGANIZATION.code,
    })

  return success({
    data: deletedOrganization,
  })
}
