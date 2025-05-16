import { tesseractUtils } from '../tesseract'

export async function clearCache(): Promise<void> {
  await tesseractUtils.cache.clear()
}
