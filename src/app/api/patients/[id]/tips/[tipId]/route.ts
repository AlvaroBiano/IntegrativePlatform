import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; tipId: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tipId } = await params
  const body = await request.json()

  const tip = await prisma.tip.update({
    where: { id: tipId },
    data: body,
  })

  return NextResponse.json(tip)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; tipId: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tipId } = await params
  await prisma.tip.delete({ where: { id: tipId } })
  return NextResponse.json({ success: true })
}
