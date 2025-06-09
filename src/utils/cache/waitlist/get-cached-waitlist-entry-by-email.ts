import type { Waitlist } from '@/domain/entities/waitlist'

import { getCache } from '../get-cache'

export async function getCachedWaitlistEntryByEmail({
  email,
}: {
  email: string
}) {
  return await getCache<Waitlist>(`waitlist:${email}`)
}
