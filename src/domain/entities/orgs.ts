import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

import type { orgs } from '@/db/schemas'

export type Org = InferSelectModel<typeof orgs>
export type InsertOrgModel = InferInsertModel<typeof orgs>
