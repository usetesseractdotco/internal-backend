import * as jose from 'jose'

import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY, secretKey } from '.'

async function createAccessToken({
  userId,
  sessionId,
}: {
  userId: string
  sessionId: string
}) {
  const accessToken = await new jose.SignJWT({
    sub: userId,
    jti: sessionId,
  })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(secretKey)

  return { accessToken }
}

async function createRefreshToken({
  userId,
  sessionId,
}: {
  userId: string
  sessionId: string
}) {
  const refreshToken = await new jose.SignJWT({
    sub: userId,
    jti: sessionId,
  })
    .setIssuedAt()
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(secretKey)

  return { refreshToken }
}

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

export async function createSession({
  userId,
  sessionId,
}: {
  userId: string
  sessionId: string
}) {
  const { accessToken } = await createAccessToken({
    userId,
    sessionId,
  })

  const { refreshToken } = await createRefreshToken({
    userId,
    sessionId,
  })

  return {
    accessToken,
    refreshToken,
  }
}
