import { ONE_MONTH_IN_SECONDS } from '..'
import { setCache } from '../set-cache'

export async function setWaitlistEntryCache({ email }: { email: string }) {
  await setCache(
    `waitlist:${email}`,
    JSON.stringify(email),
    ONE_MONTH_IN_SECONDS,
  )
}
