import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (session.role !== 'ADMIN' && session.id !== id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const files = await prisma.patientFile.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(files)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { title, description, fileUrl, fileName, fileSize, mimeType } = body

  const file = await prisma.patientFile.create({
    data: { userId: id, title, description, fileUrl, fileName, fileSize, mimeType },
  })

  return NextResponse.json(file, { status: 201 })
}
