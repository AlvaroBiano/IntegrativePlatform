'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Lightbulb, Calendar, Loader2 } from 'lucide-react'

interface Tip {
  id: string
  title: string
  content: string
  createdAt: string
}

export default function TipsPage() {
  const t = useTranslations('patient')
  const c = useTranslations('common')
  const locale = useLocale()

  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          fetch(`/api/patients/${data.user.id}/tips`)
            .then((r) => r.json())
            .then(setTips)
            .finally(() => setLoading(false))
        } else {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-primary-600" size={36} />
        <p className="text-slate-500 font-semibold text-sm">{c('loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-0.5">
        <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">{t('tips')}</h1>
        <p className="text-sm text-slate-500 font-medium">Recomendações, insights e dicas personalizadas preparadas para a sua jornada de saúde.</p>
      </div>

      {tips.length === 0 ? (
        <div className="glass-card border border-slate-100/50 text-center py-16 px-6 shadow-xl shadow-slate-100/10">
          <Lightbulb size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-sm font-semibold">{t('noTips')}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="glass-card glass-card-hover border border-slate-100/50 p-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/60">
                    <Lightbulb size={20} className="animate-pulse" />
                  </div>
                  <h2 className="text-lg font-bold font-heading text-slate-900 leading-snug">{tip.title}</h2>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{tip.content}</p>
              </div>
              
              <div className="pt-4 mt-4 border-t border-slate-100/60 flex items-center text-xs text-slate-400 font-semibold gap-1.5">
                <Calendar size={14} className="text-slate-300" />
                {new Date(tip.createdAt).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

