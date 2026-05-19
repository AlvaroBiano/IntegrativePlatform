import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; planId: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planId } = await params
  const body = await request.json()
  const { startDate, endDate } = body
  const data = { ...body }
  if (startDate) data.startDate = new Date(startDate)
  if (endDate) data.endDate = new Date(endDate)

  const plan = await prisma.plan.update({
    where: { id: planId },
    data,
  })

  return NextResponse.json(plan)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; planId: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planId } = await params
  await prisma.plan.delete({ where: { id: planId } })
  return NextResponse.json({ success: true })
}
