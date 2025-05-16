import { tesseractUtils } from '../tesseract'

export async function hashPassword(password: string) {
  return await tesseractUtils.password.hash(password)
}
