import { eq } from 'drizzle-orm'

import type { InsertWaitlistModel } from '@/domain/entities/waitlist'

import { db } from '..'
import { waitlist } from '../schemas'

export async function joinWaitlist(data: InsertWaitlistModel) {
  return await db.insert(waitlist).values(data).returning()
}

export async function getWaitlistEntryByEmail({ email }: { email: string }) {
  const entry = await db
    .select()
    .from(waitlist)
    .where(eq(waitlist.email, email))

  if (!entry[0]) return null

  return entry[0]
}
