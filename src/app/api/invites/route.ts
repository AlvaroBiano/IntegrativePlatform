import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const invites = await prisma.invite.findMany({
    orderBy: { createdAt: 'desc' },
    include: { usedBy: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(invites)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { email, expiresInDays } = body

  const token = crypto.randomUUID()
  const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null

  const invite = await prisma.invite.create({
    data: {
      token,
      email: email || null,
      createdBy: session.id,
      expiresAt,
    },
  })

  return NextResponse.json(invite, { status: 201 })
}
