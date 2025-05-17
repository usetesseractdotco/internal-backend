import type { Org } from '@/domain/entities/orgs'

import { getCache } from '../get-cache'

export async function getCachedOrganization({ id }: { id: string }) {
  const cachedOrganization = await getCache<Org>(`organization:${id}`)

  return cachedOrganization
}
