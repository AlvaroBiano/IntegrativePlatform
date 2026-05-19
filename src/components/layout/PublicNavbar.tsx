'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useState } from 'react'
import { Menu, X, Globe } from 'lucide-react'

export default function PublicNavbar() {
  const t = useTranslations('common')
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [showLang, setShowLang] = useState(false)
  const locales = [
    { code: 'pt-BR', label: 'PT' },
    { code: 'en-US', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'es', label: 'ES' },
  ]

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary-700">
              Integrative Platform
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('home')}
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('blog')}
            </Link>
            <Link href="/bookstore" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('bookstore')}
            </Link>
            <Link href="/login" className="btn-primary">
              {t('login')}
            </Link>
            <div className="relative">
              <button
                onClick={() => setShowLang(!showLang)}
                className="flex items-center gap-1 text-gray-700 hover:text-primary-600"
              >
                <Globe size={18} />
              </button>
              {showLang && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border py-1">
                  {locales.map((loc) => (
                    <a
                      key={loc.code}
                      href={`/${loc.code}`}
                      onClick={() => setShowLang(false)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${loc.code === locale ? 'font-bold text-primary-600' : 'text-gray-700'}`}
                    >
                      {loc.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            <Link href="/" className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>
              {t('home')}
            </Link>
            <Link href="/blog" className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>
              {t('blog')}
            </Link>
            <Link href="/bookstore" className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>
              {t('bookstore')}
            </Link>
            <Link href="/login" className="block py-2 btn-primary text-center" onClick={() => setIsOpen(false)}>
              {t('login')}
            </Link>
            <div className="flex gap-2 py-2">
              {locales.map((loc) => (
                <a
                  key={loc.code}
                  href={`/${loc.code}`}
                  className={`px-3 py-1 rounded text-sm ${loc.code === locale ? 'bg-primary-100 text-primary-700 font-bold' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {loc.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
