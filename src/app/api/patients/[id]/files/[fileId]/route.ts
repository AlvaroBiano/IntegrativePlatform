import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { fileId } = await params
  const body = await request.json()

  const file = await prisma.patientFile.update({ where: { id: fileId }, data: body })
  return NextResponse.json(file)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { fileId } = await params
  await prisma.patientFile.delete({ where: { id: fileId } })
  return NextResponse.json({ success: true })
}
