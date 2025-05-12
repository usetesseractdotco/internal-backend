import bcrypt from 'bcryptjs'

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10)
}
