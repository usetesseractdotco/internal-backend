import { Resend } from 'resend'

import type { EmailMessage } from '@/domain/entities/email-message'
import { env } from '@/env'
import type { EmailService } from '@/ports/email-service'

const resend = new Resend(env.services.RESEND_API_KEY)

async function sendEmail(
  emailMessage: EmailMessage,
  { idempotencyKey, type }: { idempotencyKey?: string; type: string },
) {
  await resend.emails.send(
    {
      from: `Tesseract <hello@${type}.usetesseract.co>`,
      to: emailMessage.to,
      subject: emailMessage.subject,
      html: emailMessage.html,
      replyTo: 'hello@usetesseract.co',
    },
    {
      idempotencyKey,
    },
  )
}

const ResendAdapter: EmailService = {
  sendEmail: (
    emailMessage,
    { idempotencyKey, type }: { idempotencyKey?: string; type: string },
  ) =>
    sendEmail(emailMessage, {
      idempotencyKey,
      type,
    }),
}

export { ResendAdapter }
