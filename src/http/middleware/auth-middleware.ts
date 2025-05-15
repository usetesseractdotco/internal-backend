import type { FastifyInstance, FastifyRequest } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import * as jose from 'jose'

import { revalidateToken } from '@/domain/services/auth/revalidate-token-service'
import {
  ACCESS_TOKEN_EXPIRY_MS,
  REFRESH_TOKEN_EXPIRY_MS,
  secretKey,
} from '@/utils/sessions'

type Payload = {
  sub: string
  jti: string
}

export const authMiddleware = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (req: FastifyRequest, res) => {
    req.getCurrentUserId = async () => {
      const userAgent = req.headers['user-agent']
      const forwardedFor = req.headers['x-forwarded-for']
      const remoteAddress = req.socket?.remoteAddress
      const forwardedForArray =
        typeof forwardedFor === 'string' ? forwardedFor.split(',') : []
      const ipAddress =
        forwardedForArray.length > 0
          ? forwardedForArray[0]?.trim()
          : remoteAddress || ''

      if (!userAgent || !ipAddress)
        return res.status(401).send({ message: 'Unauthorized' })

      if (!req.headers.authorization)
        return res.status(401).send({ message: 'Unauthorized' })

      const refreshToken = req.cookies.refreshToken

      if (!refreshToken)
        return res.status(401).send({ message: 'Unauthorized' })

      const accessToken = req.headers.authorization
        .replace('Bearer ', '')
        .trim()
        .replace(/^,\s*/, '')

      if (!accessToken) return res.status(401).send({ message: 'Unauthorized' })

      try {
        const { payload: accessTokenPayload }: { payload: Payload } =
          await jose.jwtVerify(accessToken, secretKey, {
            algorithms: ['HS256'],
            typ: 'JWT',
            maxTokenAge: ACCESS_TOKEN_EXPIRY_MS / 1000, // in seconds
          })

        const { payload: refreshTokenPayload }: { payload: Payload } =
          await jose.jwtVerify(refreshToken, secretKey, {
            algorithms: ['HS256'],
            typ: 'JWT',
            maxTokenAge: REFRESH_TOKEN_EXPIRY_MS / 1000, // in seconds
          })

        if (
          !refreshTokenPayload.sub ||
          !refreshTokenPayload.jti ||
          !accessTokenPayload.sub ||
          !accessTokenPayload.jti
        )
          return res.status(401).send({ message: 'Unauthorized' })

        const result = await revalidateToken({
          jti: accessTokenPayload.jti,
          userId: refreshTokenPayload.sub,
          ipAddress,
          userAgent,
        })

        if (result.status === 'error')
          return res.status(result.code).send({ message: result.message })

        res.setCookie('refreshToken', result.data, {
          httpOnly: true,
          secure: true,
          path: '/',
          maxAge: REFRESH_TOKEN_EXPIRY_MS / 1000,
          sameSite: 'strict',
        })

        return { sub: accessTokenPayload.sub }
      } catch (error) {
        return res.status(401).send({ message: 'Unauthorized' })
      }
    }
  })
})
