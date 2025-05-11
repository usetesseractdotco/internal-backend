import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

import type { users } from '@/db/schemas'

export type User = InferSelectModel<typeof users>
export type InsertUserModel = InferInsertModel<typeof users>
