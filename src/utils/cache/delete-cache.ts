import { tesseractUtils } from '../tesseract'

export const deleteCache = async (key: string) => {
  await tesseractUtils.cache.delete(key)
}
