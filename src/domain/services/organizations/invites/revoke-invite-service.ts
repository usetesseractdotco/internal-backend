import {
  getInviteById,
  revokeInviteById,
} from '@/db/repositories/org-invites-repository'
import { getUserByEmail } from '@/db/repositories/users-repository'
import { error, success } from '@/utils/api-response'
import { getCachedInviteByIdAndOrganizationId } from '@/utils/cache/invites/get-cached-invite-by-id-and-org-id'
import { setInviteCache } from '@/utils/cache/invites/set-invite-cache'
import { getCachedUserByEmail } from '@/utils/cache/users/get-cached-user'
import { setUserCache } from '@/utils/cache/users/set-user-cache'

export async function revokeInviteService({
  inviteId,
  organizationId,
}: {
  inviteId: string
  organizationId: string
}) {
  let invite = await getCachedInviteByIdAndOrganizationId({
    id: inviteId,
    organizationId,
  })

  if (!invite) {
    invite = await getInviteById({ id: inviteId })

    if (!invite)
      return error({
        message: 'Invite not found' as const,
        code: 404,
      })

    await setInviteCache({
      id: invite.id,
      invite,
    })
  }

  let user = await getCachedUserByEmail({ email: invite.email })

  if (!user) {
    user = await getUserByEmail({ email: invite.email })

    if (!user)
      return error({
        message: 'User not found' as const,
        code: 404,
      })

    await setUserCache({
      user,
    })
  }

  await revokeInviteById({ id: inviteId })

  return success({
    data: null,
    code: 204,
  })
}
