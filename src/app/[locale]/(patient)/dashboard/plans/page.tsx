'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Target, Calendar, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface Plan {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string | null
  isActive: boolean
  createdAt: string
}

export default function PlansPage() {
  const t = useTranslations('patient')
  const c = useTranslations('common')
  const locale = useLocale()

  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          fetch(`/api/patients/${data.user.id}/plans`)
            .then((r) => r.json())
            .then(setPlans)
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
        <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">{t('plans')}</h1>
        <p className="text-sm text-slate-500 font-medium">Acompanhe suas metas terapêuticas, planos de ação e objetivos recomendados para o seu bem-estar.</p>
      </div>

      {plans.length === 0 ? (
        <div className="glass-card border border-slate-100/50 text-center py-16 px-6 shadow-xl shadow-slate-100/10">
          <Target size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-sm font-semibold">{t('noPlans')}</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-card glass-card-hover border border-slate-100/50 p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
                plan.isActive ? 'border-l-4 border-l-primary-500' : 'border-l-4 border-l-slate-300 opacity-80'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      plan.isActive 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100/60' 
                        : 'bg-slate-50 text-slate-400 border-slate-150'
                    }`}>
                      <Target size={20} className={plan.isActive ? 'animate-pulse' : ''} />
                    </div>
                    <h2 className="text-lg font-bold font-heading text-slate-900 leading-snug">{plan.title}</h2>
                  </div>
                  
                  {plan.isActive ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-100">
                      <CheckCircle2 size={12} />
                      {t('active')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border bg-slate-50 text-slate-500 border-slate-200">
                      <XCircle size={12} />
                      {t('inactive')}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap pl-1">{plan.description}</p>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100/60 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400 font-semibold pl-1">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-300" />
                  {t('start')}: {new Date(plan.startDate).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
                {plan.endDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-300" />
                    {t('end')}: {new Date(plan.endDate).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

