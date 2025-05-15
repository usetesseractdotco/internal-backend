import { count, eq } from 'drizzle-orm'

import type { InsertOrgModel } from '@/domain/entities/orgs'

import { db } from '..'
import { orgs } from '../schemas/orgs'

export async function createOrganization(data: InsertOrgModel) {
  const organization = await db.insert(orgs).values(data).returning()

  if (!organization[0]) return null

  return organization[0]
}

export async function getOrganizationsCountByUserId(userId: string) {
  const organizationsCount = await db
    .select({ count: count() })
    .from(orgs)
    .where(eq(orgs.ownerId, userId))

  if (!organizationsCount[0]) return 0

  return organizationsCount[0].count
}
