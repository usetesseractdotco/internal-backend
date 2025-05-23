import { eq } from 'drizzle-orm'

import type { InsertRoleModel } from '@/domain/entities/roles'

import { db } from '..'
import { roles } from '../schemas/roles'

export async function createRole(data: InsertRoleModel) {
  const role = await db.insert(roles).values(data).returning()

  if (!role[0]) return null

  return role[0]
}

export async function getRoleById({ id }: { id: string }) {
  const role = await db.select().from(roles).where(eq(roles.id, id))

  if (!role[0]) return null

  return role[0]
}
