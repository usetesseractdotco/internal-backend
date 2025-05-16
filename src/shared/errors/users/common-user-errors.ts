export const commonUserErrors = {
  USER_NOT_FOUND: {
    code: 404,
    message: 'USER_NOT_FOUND',
    details: 'User not found',
  },
  UNAUTHORIZED: {
    code: 401,
    message: 'UNAUTHORIZED',
    details: 'Unauthorized',
  },
  SESSION_NOT_FOUND: {
    code: 401,
    message: 'SESSION_NOT_FOUND',
    details: 'Session not found',
  },
  SESSION_EXPIRED: {
    code: 401,
    message: 'SESSION_EXPIRED',
    details: 'Session expired',
  },
  SESSION_REVOKED: {
    code: 401,
    message: 'SESSION_REVOKED',
    details: 'Session revoked',
  },
  EMAIL_DOES_NOT_MATCH: {
    code: 400,
    message: 'EMAIL_DOES_NOT_MATCH',
    details: 'Email does not match',
  },
} as const
