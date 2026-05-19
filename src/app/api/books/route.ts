import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const books = await prisma.book.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, slug: true, author: true, price: true, isActive: true, createdAt: true },
  })
  return NextResponse.json(books)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, slug, author, description, coverImage, price, purchaseUrl, isbn, pages, publisher, publishedYear, isActive } = body

  const book = await prisma.book.create({
    data: { title, slug, author, description, coverImage, price, purchaseUrl, isbn, pages, publisher, publishedYear, isActive },
  })

  return NextResponse.json(book, { status: 201 })
}
