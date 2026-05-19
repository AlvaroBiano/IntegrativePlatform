import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, slug: true, status: true, publishedAt: true, createdAt: true },
  })
  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, slug, excerpt, content, coverImage, status, seoTitle, seoDesc } = body

  const publishedAt = status === 'PUBLISHED' ? new Date() : null

  const post = await prisma.blogPost.create({
    data: { title, slug, excerpt, content, coverImage, status, seoTitle, seoDesc, publishedAt, authorId: session.id },
  })

  return NextResponse.json(post, { status: 201 })
}
