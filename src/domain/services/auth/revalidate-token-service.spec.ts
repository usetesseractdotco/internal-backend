import { addDays, subDays } from 'date-fns'

import { findSessionByIdIpAndUserAgent } from '@/db/repositories/sessions-repository'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
import { makeSession } from '@/test/factories/make-sessions'
import { makeUser } from '@/test/factories/make-user'
import { clearCache } from '@/utils/cache'

import { revalidateToken } from './revalidate-token-service'

describe('RevalidateTokenService', () => {
  const testIp = '127.0.0.1'
  const testUserAgent = 'test-agent'

  beforeEach(async () => {
    await clearCache()
  })

  afterEach(async () => {
    await clearCache()
  })

  describe('when session exists', () => {
    it('should return a new refresh token for valid session', async () => {
      const user = await makeUser()
      if (!user) throw new Error('User not created')

      const session = await makeSession({
        userId: user.id,
        ipAddress: testIp,
        userAgent: testUserAgent,
        expiresAt: addDays(new Date(), 7),
      })

      if (!session) throw new Error('Session not created')

      const result = await revalidateToken({
        userId: user.id,
        jti: session.id,
        ipAddress: testIp,
        userAgent: testUserAgent,
      })

      expect(result.status).toBe('ok')
      expect(result.code).toBe(200)
      if (result.status === 'ok') {
        expect(typeof result.data).toBe('string')
        expect(result.data.length).toBeGreaterThan(0)
      }

      const updatedSession = await findSessionByIdIpAndUserAgent({
        id: session.id,
        userId: user.id,
        ipAddress: testIp,
        userAgent: testUserAgent,
      })
      expect(updatedSession?.refreshedAt).not.toBe(session.refreshedAt)
    })
  })

  describe('error cases', () => {
    it('should return error when session is not found', async () => {
      const user = await makeUser()
      if (!user) throw new Error('User not created')

      const result = await revalidateToken({
        userId: user.id,
        jti: 'non-existent-session',
        ipAddress: testIp,
        userAgent: testUserAgent,
      })

      expect(result.status).toBe('error')
      expect(result.code).toBe(commonUserErrors.SESSION_NOT_FOUND.code)
      if (result.status === 'error') {
        expect(result.message).toBe(commonUserErrors.SESSION_NOT_FOUND.message)
      }
    })

    it('should return error when session is expired', async () => {
      const user = await makeUser()
      if (!user) throw new Error('User not created')

      const session = await makeSession({
        userId: user.id,
        ipAddress: testIp,
        userAgent: testUserAgent,
        expiresAt: subDays(new Date(), 1),
      })

      if (!session) throw new Error('Session not created')

      const result = await revalidateToken({
        userId: user.id,
        jti: session.id,
        ipAddress: testIp,
        userAgent: testUserAgent,
      })

      expect(result.status).toBe('error')
      expect(result.code).toBe(commonUserErrors.SESSION_EXPIRED.code)
      if (result.status === 'error') {
        expect(result.message).toBe(commonUserErrors.SESSION_EXPIRED.message)
      }
    })

    it('should return error when session is revoked', async () => {
      const user = await makeUser()
      if (!user) throw new Error('User not created')

      const session = await makeSession({
        userId: user.id,
        ipAddress: testIp,
        userAgent: testUserAgent,
        status: 'revoked',
      })

      if (!session) throw new Error('Session not created')

      const result = await revalidateToken({
        userId: user.id,
        jti: session.id,
        ipAddress: testIp,
        userAgent: testUserAgent,
      })

      expect(result.status).toBe('error')
      expect(result.code).toBe(commonUserErrors.SESSION_REVOKED.code)
      if (result.status === 'error') {
        expect(result.message).toBe(commonUserErrors.SESSION_REVOKED.message)
      }
    })
  })
})
