import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; appointmentId: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { appointmentId } = await params
  const body = await request.json()
  const { scheduledAt } = body
  const data = { ...body }
  if (scheduledAt) data.scheduledAt = new Date(scheduledAt)

  const appointment = await prisma.appointmentLink.update({ where: { id: appointmentId }, data })
  return NextResponse.json(appointment)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; appointmentId: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { appointmentId } = await params
  await prisma.appointmentLink.delete({ where: { id: appointmentId } })
  return NextResponse.json({ success: true })
}
