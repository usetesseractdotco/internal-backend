import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticateWithEmailAndPassword } from '@/domain/services/auth/authenticate-with-email-and-password-service'
import { authWithEmailErrors } from '@/shared/errors/auth/auth-with-email-errors'
import { passwordSchema } from '@/utils/password/index.'
import {
  ACCESS_TOKEN_EXPIRY_MS,
  REFRESH_TOKEN_EXPIRY_MS,
} from '@/utils/sessions'

/**
 * Authenticates a user using email and password credentials.
 *
 * @route POST /auth/login
 * @tags Authentication
 *
 * @body {object} request
 * @body {string} request.email - User's email address (must be valid email format)
 * @body {string} request.password - User's password
 *
 * @header {string} user-agent - Required. Client's user agent string
 * @header {string} [x-forwarded-for] - Optional. Client's forwarded IP address
 *
 * @returns {null} 204 - Authentication successful. No content returned.
 * @returns {object} 400 - Authentication failed
 *   @returns {string} error - Error type:
 *     - INVALID_CREDENTIALS: Invalid email/password combination
 *     - USER_ALREADY_HAS_SESSION_ACTIVE: User already has an active session
 *   @returns {string} details - Detailed error message
 *
 * @security
 * - Requires valid email format
 * - Requires user-agent header
 * - Tracks client IP address for security
 * - Rate limiting may apply (configured separately)
 *
 * @example
 * // Request
 * POST /auth/login
 * {
 *   "email": "user@example.com",
 *   "password": "userPassword123"
 * }
 *
 * // Success Response
 * 204 No Content
 *
 * // Error Response
 * 400 Bad Request
 * {
 *   "error": "INVALID_CREDENTIALS",
 *   "details": "Invalid credentials"
 * }
 *
 * @param app - The Fastify instance to register the route on
 */
// Registers the POST /login route for user authentication (the /auth prefix is already applied in the parent router)
export async function authenticateWithEmailAndPasswordRoute(
  app: FastifyInstance,
) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/login',
    {
      schema: {
        tags: ['auth'],
        summary: 'Login with email and password',
        body: z.object({
          email: z.string().email(),
          password: passwordSchema,
        }),
        response: {
          204: z.null(),
          400: z.object({
            error: z.enum([
              authWithEmailErrors.INVALID_CREDENTIALS.message,
              authWithEmailErrors.USER_ALREADY_HAS_SESSION_ACTIVE.message,
            ]),
            details: z.enum([
              authWithEmailErrors.INVALID_CREDENTIALS.details,
              authWithEmailErrors.USER_ALREADY_HAS_SESSION_ACTIVE.details,
            ]),
          }),
        },
      },
    },
    async (req, res) => {
      const { email, password } = req.body

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
        return res.status(400).send({
          error: authWithEmailErrors.INVALID_CREDENTIALS.message,
          details: authWithEmailErrors.INVALID_CREDENTIALS.details,
        })

      const result = await authenticateWithEmailAndPassword({
        email,
        password,
        ipAddress,
        userAgent,
      })

      if (result.status === 'error') {
        return res.status(result.code).send({
          error: result.message,
          details: authWithEmailErrors.INVALID_CREDENTIALS.details,
        })
      }

      res.cookie('accessToken', result.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: ACCESS_TOKEN_EXPIRY_MS,
        path: '/',
      })

      res.cookie('refreshToken', result.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: REFRESH_TOKEN_EXPIRY_MS,
        path: '/',
      })

      return res.status(204).send()
    },
  )
}
