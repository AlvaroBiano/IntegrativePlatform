import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, password, inviteToken } = body

  if (!name || !email || !password || !inviteToken) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const invite = await prisma.invite.findUnique({
    where: { token: inviteToken, isActive: true },
  })

  if (!invite) return NextResponse.json({ error: 'Invalid invite' }, { status: 404 })
  if (invite.usedAt) return NextResponse.json({ error: 'Invite already used' }, { status: 400 })
  if (invite.expiresAt && invite.expiresAt < new Date()) return NextResponse.json({ error: 'Invite expired' }, { status: 400 })
  if (invite.email && invite.email !== email) return NextResponse.json({ error: 'Email does not match invite' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'PATIENT',
    },
  })

  await prisma.invite.update({
    where: { id: invite.id },
    data: {
      usedAt: new Date(),
      usedById: user.id,
    },
  })

  return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } }, { status: 201 })
}
