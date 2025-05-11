import { eq } from 'drizzle-orm'

import { otps } from '@/db/schemas'
import type { InsertOTPModel } from '@/domain/entities/otps'

import { db } from '..'
import { getUserByEmail } from './users-repository'

export async function insertOTP(data: InsertOTPModel) {
  const otp = await db.insert(otps).values(data).returning()

  return otp[0]
}

export async function findOTPByUserEmail({ email }: { email: string }) {
  const user = await getUserByEmail({ email: email.toLowerCase() })

  if (!user) return null

  const otp = await db.select().from(otps).where(eq(otps.userId, user.id))

  if (otp.length < 0) return null

  return otp[0]
}

export async function findOTPbyUserById({ userId }: { userId: string }) {
  const otp = await db.select().from(otps).where(eq(otps.userId, userId))

  if (otp.length < 0) return null

  return otp[0]
}

export function deleteOTP({ code }: { code: string }) {
  return db.delete(otps).where(eq(otps.code, code))
}
