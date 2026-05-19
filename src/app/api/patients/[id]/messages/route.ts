import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (session.role !== 'ADMIN' && session.id !== id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const messages = await prisma.message.findMany({
    where: { recipientId: id },
    orderBy: { createdAt: 'desc' },
    include: { sender: { select: { name: true } } },
  })
  return NextResponse.json(messages)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { subject, content } = body

  const message = await prisma.message.create({
    data: { senderId: session.id, recipientId: id, subject, content },
  })

  return NextResponse.json(message, { status: 201 })
}
