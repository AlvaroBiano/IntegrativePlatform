'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Video, Calendar, Link as LinkIcon, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'

interface Appointment {
  id: string
  title: string
  url: string
  description: string | null
  scheduledAt: string | null
  isActive: boolean
  createdAt: string
}

export default function AppointmentsPage() {
  const t = useTranslations('patient')
  const c = useTranslations('common')
  const locale = useLocale()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          fetch(`/api/patients/${data.user.id}/appointments`)
            .then((r) => r.json())
            .then(setAppointments)
            .finally(() => setLoading(false))
        }
      })
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-primary-600" size={36} />
        <p className="text-slate-500 font-semibold text-sm">{c('loading')}</p>
      </div>
    )
  }

  const now = new Date()
  const upcoming = appointments
    .filter((a) => a.isActive && a.scheduledAt && new Date(a.scheduledAt) > now)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
  
  const past = appointments.filter((a) => !a.isActive || (a.scheduledAt && new Date(a.scheduledAt) <= now))

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-0.5">
        <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">{t('appointments')}</h1>
        <p className="text-sm text-slate-500 font-medium">Acesse suas consultas por vídeo online e veja o histórico de agendamentos.</p>
      </div>

      {/* Upcoming Appointments */}
      {upcoming.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
            <Video className="text-emerald-500" size={18} />
            {t('upcomingAppointments')}
          </h2>
          
          <div className="grid gap-6">
            {upcoming.map((apt) => (
              <div
                key={apt.id}
                className="glass-card border-l-4 border-l-primary-500 border border-slate-100/50 p-6 shadow-xl shadow-primary-50/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold font-heading text-slate-900">{apt.title}</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-100">
                      <CheckCircle2 size={12} />
                      {t('scheduled')}
                    </span>
                  </div>
                  {apt.description && (
                    <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">{apt.description}</p>
                  )}
                  {apt.scheduledAt && (
                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(apt.scheduledAt).toLocaleString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
                
                <a
                  href={apt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm shadow-md shadow-primary-600/10 hover:shadow-lg transition-all w-full md:w-auto justify-center"
                >
                  <Video size={16} />
                  {t('joinAppointment')}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {past.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
            <AlertTriangle className="text-slate-400" size={18} />
            {t('pastAppointments')}
          </h2>
          
          <div className="grid gap-4">
            {past.map((apt) => (
              <div
                key={apt.id}
                className="glass-card border border-slate-100/50 p-5 shadow-lg shadow-slate-100/5 opacity-75 hover:opacity-100 transition-opacity flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-bold font-heading text-slate-800 text-base">{apt.title}</h3>
                  {apt.description && (
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 max-w-2xl">{apt.description}</p>
                  )}
                  {apt.scheduledAt && (
                    <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                      <Calendar size={13} />
                      {new Date(apt.scheduledAt).toLocaleString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
                
                <a
                  href={apt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-700 transition-colors py-2 self-end md:self-auto"
                >
                  <LinkIcon size={14} />
                  {t('open')}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <div className="glass-card border border-slate-100/50 text-center py-16 px-6 shadow-xl shadow-slate-100/10">
          <Video size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-sm font-semibold">{t('noAppointments')}</p>
        </div>
      )}
    </div>
  )
}
