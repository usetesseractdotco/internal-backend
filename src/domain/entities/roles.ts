import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

import type { roles } from '@/db/schemas/roles'

export type Role = InferSelectModel<typeof roles>
export type InsertRoleModel = InferInsertModel<typeof roles>
