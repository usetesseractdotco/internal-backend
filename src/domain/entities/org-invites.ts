import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

import type { organizationInvites } from '@/db/schemas/org-invites'

export type OrgInvite = InferSelectModel<typeof organizationInvites>
export type InsertOrgInviteModel = InferInsertModel<typeof organizationInvites>
