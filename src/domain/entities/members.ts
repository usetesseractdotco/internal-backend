import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

import type { members } from '@/db/schemas'

export type Member = InferSelectModel<typeof members>
export type InsertMemberModel = InferInsertModel<typeof members>
