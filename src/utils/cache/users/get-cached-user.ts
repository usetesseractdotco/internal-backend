import type { User } from '@/domain/entities/users'

import { getCache } from '../get-cache'

export async function getCachedUserByEmail({ email }: { email: string }) {
  const cachedUser = await getCache<User>(`user:${email}`)

  return cachedUser
}
