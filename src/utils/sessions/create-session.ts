import * as jose from 'jose'

import { tesseractUtils } from '../tesseract'

export async function decodeJWT(token: string) {
  const decoded = jose.decodeJwt(token)

  if (
    !decoded ||
    typeof decoded.sub !== 'string' ||
    typeof decoded.jti !== 'string'
  ) {
    throw new Error('Invalid token')
  }

  return {
    decodedToken: decoded as jose.JWTPayload & { jti: string; sub: string },
  }
}

export const createSession = tesseractUtils.sessions.create

export const verifySession = tesseractUtils.sessions.verify

export const createRefreshToken = tesseractUtils.sessions.refresh
