import { faker } from '@faker-js/faker'
import { createId } from '@paralleldrive/cuid2'

import { createOrganizationInvite } from '@/db/repositories/org-invites-repository'
import type {
  InsertOrgInviteModel,
  OrgInvite,
} from '@/domain/entities/org-invites'

/**
 * Creates an organization invite in the database
 * @param invite Optional partial invite data to override defaults
 * @returns The created invite
 */
export async function makeInvite(
  invite: Partial<InsertOrgInviteModel> = {},
): Promise<OrgInvite | null> {
  const rawInvite = makeRawInvite(invite)

  return await createOrganizationInvite(rawInvite)
}

/**
 * Creates raw invite data without persisting to the database
 * @param invite Optional partial invite data to override defaults
 * @returns Raw invite data
 */
export function makeRawInvite(
  invite: Partial<InsertOrgInviteModel> = {},
): InsertOrgInviteModel {
  const rawInvite: InsertOrgInviteModel = {
    id: invite.id || createId(),
    organizationId: invite.organizationId || createId(),
    email: invite.email || faker.internet.email().toLowerCase(),
    role: invite.role || 'member',
    createdAt: invite.createdAt || new Date(),
    expiresAt: invite.expiresAt || null,
  }

  return rawInvite
}
