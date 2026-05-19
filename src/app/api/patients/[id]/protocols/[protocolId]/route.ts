import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; protocolId: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { protocolId } = await params
  const body = await request.json()
  const { startDate, endDate } = body
  const data = { ...body }
  if (startDate) data.startDate = new Date(startDate)
  if (endDate) data.endDate = new Date(endDate)

  const protocol = await prisma.protocol.update({ where: { id: protocolId }, data })
  return NextResponse.json(protocol)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; protocolId: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { protocolId } = await params
  await prisma.protocol.delete({ where: { id: protocolId } })
  return NextResponse.json({ success: true })
}
