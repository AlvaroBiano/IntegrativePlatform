import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcrypt'

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@integrative.com' },
    update: {},
    create: {
      email: 'admin@integrative.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  console.log('Admin created:', admin.email)

  const sections = [
    { key: 'hero', title: 'Bem-vindo à Medicina Integrativa', subtitle: 'Cuidado completo para seu corpo e mente', content: 'Transforme sua saúde com uma abordagem que integra corpo, mente e espírito.', buttonText: 'Saiba Mais', buttonUrl: '/blog', order: 1 },
    { key: 'about', title: 'Sobre Nós', subtitle: 'Nossa missão', content: 'Oferecemos tratamentos integrativos personalizados, combinando o melhor da medicina convencional com terapias complementares.', order: 2 },
    { key: 'services', title: 'Serviços', subtitle: 'O que oferecemos', content: 'Consultas personalizadas, planos de tratamento integrativos, acompanhamento contínuo e muito mais.', order: 3 },
    { key: 'testimonials', title: 'Depoimentos', subtitle: 'O que nossos pacientes dizem', content: 'Histórias reais de transformação e bem-estar.', order: 4 },
    { key: 'contact', title: 'Contato', subtitle: 'Entre em contato', content: 'Agende sua consulta hoje mesmo.', buttonText: 'Agendar', buttonUrl: '/contact', order: 5 },
  ]

  for (const section of sections) {
    await prisma.landingSection.upsert({
      where: { key: section.key },
      update: {},
      create: section,
    })
  }

  console.log('Landing sections created')

  const adPlacements = [
    { key: 'blog-list-top', name: 'Blog List - Top', page: 'BLOG_LIST' as const },
    { key: 'blog-list-middle', name: 'Blog List - Middle', page: 'BLOG_LIST' as const },
    { key: 'blog-list-bottom', name: 'Blog List - Bottom', page: 'BLOG_LIST' as const },
    { key: 'blog-detail-top', name: 'Blog Detail - Top', page: 'BLOG_DETAIL' as const },
    { key: 'blog-detail-middle', name: 'Blog Detail - Middle', page: 'BLOG_DETAIL' as const },
    { key: 'blog-detail-bottom', name: 'Blog Detail - Bottom', page: 'BLOG_DETAIL' as const },
    { key: 'bookstore-list-top', name: 'Bookstore List - Top', page: 'BOOKSTORE_LIST' as const },
    { key: 'bookstore-list-bottom', name: 'Bookstore List - Bottom', page: 'BOOKSTORE_LIST' as const },
    { key: 'bookstore-detail-top', name: 'Bookstore Detail - Top', page: 'BOOKSTORE_DETAIL' as const },
    { key: 'bookstore-detail-bottom', name: 'Bookstore Detail - Bottom', page: 'BOOKSTORE_DETAIL' as const },
  ]

  for (const ad of adPlacements) {
    await prisma.adPlacement.upsert({
      where: { key: ad.key },
      update: {},
      create: { ...ad, adCode: '<!-- Google Ad Code Here -->' },
    })
  }

  console.log('Ad placements created')
  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
