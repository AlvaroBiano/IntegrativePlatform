import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; msgId: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { msgId } = await params
  const body = await request.json()

  const message = await prisma.message.update({
    where: { id: msgId },
    data: body,
  })

  return NextResponse.json(message)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; msgId: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { msgId } = await params
  await prisma.message.delete({ where: { id: msgId } })
  return NextResponse.json({ success: true })
}
