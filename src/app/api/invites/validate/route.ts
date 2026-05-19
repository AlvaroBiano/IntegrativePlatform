import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const body = await request.json()
  const { token } = body

  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  const invite = await prisma.invite.findUnique({
    where: { token, isActive: true },
  })

  if (!invite) return NextResponse.json({ error: 'Invalid invite' }, { status: 404 })
  if (invite.usedAt) return NextResponse.json({ error: 'Invite already used' }, { status: 400 })
  if (invite.expiresAt && invite.expiresAt < new Date()) return NextResponse.json({ error: 'Invite expired' }, { status: 400 })

  return NextResponse.json({ valid: true, email: invite.email })
}
