import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (session.role !== 'ADMIN' && session.id !== id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const protocols = await prisma.protocol.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(protocols)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { title, description, content, startDate, endDate, isActive } = body

  const protocol = await prisma.protocol.create({
    data: { userId: id, title, description, content, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, isActive },
  })

  return NextResponse.json(protocol, { status: 201 })
}
