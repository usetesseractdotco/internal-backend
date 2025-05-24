import { eq } from 'drizzle-orm'

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

export async function getInviteById({ id }: { id: string }) {
  const invite = await db
    .select()
    .from(organizationInvites)
    .where(eq(organizationInvites.id, id))

  if (!invite[0]) return null

  return invite[0]
}
