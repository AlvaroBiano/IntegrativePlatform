export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { FileText, Tag, Calendar } from 'lucide-react'

export default async function InfoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'patient' })
  const session = await getSession()
  if (!session) redirect('/login')

  const userId = session.id

  const infos = await prisma.patientInfo.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-0.5">
        <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">{t('info')}</h1>
        <p className="text-sm text-slate-500 font-medium">Consulte observações, instruções e relatórios informativos emitidos pelo seu profissional.</p>
      </div>

      {infos.length === 0 ? (
        <div className="glass-card border border-slate-100/50 text-center py-16 px-6 shadow-xl shadow-slate-100/10">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-sm font-semibold">{t('noInfo')}</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {infos.map((info) => (
            <div
              key={info.id}
              className="glass-card border border-slate-100/50 p-6 shadow-xl shadow-slate-100/10 flex flex-col gap-4 hover:border-primary-100 hover:bg-white/95 transition-all"
            >
              <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                <div className="p-3 bg-primary-50 text-primary-700 border border-primary-100/50 rounded-2xl shrink-0">
                  <FileText size={22} />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h2 className="text-lg font-bold font-heading text-slate-900 truncate">{info.title}</h2>
                  {info.category && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md border bg-slate-50 text-slate-600 border-slate-100 uppercase tracking-wider">
                      <Tag size={12} className="text-slate-400" />
                      {info.category}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-slate-100">
                {info.content}
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider pt-2 mt-1">
                <Calendar size={14} className="text-slate-300" />
                {new Date(info.createdAt).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
