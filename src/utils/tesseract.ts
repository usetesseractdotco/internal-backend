import { defineTesseractUtils } from '@usetesseract/utils'

import { env } from '@/env'
import { redis } from '@/libs/redis'

export const tesseractUtils = defineTesseractUtils({
  cache: { redisClient: redis },
  password: { saltRounds: 10 },
  sessions: {
    secretKey: env.app.JWT_SECRET,
    accessTokenExpiresIn: '7d',
    refreshTokenExpiresIn: '15m',
    maxAccessTokenAge: 1000 * 60 * 60 * 24 * 7, // 7 days in milliseconds
    maxRefreshTokenAge: 1000 * 60 * 15, // 15 minutes in milliseconds
  },
  totp: {
    digits: 6,
    period: 30,
    algorithm: 'sha256',
  },
})
