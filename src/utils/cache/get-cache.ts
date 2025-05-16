import { tesseractUtils } from '../tesseract'

export const getCache = async <T>(key: string): Promise<T | null> => {
  return await tesseractUtils.cache.get<T>(key)
}
