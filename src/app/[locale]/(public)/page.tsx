import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Medicina Integrativa | Corpo, Mente e Espírito',
    description: 'Cuidado completo e personalizado para sua saúde integrativa. Consultas, planos de tratamento e acompanhamento contínuo.',
  }
}

export default async function HomePage() {
  const t = await getTranslations('landing')
  const sections = await prisma.landingSection.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })

  return (
    <div>
      {sections.map((section) => (
        <section key={section.id} className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {section.key === 'hero' ? (
              <div className="text-center bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl p-12 md:p-20">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  {section.title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  {section.subtitle}
                </p>
                {section.buttonText && section.buttonUrl && (
                  <Link href={section.buttonUrl} className="btn-primary text-lg px-8 py-3">
                    {section.buttonText}
                  </Link>
                )}
              </div>
            ) : section.key === 'about' ? (
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                  <p className="text-lg text-primary-600 mb-6">{section.subtitle}</p>
                  <p className="text-gray-600 leading-relaxed">{section.content}</p>
                </div>
                {section.imageUrl && (
                  <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden">
                    <Image
                      src={section.imageUrl}
                      alt={section.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            ) : section.key === 'services' ? (
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <p className="text-lg text-primary-600 mb-12">{section.subtitle}</p>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="card">
                    <h3 className="text-xl font-semibold mb-3">Consultas</h3>
                    <p className="text-gray-600">Atendimento personalizado e humanizado.</p>
                  </div>
                  <div className="card">
                    <h3 className="text-xl font-semibold mb-3">Planos</h3>
                    <p className="text-gray-600">Tratamentos integrativos sob medida.</p>
                  </div>
                  <div className="card">
                    <h3 className="text-xl font-semibold mb-3">Acompanhamento</h3>
                    <p className="text-gray-600">Suporte contínuo para sua jornada.</p>
                  </div>
                </div>
              </div>
            ) : section.key === 'testimonials' ? (
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <p className="text-lg text-primary-600 mb-12">{section.subtitle}</p>
                <p className="text-gray-600 italic">{section.content}</p>
              </div>
            ) : section.key === 'contact' ? (
              <div className="text-center bg-gray-900 text-white rounded-3xl p-12 md:p-20">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{section.title}</h2>
                <p className="text-lg text-gray-300 mb-8">{section.subtitle}</p>
                <p className="text-gray-400 mb-8">{section.content}</p>
                {section.buttonText && section.buttonUrl && (
                  <Link href={section.buttonUrl} className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-lg transition-colors">
                    {section.buttonText}
                  </Link>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-lg text-primary-600 mb-6">{section.subtitle}</p>
                )}
                {section.content && (
                  <p className="text-gray-600 leading-relaxed">{section.content}</p>
                )}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
