import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import GoogleAdSlot from '@/components/ads/GoogleAdSlot'
import type { Metadata } from 'next'

const localeMap: Record<string, string> = {
  'pt-BR': 'pt-BR',
  'en-US': 'en-US',
  'fr': 'fr-FR',
  'es': 'es-ES',
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('blog')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

const POSTS_PER_PAGE = 6

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function BlogPage({ params, searchParams }: Props) {
  const t = await getTranslations('blog')
  const { locale } = await params
  const { page } = await searchParams
  const currentPage = parseInt(page || '1', 10)
  const skip = (currentPage - 1) * POSTS_PER_PAGE
  const dateLocale = localeMap[locale] || 'en-US'

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: POSTS_PER_PAGE,
    }),
    prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
  ])

  const totalPages = Math.ceil(total / POSTS_PER_PAGE)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        <p className="text-xl text-gray-600">{t('subtitle')}</p>
      </div>

      <GoogleAdSlot placementKey="blog-list-top" />

      {posts.length === 0 ? (
        <p className="text-center text-gray-500 py-12">{t('noPosts')}</p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="card hover:shadow-lg transition-shadow group">
                {post.coverImage && (
                  <div className="relative h-48 -m-6 mb-4 rounded-t-xl overflow-hidden">
                    <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h2>
                {post.excerpt && <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>}
                {post.publishedAt && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    {new Date(post.publishedAt).toLocaleDateString(dateLocale)}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              {currentPage > 1 && (
                <Link href={`/blog?page=${currentPage - 1}`} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft size={20} />
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/blog?page=${p}`}
                  className={`px-4 py-2 rounded-lg ${p === currentPage ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'}`}
                >
                  {p}
                </Link>
              ))}
              {currentPage < totalPages && (
                <Link href={`/blog?page=${currentPage + 1}`} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRight size={20} />
                </Link>
              )}
            </div>
          )}
        </>
      )}

      <GoogleAdSlot placementKey="blog-list-bottom" />
    </div>
  )
}
