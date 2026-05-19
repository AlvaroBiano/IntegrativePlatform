import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (session.role !== 'ADMIN' && session.id !== id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: id },
  })

  return NextResponse.json(profile || { userId: id, phone: '', birthDate: null, notes: '' })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { phone, birthDate, notes } = body

  const existing = await prisma.patientProfile.findUnique({
    where: { userId: id },
  })

  let profile
  if (existing) {
    profile = await prisma.patientProfile.update({
      where: { userId: id },
      data: {
        phone: phone || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        notes: notes || null,
      },
    })
  } else {
    profile = await prisma.patientProfile.create({
      data: {
        userId: id,
        phone: phone || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        notes: notes || null,
      },
    })
  }

  return NextResponse.json(profile)
}
