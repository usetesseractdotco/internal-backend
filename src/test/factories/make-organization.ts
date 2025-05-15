import { faker } from '@faker-js/faker'
import { createId } from '@paralleldrive/cuid2'

import { createOrganization } from '@/db/repositories/organizations-repository'
import type { InsertOrgModel, Org } from '@/domain/entities/orgs'

/**
 * Creates an organization in the database
 * @param org Optional partial organization data to override defaults
 * @returns The created organization
 */
export async function makeOrganization(
  org: Partial<InsertOrgModel> = {},
): Promise<Org | null> {
  const rawOrg = makeRawOrganization(org)

  return await createOrganization(rawOrg)
}

/**
 * Creates raw organization data without persisting to the database
 * @param org Optional partial organization data to override defaults
 * @returns Raw organization data
 */
export function makeRawOrganization(org: Partial<InsertOrgModel> = {}): Org {
  const rawOrg: Org = {
    id: org.id || createId(),
    name: org.name || faker.company.name(),
    ownerId: org.ownerId || createId(),
    logoUrl:
      org.logoUrl !== undefined
        ? org.logoUrl
        : faker.datatype.boolean()
          ? faker.image.url()
          : null,
    createdAt: org.createdAt || new Date(),
    updatedAt: org.updatedAt || new Date(),
  }

  return rawOrg
}
