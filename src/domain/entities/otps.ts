import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

import type { otps } from '@/db/schemas'

export type OTP = InferSelectModel<typeof otps>
export type InsertOTPModel = InferInsertModel<typeof otps>
