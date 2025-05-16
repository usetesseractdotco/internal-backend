import { tesseractUtils } from '../tesseract'

export async function comparePassword(
  password: string,
  hashedPassword: string,
) {
  return await tesseractUtils.password.compare(password, hashedPassword)
}
