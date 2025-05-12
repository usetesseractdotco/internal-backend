export const authWithEmailErrors = {
  INVALID_EMAIL_OR_OTP: {
    code: 400,
    message: 'INVALID_EMAIL_OR_OTP',
    details: 'Invalid email or OTP',
  },
  INVALID_CREDENTIALS: {
    code: 401,
    message: 'INVALID_CREDENTIALS',
    details: 'Invalid credentials',
  },
  USER_ALREADY_HAS_SESSION_ACTIVE: {
    code: 409,
    message: 'USER_ALREADY_HAS_SESSION_ACTIVE',
    details: 'User already has a session active with this device',
  },
} as const
