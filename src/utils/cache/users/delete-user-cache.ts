import type { User } from '@/domain/entities/users'
import { redis } from '@/libs/redis'

import { deleteCache } from '../delete-cache'

export async function deleteUserCache({
  id,
  email,
}: {
  id: User['id']
  email: User['email']
}) {
  await deleteCache(`user:${id}`)
  await deleteCache(`user:${email}`)
}
