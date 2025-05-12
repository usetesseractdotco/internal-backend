import type { User } from '@/domain/entities/users'
import { redis } from '@/libs/redis'

export async function deleteUserCache({
  id,
  email,
}: {
  id: User['id']
  email: User['email']
}) {
  await redis.del(`user:${email}`)
  await redis.del(`user:${id}`)
}
