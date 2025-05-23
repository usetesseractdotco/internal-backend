import { faker } from '@faker-js/faker'
import { createId } from '@paralleldrive/cuid2'

import { createRole } from '@/db/repositories/role-repository'
import type { InsertRoleModel, Role } from '@/domain/entities/roles'

/**
 * Creates a role in the database
 * @param role Optional partial role data to override defaults
 * @returns The created role
 */
export async function makeRole(
  role: Partial<InsertRoleModel> = {},
): Promise<Role | null> {
  const rawRole = makeRawRole(role)

  return await createRole(rawRole)
}

/**
 * Creates raw role data without persisting to the database
 * @param role Optional partial role data to override defaults
 * @returns Raw role data
 */
export function makeRawRole(role: Partial<InsertRoleModel> = {}): Role {
  const rawRole: Role = {
    id: role.id || createId(),
    name: role.name || faker.person.jobTitle(),
    description: role.description || faker.lorem.sentence(),
    createdAt: role.createdAt || new Date(),
  }

  return rawRole
}
