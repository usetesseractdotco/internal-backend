import type { User } from '@/domain/entities/users'
import { redis } from '@/libs/redis'

export async function setUserCache({ user }: { user: User }) {
  await redis.set(`user:${user.email}`, JSON.stringify(user))
}
