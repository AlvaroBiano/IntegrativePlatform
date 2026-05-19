'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Video, Calendar, Link as LinkIcon, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Appointment { id: string; title: string; url: string; description: string | null; scheduledAt: string | null; isActive: boolean; createdAt: string }

export default function AppointmentsPage() {
  const t = useTranslations('patient')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    fetch('/api/auth/session').then((r) => r.json()).then((data) => {
      if (data.user) { setUserId(data.user.id); fetch('/api/patients/' + data.user.id + '/appointments').then((r) => r.json()).then(setAppointments).finally(() => setLoading(false)) }
    })
  }, [])

  if (loading) return <p className="text-center py-12">{t('loading')}</p>

  const now = new Date()
  const upcoming = appointments.filter((a) => a.isActive && a.scheduledAt && new Date(a.scheduledAt) > now).sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
  const past = appointments.filter((a) => !a.isActive || (a.scheduledAt && new Date(a.scheduledAt) <= now))

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('appointments')}</h1>

      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Clock className="text-green-600" size={20} />{t('upcomingAppointments')}</h2>
          <div className="space-y-4">
            {upcoming.map((apt) => (
              <div key={apt.id} className="card border-l-4 border-l-green-500">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2"><h3 className="text-lg font-semibold">{apt.title}</h3><span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded"><CheckCircle size={14} /> {t('scheduled')}</span></div>
                    {apt.description && <p className="text-gray-600 mb-3">{apt.description}</p>}
                    {apt.scheduledAt && <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={14} />{new Date(apt.scheduledAt).toLocaleString()}</p>}
                  </div>
                  <a href={apt.url} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2"><Video size={18} />{t('joinAppointment')}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><XCircle className="text-gray-400" size={20} />{t('pastAppointments')}</h2>
          <div className="space-y-4">
            {past.map((apt) => (
              <div key={apt.id} className="card opacity-75">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{apt.title}</h3>
                    {apt.description && <p className="text-gray-600 mt-1">{apt.description}</p>}
                    {apt.scheduledAt && <p className="text-sm text-gray-500 mt-2 flex items-center gap-1"><Calendar size={14} />{new Date(apt.scheduledAt).toLocaleString()}</p>}
                  </div>
                  <a href={apt.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm flex items-center gap-1"><LinkIcon size={14} />{t('open')}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <div className="card text-center py-12"><Video size={48} className="mx-auto text-gray-400 mb-4" /><p className="text-gray-500">{t('noAppointments')}</p></div>
      )}
    </div>
  )
}
