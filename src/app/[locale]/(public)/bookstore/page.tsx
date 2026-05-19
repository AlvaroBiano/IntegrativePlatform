import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import GoogleAdSlot from '@/components/ads/GoogleAdSlot'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('bookstore')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

const BOOKS_PER_PAGE = 8

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function BookstorePage({ searchParams }: Props) {
  const t = await getTranslations('bookstore')
  const { page } = await searchParams
  const currentPage = parseInt(page || '1', 10)
  const skip = (currentPage - 1) * BOOKS_PER_PAGE

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: BOOKS_PER_PAGE,
    }),
    prisma.book.count({ where: { isActive: true } }),
  ])

  const totalPages = Math.ceil(total / BOOKS_PER_PAGE)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        <p className="text-xl text-gray-600">{t('subtitle')}</p>
      </div>

      <GoogleAdSlot placementKey="bookstore-list-top" />

      {books.length === 0 ? (
        <p className="text-center text-gray-500 py-12">{t('noBooks')}</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {books.map((book) => (
              <Link key={book.id} href={`/bookstore/${book.slug}`} className="card hover:shadow-lg transition-shadow group">
                <div className="relative h-64 mb-4 rounded-lg overflow-hidden bg-gray-100">
                  <Image src={book.coverImage} alt={book.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{book.title}</h2>
                <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                {book.price && (
                  <p className="text-primary-600 font-bold text-lg">
                    R$ {Number(book.price).toFixed(2)}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              {currentPage > 1 && (
                <Link href={`/bookstore?page=${currentPage - 1}`} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft size={20} />
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/bookstore?page=${p}`}
                  className={`px-4 py-2 rounded-lg ${p === currentPage ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'}`}
                >
                  {p}
                </Link>
              ))}
              {currentPage < totalPages && (
                <Link href={`/bookstore?page=${currentPage + 1}`} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRight size={20} />
                </Link>
              )}
            </div>
          )}
        </>
      )}

      <GoogleAdSlot placementKey="bookstore-list-bottom" />
    </div>
  )
}
