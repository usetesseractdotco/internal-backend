import {
  getSecurityPreferencesByUserId,
  storeTOTPSecret,
} from '@/db/repositories/security-preferences-repository'
import { getUserById } from '@/db/repositories/users-repository'
import { setup2FAErrors } from '@/shared/errors/auth/setup-2fa-errors'
import { commonUserErrors } from '@/shared/errors/users/common-user-errors'
import { error, success } from '@/utils/api-response'
import { getCachedUserById } from '@/utils/cache/users/get-cached-user'
import { setUserCache } from '@/utils/cache/users/set-user-cache'
import { tesseractUtils } from '@/utils/tesseract'
import { generateTOTPQRCode } from '@/utils/totp/generate-qrcode'

export async function setup2FA({ userId }: { userId: string }) {
  let user = await getCachedUserById({ id: userId })

  if (!user) {
    user = await getUserById({ id: userId })

    if (!user)
      return error({
        code: commonUserErrors.USER_NOT_FOUND.code,
        message: commonUserErrors.USER_NOT_FOUND.message,
      })

    await setUserCache({ user })
  }

  const securityPreferences = await getSecurityPreferencesByUserId({
    userId,
  })

  if (securityPreferences?.twoFactorEnabled) {
    return error({
      code: setup2FAErrors.twoFactorAlreadyEnabled.code,
      message: setup2FAErrors.twoFactorAlreadyEnabled.message,
    })
  }

  const secret = tesseractUtils.totp.generateSecret()
  await storeTOTPSecret({
    userId,
    secret,
  })

  const uri = tesseractUtils.totp.generateUri({
    secret,
    accountName: user.email,
    issuer: 'Tesseract',
  })

  const qrCode = await generateTOTPQRCode({
    secret,
    accountName: user.email,
  })

  return success({
    data: {
      uri,
      qrCode,
    },
    code: 200,
  })
}
