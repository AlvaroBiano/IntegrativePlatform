import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patients = await prisma.user.findMany({
    where: { role: 'PATIENT' },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(patients)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, email, password } = body

  if (!name || !email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 400 })

  const hashedPassword = await bcrypt.hash(password, 10)

  const patient = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: 'PATIENT' },
    select: { id: true, name: true, email: true, createdAt: true },
  })

  return NextResponse.json(patient, { status: 201 })
}
