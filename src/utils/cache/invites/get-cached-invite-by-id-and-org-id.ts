import type { OrgInvite } from '@/domain/entities/org-invites'

import { getCache } from '../get-cache'

export async function getCachedInviteByIdAndOrganizationId({
  id,
  organizationId,
}: {
  id: string
  organizationId: string
}) {
  const cachedInvite = await getCache<OrgInvite>(
    `organization:${organizationId}:invite:${id}`,
  )

  return cachedInvite
}

