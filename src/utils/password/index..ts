import { z } from 'zod'

export { comparePassword } from './compare-password'
export { hashPassword } from './hash-password'

const oneUpperCaseLetterRegex = /[A-Z]/
const oneLowerCaseLetterRegex = /[a-z]/
const oneNumberRegex = /\d/
const oneSpecialCharacterRegex = /[!@#$%^&*]/

export const passwordSchema = z
  .string()
  .min(8, {
    message: 'The password is required and must be at least 8 characters long.',
  })
  .regex(oneUpperCaseLetterRegex, 'At least one uppercase letter is required')
  .regex(oneLowerCaseLetterRegex, 'At least one lowercase letter is required')
  .regex(oneNumberRegex, 'At least one number is required')
  .regex(oneSpecialCharacterRegex, 'At least one special character is required')
