import { tesseractUtils } from '../tesseract'

export async function generateTOTPQRCode({
  secret,
  accountName,
}: {
  secret: string
  accountName: string
}) {
  return await tesseractUtils.totp.generateQRCode({
    accountName,
    secret,
    qrOptions: {
      errorCorrectionLevel: 'H',
      margin: 1,
      size: 200,
    },
  })
}
