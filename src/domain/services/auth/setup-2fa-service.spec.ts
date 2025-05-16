import {
  getSecurityPreferencesByUserId,
  storeTOTPSecret,
} from '@/db/repositories/security-preferences-repository'
import { setup2FAErrors } from '@/shared/errors/auth/setup-2fa-errors'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
import { makeUser } from '@/test/factories/make-user'

import { setup2FA } from './setup-2fa-service'

describe('Setup 2FA Service', () => {
  it('should successfully setup 2FA for a user', async () => {
    const user = await makeUser()
    if (!user) throw new Error('Failed to create test user')

    const result = await setup2FA({
      userId: user.id,
    })

    expect(result.status).toBe('ok')
    if (result.status !== 'ok') throw new Error('Failed to setup 2FA')

    expect(result.data).toHaveProperty('uri')
    expect(result.data).toHaveProperty('qrCode')
    expect(result.code).toBe(200)

    const securityPreferences = await getSecurityPreferencesByUserId({
      userId: user.id,
    })

    expect(securityPreferences).not.toBeNull()
    expect(securityPreferences?.twoFactorEnabled).toBe(true)
    expect(securityPreferences?.twoFactorSecret).not.toBe('')
  })

  it('should return error if user is not found', async () => {
    const result = await setup2FA({
      userId: 'non-existent-id',
    })

    expect(result.status).toBe('error')
    expect(result.code).toBe(commonUserErrors.USER_NOT_FOUND.code)
    if (result.status !== 'error') throw new Error('Failed to setup 2FA')
    expect(result.message).toBe(commonUserErrors.USER_NOT_FOUND.message)
  })

  it('should return error if 2FA is already enabled', async () => {
    const user = await makeUser()
    if (!user) throw new Error('Failed to create test user')

    await storeTOTPSecret({
      userId: user.id,
      secret: 'existing-secret',
    })

    const result = await setup2FA({
      userId: user.id,
    })

    expect(result.status).toBe('error')
    expect(result.code).toBe(setup2FAErrors.twoFactorAlreadyEnabled.code)
    if (result.status !== 'error') throw new Error('Failed to setup 2FA')
    expect(result.message).toBe(setup2FAErrors.twoFactorAlreadyEnabled.message)
  })
})
