import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { prisma } from './prisma'
import bcrypt from 'bcrypt'

const SECRET_KEY = process.env.NEXTAUTH_SECRET
if (!SECRET_KEY) {
  throw new Error('Missing NEXTAUTH_SECRET environment variable')
}
const SECRET = new TextEncoder().encode(SECRET_KEY)

interface TokenPayload {
  id: string
  email: string
  name: string
  role: string
}

export async function createToken(user: TokenPayload): Promise<string> {
  return new SignJWT({ id: user.id, email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return null

  const token = await createToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })

  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
