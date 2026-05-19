import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.role === 'ADMIN') {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      include: { recipient: { select: { name: true } } },
    })
    return NextResponse.json(messages)
  }

  const messages = await prisma.message.findMany({
    where: { recipientId: session.id },
    orderBy: { createdAt: 'desc' },
    include: { sender: { select: { name: true } } },
  })
  return NextResponse.json(messages)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { recipientId, subject, content, isBroadcast } = body

  if (isBroadcast) {
    const patients = await prisma.user.findMany({ where: { role: 'PATIENT' }, select: { id: true } })
    await prisma.message.createMany({
      data: patients.map((p) => ({ senderId: session.id, recipientId: p.id, subject, content, isBroadcast: true })),
    })
    return NextResponse.json({ success: true, count: patients.length })
  }

  const message = await prisma.message.create({
    data: { senderId: session.id, recipientId, subject, content },
  })

  return NextResponse.json(message, { status: 201 })
}
