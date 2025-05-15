import type { Session } from '@/domain/entities/sessions'

import { ONE_DAY_IN_SECONDS } from '..'
import { setCache } from '../set-cache'

export async function setSessionCache({ session }: { session: Session }) {
  await setCache(
    `session:${session.id}:${session.userId}:${session.ipAddress}:${session.userAgent}`,
    JSON.stringify(session),
    ONE_DAY_IN_SECONDS,
  )
}
