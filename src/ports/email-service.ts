import type { EmailMessage } from '@/domain/entities/email-message'

export interface EmailService {
  sendEmail(
    emailMessage: EmailMessage,
    { idempotencyKey, type }: { idempotencyKey?: string; type: string },
  ): Promise<void>
}
