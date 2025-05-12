export const createUserErrors = {
  USER_ALREADY_EXISTS: {
    code: 400,
    message: 'USER_ALREADY_EXISTS',
    details: 'User already exists',
  },
  USER_NOT_CREATED: {
    code: 500,
    message: 'USER_NOT_CREATED',
    details: 'User not created',
  },
} as const
