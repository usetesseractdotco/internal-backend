import type { Waitlist as WaitlistEntry } from '@/domain/entities/waitlist'

import { ONE_MONTH_IN_SECONDS } from '..'
import { setCache } from '../set-cache'

export async function setWaitlistEntryCache({
  email,
  waitlistEntry,
}: {
  email: string
  waitlistEntry: WaitlistEntry
}) {
  await setCache(
    `waitlist:${email}`,
    JSON.stringify(waitlistEntry),
    ONE_MONTH_IN_SECONDS,
  )
}
