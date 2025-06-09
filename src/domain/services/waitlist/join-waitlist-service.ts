import {
  getWaitlistEntryByEmail,
  joinWaitlist,
} from '@/db/repositories/waitlist-repository'
import { executeTransaction } from '@/db/transactions'
import { waitlistErrors } from '@/shared/errors/waitlist/waitlist-errors'
import { error, success } from '@/utils/api-response'
import { getCachedWaitlistEntryByEmail } from '@/utils/cache/waitlist/get-cached-waitlist-entry-by-email'
import { setWaitlistEntryCache } from '@/utils/cache/waitlist/set-waitlist-entry-cache'

/**
 * Adds an email to the waitlist if it doesn't already exist.
 *
 * - Checks if the email exists in cache or database.
 * - If email already exists in waitlist, returns a 400 error with USER_ALREADY_IN_WAITLIST.
 * - If not, adds the email to the waitlist, updates the cache, and returns success (204).
 * - If an error occurs during waitlist addition or cache update, returns a 500 error with INTERNAL_SERVER_ERROR.
 *
 * @param params - The waitlist entry data
 * @param params.email - The email address to add to the waitlist
 * @returns An object with status 'success' and code 204 if added, or 'error' with code and message if failed
 */
export async function joinWaitlistService({ email }: { email: string }) {
  let waitlist = await getCachedWaitlistEntryByEmail({ email })

  if (!waitlist) waitlist = await getWaitlistEntryByEmail({ email })

  if (waitlist) {
    return error({
      code: waitlistErrors.USER_ALREADY_IN_WAITLIST.code,
      message: waitlistErrors.USER_ALREADY_IN_WAITLIST.message,
    })
  }

  try {
    await executeTransaction(async (tx) => {
      const [waitlistEntry] = await joinWaitlist({ email }, tx)

      if (!waitlistEntry) throw new Error('Waitlist entry not found')

      await setWaitlistEntryCache({ email, waitlistEntry })
    })

    return success({
      code: 204,
      data: null,
    })
  } catch {
    return error({
      code: waitlistErrors.INTERNAL_SERVER_ERROR.code,
      message: waitlistErrors.INTERNAL_SERVER_ERROR.message,
    })
  }
}
