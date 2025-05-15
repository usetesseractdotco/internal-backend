import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    /**
     * Validates the JWT access and refresh tokens in the request and ensures they belong to the same user.
     * Requires authorization header with Bearer token and refresh token cookie.
     * Also validates user agent and IP address for security.
     * @throws {Error} 401 Unauthorized if tokens are invalid, missing, or validation fails
     * @returns {Promise<{ sub: string }>} Promise resolving to an object containing the user ID as 'sub'
     */
    getCurrentUserId(): Promise<{ sub: string }>
  }
}
