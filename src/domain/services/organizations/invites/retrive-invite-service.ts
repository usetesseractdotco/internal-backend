import { isBefore } from 'date-fns'

import {
  createMember,
  getMemberByUserIdAndOrganizationId,
} from '@/db/repositories/members-repository'
import { getInviteById } from '@/db/repositories/org-invites-repository'
import { getUserById } from '@/db/repositories/users-repository'
import { commonOrgInviteErrors } from '@/shared/errors/organizations/invites/common-org-invite-errors'
import { commonMemberErrors } from '@/shared/errors/organizations/members/common-members-errors'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
import { error, success } from '@/utils/api-response'
import { getCachedInviteById } from '@/utils/cache/invites/get-cached-invite'
import { setInviteCache } from '@/utils/cache/invites/set-invite-cache'

/**
 * Retrieves an invite by ID and validates that the user exists
 * @param inviteId The ID of the invite to retrieve
 * @param userId The ID of the user to validate
 * @returns The new member if created, or an error if the user already exists or the invite is not found
 */
export async function retrieveInviteService({
  inviteId,
  userId,
}: {
  inviteId: string
  userId: string
}) {
  let invite = await getCachedInviteById({ id: inviteId })

  if (!invite) {
    invite = await getInviteById({ id: inviteId })

    if (!invite)
      return error({
        message: commonOrgInviteErrors.INVITE_NOT_FOUND.message,
        code: commonOrgInviteErrors.INVITE_NOT_FOUND.code,
      })

    await setInviteCache({ id: inviteId, invite })
  }

  const queriedUser = await getUserById({ id: userId })

  if (!queriedUser) {
    return error({
      message: commonUserErrors.USER_NOT_FOUND.message,
      code: commonUserErrors.USER_NOT_FOUND.code,
    })
  }
  const memberAlreadyExists = await getMemberByUserIdAndOrganizationId({
    userId,
    organizationId: invite.organizationId,
  })

  if (memberAlreadyExists) {
    return error({
      message: commonMemberErrors.MEMBER_ALREADY_EXISTS.message,
      code: commonMemberErrors.MEMBER_ALREADY_EXISTS.code,
    })
  }

  const isExpired = invite.expiresAt && isBefore(invite.expiresAt, new Date())

  if (isExpired) {
    return error({
      message: commonOrgInviteErrors.INVITE_EXPIRED.message,
      code: commonOrgInviteErrors.INVITE_EXPIRED.code,
    })
  }

  const newMember = await createMember({
    userId,
    organizationId: invite.organizationId,
    role: invite.role,
  })

  if (!newMember)
    return error({
      message: commonOrgInviteErrors.MEMBER_CREATION_FAILED.message,
      code: commonOrgInviteErrors.MEMBER_CREATION_FAILED.code,
    })

  return success({
    data: newMember,
    code: 201,
  })
}
