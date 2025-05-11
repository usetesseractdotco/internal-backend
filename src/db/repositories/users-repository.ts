import { eq } from 'drizzle-orm'

import type { InsertUserModel, User } from '@/domain/entities/users'

import { db } from '..'
import { users } from '../schemas'

export async function createUser(data: InsertUserModel) {
  const user = await db.insert(users).values(data).returning()

  if (!user[0]) return null

  return user[0]
}

export async function updateUser(
  data: Partial<InsertUserModel> & Pick<User, 'id'>,
) {
  const user = await db
    .update(users)
    .set(data)
    .where(eq(users.id, data.id))
    .returning()

  if (!user[0]) return null

  return user[0]
}

export async function getUserById(id: User['id']) {
  const user = await db.select().from(users).where(eq(users.id, id))

  if (!user[0]) return null

  return user[0]
}

export async function getUserByEmail({ email }: { email: User['email'] }) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))

  if (!user[0]) return null

  return user[0] || null
}

export async function deleteUser(id: User['id']) {
  return await db.delete(users).where(eq(users.id, id))
}
