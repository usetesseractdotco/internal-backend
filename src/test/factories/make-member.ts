import { createId } from '@paralleldrive/cuid2'

import { createMember } from '@/db/repositories/members-repository'
import type { InsertMemberModel, Member } from '@/domain/entities/members'

/**
 * Creates a member in the database
 * @param member Optional partial member data to override defaults
 * @returns The created member
 */
export async function makeMember(
  member: Partial<InsertMemberModel> = {},
): Promise<Member | null> {
  const rawMember = makeRawMember(member)

  return await createMember(rawMember)
}

/**
 * Creates raw member data without persisting to the database
 * @param member Optional partial member data to override defaults
 * @returns Raw member data
 */
export function makeRawMember(
  member: Partial<InsertMemberModel> = {},
): InsertMemberModel {
  const rawMember: InsertMemberModel = {
    id: member.id || createId(),
    organizationId: member.organizationId || createId(),
    userId: member.userId || createId(),
    role: member.role || 'member',
    createdAt: member.createdAt || new Date(),
    updatedAt: member.updatedAt || new Date(),
  }

  return rawMember
}
