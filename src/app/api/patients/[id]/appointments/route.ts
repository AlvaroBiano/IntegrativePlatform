import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (session.role !== 'ADMIN' && session.id !== id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const appointments = await prisma.appointmentLink.findMany({
    where: { userId: id },
    orderBy: { scheduledAt: 'desc' },
  })
  return NextResponse.json(appointments)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { title, url, description, scheduledAt, isActive } = body

  const appointment = await prisma.appointmentLink.create({
    data: { userId: id, title, url, description, scheduledAt: scheduledAt ? new Date(scheduledAt) : null, isActive },
  })

  return NextResponse.json(appointment, { status: 201 })
}
