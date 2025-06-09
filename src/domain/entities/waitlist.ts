import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

import type { waitlist } from '@/db/schemas'

export type Waitlist = InferSelectModel<typeof waitlist>
export type InsertWaitlistModel = InferInsertModel<typeof waitlist>
