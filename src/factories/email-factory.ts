import { ResendAdapter } from '@/adapters/resend'

type EmailProvider = 'resend'

export function emailServiceFactory(provider: EmailProvider) {
  switch (provider) {
    case 'resend':
      return ResendAdapter

    default:
      throw new Error(`Unsupported queue provider: ${provider}`)
  }
}
