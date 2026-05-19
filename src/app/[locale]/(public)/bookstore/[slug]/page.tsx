import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ShoppingCart, BookOpen, Building, Hash } from 'lucide-react'
import GoogleAdSlot from '@/components/ads/GoogleAdSlot'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const book = await prisma.book.findUnique({
    where: { slug, isActive: true },
  })

  if (!book) return {}

  return {
    title: `${book.title} - ${book.author}`,
    description: book.description.substring(0, 160),
    openGraph: {
      title: book.title,
      description: book.description.substring(0, 160),
      images: [{ url: book.coverImage }],
      type: 'book',
    },
  }
}

export default async function BookDetailPage({ params }: Props) {
  const t = await getTranslations('bookstore')
  const { slug } = await params
  const book = await prisma.book.findUnique({
    where: { slug, isActive: true },
  })

  if (!book) notFound()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/bookstore" className="flex items-center text-primary-600 hover:text-primary-700 mb-8">
        <ArrowLeft size={18} className="mr-2" />
        {t('backToStore')}
      </Link>

      <GoogleAdSlot placementKey="bookstore-detail-top" />

      <div className="grid md:grid-cols-2 gap-12">
        <div className="relative h-96 md:h-full rounded-2xl overflow-hidden bg-gray-100">
          <Image src={book.coverImage} alt={book.title} fill className="object-cover" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{book.title}</h1>
          <p className="text-lg text-gray-600 mb-6">por {book.author}</p>
          {book.price && (
            <p className="text-3xl font-bold text-primary-600 mb-6">
              R$ {Number(book.price).toFixed(2)}
            </p>
          )}
          <a
            href={book.purchaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center gap-2 text-lg px-8 py-3 mb-8"
          >
            <ShoppingCart size={20} />
            {t('buyNow')}
          </a>
          <div className="space-y-3 text-gray-600">
            {book.pages && (
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>{book.pages} {t('pages')}</span>
              </div>
            )}
            {book.publisher && (
              <div className="flex items-center gap-2">
                <Building size={16} />
                <span>{t('publisher')}: {book.publisher}</span>
              </div>
            )}
            {book.isbn && (
              <div className="flex items-center gap-2">
                <Hash size={16} />
                <span>{t('isbn')}: {book.isbn}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Descrição</h2>
        <div className="prose prose-lg prose-green max-w-none" dangerouslySetInnerHTML={{ __html: book.description }} />
      </div>

      <GoogleAdSlot placementKey="bookstore-detail-bottom" />
    </div>
  )
}
