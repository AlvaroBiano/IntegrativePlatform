import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowLeft } from 'lucide-react'
import GoogleAdSlot from '@/components/ads/GoogleAdSlot'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

const localeMap: Record<string, string> = {
  'pt-BR': 'pt-BR',
  'en-US': 'en-US',
  'fr': 'fr-FR',
  'es': 'es-ES',
}

interface Props {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: { slug, status: 'PUBLISHED' },
  })

  if (!post) return {}

  return {
    title: post.seoTitle || post.title,
    description: post.seoDesc || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDesc || post.excerpt || '',
      images: post.coverImage ? [{ url: post.coverImage }] : [],
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, locale } = await params
  const t = await getTranslations('blog')
  const dateLocale = localeMap[locale] || 'en-US'
  const post = await prisma.blogPost.findUnique({
    where: { slug, status: 'PUBLISHED' },
  })

  if (!post) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/blog" className="flex items-center text-primary-600 hover:text-primary-700 mb-8">
        <ArrowLeft size={18} className="mr-2" />
        {t('backToBlog')}
      </Link>

      <GoogleAdSlot placementKey="blog-detail-top" />

      <article>
        {post.coverImage && (
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{post.title}</h1>
        {post.publishedAt && (
          <div className="flex items-center text-gray-500 mb-8">
            <Calendar size={16} className="mr-2" />
            {new Date(post.publishedAt).toLocaleDateString(dateLocale)}
          </div>
        )}
        {post.excerpt && (
          <p className="text-xl text-gray-600 mb-8 italic">{post.excerpt}</p>
        )}
        <div className="prose prose-lg prose-green max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>

      <GoogleAdSlot placementKey="blog-detail-middle" />

      <GoogleAdSlot placementKey="blog-detail-bottom" />
    </div>
  )
}
