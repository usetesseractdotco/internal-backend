import type { User } from '@/domain/entities/users'

import { ONE_DAY_IN_SECONDS } from '..'
import { setCache } from '../set-cache'

export async function setUserCache({ user }: { user: User }) {
  await setCache(`user:${user.id}`, JSON.stringify(user), ONE_DAY_IN_SECONDS)
  await setCache(`user:${user.email}`, JSON.stringify(user), ONE_DAY_IN_SECONDS)
}
