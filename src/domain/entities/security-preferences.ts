import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

import type { securityPreferences } from '@/db/schemas'

export type SecurityPreferences = InferSelectModel<typeof securityPreferences>
export type InsertSecurityPreferencesModel = InferInsertModel<
  typeof securityPreferences
>
