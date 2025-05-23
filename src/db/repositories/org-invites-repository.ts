import type { InsertOrgInviteModel } from '@/domain/entities/org-invites'

import { db } from '..'
import { organizationInvites } from '../schemas/org-invites'

export async function createOrganizationInvite(data: InsertOrgInviteModel) {
  const organization = await db
    .insert(organizationInvites)
    .values(data)
    .returning()

  if (!organization[0]) return null

  return organization[0]
}
