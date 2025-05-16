import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { securityPreferences as securityPreferencesSchema } from '@/db/schemas/security-preferences'

export async function storeTOTPSecret({
  userId,
  secret,
}: {
  userId: string
  secret: string
}) {
  const securityPreferences = await db
    .insert(securityPreferencesSchema)
    .values({
      userId,
      twoFactorSecret: secret,
      twoFactorEnabled: true,
    })
    .onConflictDoUpdate({
      target: [securityPreferencesSchema.userId],
      set: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
      },
    })
    .returning()

  if (!securityPreferences[0]) return null

  return securityPreferences[0]
}

export async function getSecurityPreferencesByUserId({
  userId,
}: {
  userId: string
}) {
  const securityPreferences = await db
    .select()
    .from(securityPreferencesSchema)
    .where(eq(securityPreferencesSchema.userId, userId))

  if (!securityPreferences[0]) return null

  return securityPreferences[0]
}
