import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ads = await prisma.adPlacement.findMany({
    orderBy: { page: 'asc' },
  })
  return NextResponse.json(ads)
}
