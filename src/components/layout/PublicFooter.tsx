import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function PublicFooter() {
  const t = useTranslations('common')

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Integrative Platform</h3>
            <p className="text-gray-400">
              Cuidado completo para corpo, mente e espírito.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('blog')}</h3>
            <Link href="/blog" className="text-gray-400 hover:text-white transition-colors block">
              Artigos
            </Link>
            <Link href="/bookstore" className="text-gray-400 hover:text-white transition-colors block">
              Livraria
            </Link>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <p className="text-gray-400">contato@integrative.com</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Integrative Platform. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
