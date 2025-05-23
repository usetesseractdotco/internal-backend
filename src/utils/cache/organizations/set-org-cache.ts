import type { Org } from '@/domain/entities/orgs'

import { ONE_WEEK_IN_SECONDS } from '..'
import { setCache } from '../set-cache'

export async function setOrganizationCache({
  id,
  organization,
}: {
  id: string
  organization: Org
}) {
  await setCache(
    `organization:${id}`,
    JSON.stringify(organization),
    ONE_WEEK_IN_SECONDS,
  )
}
