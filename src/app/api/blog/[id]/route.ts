import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { title, slug, excerpt, content, coverImage, status, seoTitle, seoDesc } = body

  const publishedAt = status === 'PUBLISHED' ? new Date() : undefined

  const post = await prisma.blogPost.update({
    where: { id },
    data: { title, slug, excerpt, content, coverImage, status, seoTitle, seoDesc, publishedAt },
  })

  return NextResponse.json(post)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.blogPost.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
