import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; infoId: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { infoId } = await params
  const body = await request.json()

  const info = await prisma.patientInfo.update({
    where: { id: infoId },
    data: body,
  })

  return NextResponse.json(info)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; infoId: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { infoId } = await params
  await prisma.patientInfo.delete({ where: { id: infoId } })
  return NextResponse.json({ success: true })
}
