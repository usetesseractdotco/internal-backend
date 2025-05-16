import { tesseractUtils } from '../tesseract'

export const setCache = async (key: string, value: string, ttl: number) => {
  await tesseractUtils.cache.set(key, value, ttl)
}
