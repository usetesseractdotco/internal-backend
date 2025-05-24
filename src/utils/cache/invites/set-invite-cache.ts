import type { OrgInvite } from '@/domain/entities/org-invites'

import { ONE_WEEK_IN_SECONDS } from '..'
import { setCache } from '../set-cache'

export async function setInviteCache({
  id,
  invite,
}: {
  id: string
  invite: OrgInvite
}) {
  await setCache(`invite:${id}`, JSON.stringify(invite), ONE_WEEK_IN_SECONDS)
}
