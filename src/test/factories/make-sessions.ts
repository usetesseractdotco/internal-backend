import { faker } from '@faker-js/faker'
import { createId } from '@paralleldrive/cuid2'

import { createSession } from '@/db/repositories/sessions-repository'
import type { InsertSessionModel } from '@/domain/entities/sessions'
import type { RemoveNull } from '@/types/remove-null'

export async function makeSession(
  session: RemoveNull<Partial<InsertSessionModel>> = {},
) {
  const rawSession = makeRawSession(session)

  return await createSession(rawSession)
}

export function makeRawSession(
  session: RemoveNull<Partial<InsertSessionModel>> = {},
) {
  const rawSession: InsertSessionModel = {
    id: createId(),
    userId: faker.string.uuid(),
    token: faker.string.uuid(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    status: 'active',
    refreshedAt: new Date(),

    ...session,
  }

  return rawSession
}
