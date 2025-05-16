import { env } from '@/env'

export const ACCESS_TOKEN_EXPIRY = '7d' // 7 days in jwt format
export const ACCESS_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days in millisecond
export const REFRESH_TOKEN_EXPIRY = '2h' // 2 hours in jwt format
export const REFRESH_TOKEN_EXPIRY_MS = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

export const secretKey = new TextEncoder().encode(env.app.JWT_SECRET)

export {
  createRefreshToken,
  createSession as createSessionUtil,
  decodeJWT,
  verifySession,
} from './create-session'
