import { and, eq } from 'drizzle-orm'

import type { InsertSessionModel } from '@/domain/entities/sessions'

import { db } from '..'
import { sessions } from '../schemas'

export async function createSession(data: InsertSessionModel) {
  const session = await db.insert(sessions).values(data).returning()

  if (!session[0]) return null

  return session[0]
}

export async function findSessionByUserIdIpAddressAndUserAgent({
  userId,
  ipAddress,
  userAgent,
}: {
  userId: string
  ipAddress: string
  userAgent: string
}) {
  const session = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        eq(sessions.ipAddress, ipAddress),
        eq(sessions.userAgent, userAgent),
      ),
    )

  if (!session[0]) return null

  return session[0]
}

export async function deleteSessionByToken({
  token,
  userId,
}: {
  token: string
  userId: string
}) {
  return await db
    .delete(sessions)
    .where(and(eq(sessions.token, token), eq(sessions.userId, userId)))
}

export async function findSessionByIdIpAndUserAgent({
  id,
  userId,
  ipAddress,
  userAgent,
}: {
  id: string
  userId: string
  ipAddress: string
  userAgent: string
}) {
  const session = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, id),
        eq(sessions.userId, userId),
        eq(sessions.ipAddress, ipAddress),
        eq(sessions.userAgent, userAgent),
      ),
    )

  if (!session[0]) return null

  return session[0]
}

export async function updateSessionRefreshedAt(id: string, userId: string) {
  await db
    .update(sessions)
    .set({ refreshedAt: new Date() })
    .where(and(eq(sessions.id, id), eq(sessions.userId, userId)))
}
