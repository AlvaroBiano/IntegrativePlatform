export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { Users, FileText, BookOpen, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'admin' })

  const [patientsCount, postsCount, booksCount, messagesCount] = await Promise.all([
    prisma.user.count({ where: { role: 'PATIENT' } }),
    prisma.blogPost.count(),
    prisma.book.count({ where: { isActive: true } }),
    prisma.message.count(),
  ])

  const recentPatients = await prisma.user.findMany({
    where: { role: 'PATIENT' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, email: true, createdAt: true },
  })

  const recentPosts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, title: true, status: true, createdAt: true },
  })

  const stats = [
    {
      href: '/admin/patients',
      icon: Users,
      count: patientsCount,
      label: t('patients'),
      bgIcon: 'bg-primary-50 text-primary-700 border border-primary-100',
    },
    {
      href: '/admin/content/blog',
      icon: FileText,
      count: postsCount,
      label: t('blogPosts'),
      bgIcon: 'bg-secondary-50 text-secondary-700 border border-secondary-100',
    },
    {
      href: '/admin/content/books',
      icon: BookOpen,
      count: booksCount,
      label: t('books'),
      bgIcon: 'bg-rose-50 text-rose-600 border border-rose-100',
    },
    {
      href: '/admin/messages',
      icon: Mail,
      count: messagesCount,
      label: t('messages'),
      bgIcon: 'bg-amber-50 text-amber-600 border border-amber-100',
    },
  ]

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">{t('dashboard')}</h1>
        <p className="text-sm text-slate-500 font-medium">Gerencie e monitore o ecossistema de saúde integrativa.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Link key={idx} href={stat.href} className="group glass-card glass-card-hover flex items-center justify-between p-5 border border-slate-100/50">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-105 ${stat.bgIcon}`}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-slate-900 leading-none">{stat.count}</p>
                <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>

      {/* Two Columns for Recents */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Patients */}
        <div className="glass-card border border-slate-100/50 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100/80">
            <h2 className="text-lg font-bold font-heading text-slate-955">{t('recentPatients')}</h2>
            <Link href="/admin/patients" className="text-xs font-bold text-primary-700 hover:text-primary-900 flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {recentPatients.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                {t('noPatients')}
              </div>
            ) : (
              recentPatients.map((p) => (
                <div key={p.id} className="flex justify-between items-center py-3 px-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100/30 transition-all">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-900 text-sm">{p.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{p.email}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 bg-white border border-slate-100 px-2.5 py-1 rounded-lg">
                    {new Date(p.createdAt).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="glass-card border border-slate-100/50 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100/80">
            <h2 className="text-lg font-bold font-heading text-slate-955">{t('recentPosts')}</h2>
            <Link href="/admin/content/blog" className="text-xs font-bold text-primary-700 hover:text-primary-900 flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {recentPosts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                {t('noPosts')}
              </div>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="flex justify-between items-center py-3 px-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100/30 transition-all">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900 text-sm line-clamp-1">{post.title}</p>
                    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md ${post.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                      {post.status === 'PUBLISHED' ? t('published') : t('draft')}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 bg-white border border-slate-100 px-2.5 py-1 rounded-lg">
                    {new Date(post.createdAt).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
