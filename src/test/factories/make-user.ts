import { faker } from '@faker-js/faker'
import { createId } from '@paralleldrive/cuid2'

import { createUser } from '@/db/repositories/users-repository'
import type { InsertUserModel } from '@/domain/entities/users'
import type { RemoveNull } from '@/types/remove-null'
import { hashPassword } from '@/utils/password/index.'

export async function makeUser(
  user: RemoveNull<Partial<InsertUserModel>> = {},
) {
  const rawUser = makeRawUser(user)

  return await createUser({
    ...rawUser,
    password: await hashPassword(rawUser.password),
  })
}

export function makeRawUser(user: RemoveNull<Partial<InsertUserModel>> = {}) {
  const rawUser: InsertUserModel = {
    id: createId(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email().toLowerCase(),
    avatarUrl: null,
    isEmailVerified: faker.datatype.boolean(),
    createdAt: new Date(),
    updatedAt: new Date(),
    password: 'password',

    ...user,
  }

  return rawUser
}
