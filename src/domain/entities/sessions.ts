import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

import type { sessions } from '@/db/schemas'

export type Session = InferSelectModel<typeof sessions>
export type InsertSessionModel = InferInsertModel<typeof sessions>
