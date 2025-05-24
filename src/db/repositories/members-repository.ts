import { and, eq } from 'drizzle-orm'

import type { InsertMemberModel } from '@/domain/entities/members'

import { db } from '..'
import { members } from '../schemas/members'

export async function createMember(data: InsertMemberModel) {
  const member = await db.insert(members).values(data).returning()

  if (!member[0]) return null

  return member[0]
}

export async function getMemberByUserIdAndOrganizationId({
  userId,
  organizationId,
}: {
  userId: string
  organizationId: string
}) {
  const member = await db
    .select()
    .from(members)
    .where(
      and(
        eq(members.userId, userId),
        eq(members.organizationId, organizationId),
      ),
    )

  if (!member[0]) return null

  return member[0]
}
