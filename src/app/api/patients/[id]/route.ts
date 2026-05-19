import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const patient = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true },
  })

  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(patient)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { name, email, password } = body

  const data: any = { name, email }
  if (password) {
    const bcrypt = await import('bcrypt')
    data.password = await bcrypt.hash(password, 10)
  }

  const patient = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, createdAt: true },
  })

  return NextResponse.json(patient)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
