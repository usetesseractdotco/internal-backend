import type { OrgInvite } from '@/domain/entities/org-invites'

import { getCache } from '../get-cache'

export async function getCachedInviteById({ id }: { id: string }) {
  const cachedInvite = await getCache<OrgInvite>(`invite:${id}`)

  return cachedInvite
}
