'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Lightbulb, Target, BookOpen, File, Video, Mail, Calendar, ExternalLink, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Tip {
  id: string
  title: string
  content: string
  createdAt: string
}

interface Plan {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string | null
  isActive: boolean
}

interface Protocol {
  id: string
  title: string
  description: string | null
  content: string
  startDate: string
  endDate: string | null
  isActive: boolean
}

interface PatientFile {
  id: string
  title: string
  description: string | null
  fileUrl: string
  fileName: string
  createdAt: string
}

interface Appointment {
  id: string
  title: string
  url: string
  description: string | null
  scheduledAt: string | null
  isActive: boolean
}

interface Message {
  id: string
  subject: string
  content: string
  isBroadcast: boolean
  readAt: string | null
  createdAt: string
}

export default function PatientDashboard() {
  const t = useTranslations('patient')
  const c = useTranslations('common')
  const locale = useLocale()

  const [loading, setLoading] = useState(true)
  const [tips, setTips] = useState<Tip[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [files, setFiles] = useState<PatientFile[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUserName(data.user.name || '')
          fetchContent(data.user.id)
        }
      })
  }, [])

  const fetchContent = async (id: string) => {
    try {
      const endpoints = ['tips', 'plans', 'protocols', 'files', 'appointments', 'messages']
      const results = await Promise.all(
        endpoints.map((ep) => fetch(`/api/patients/${id}/${ep}`).then((r) => r.json()))
      )
      const [tipsData, plansData, protocolsData, filesData, appointmentsData, messagesData] = results
      setTips(tipsData)
      setPlans(plansData)
      setProtocols(protocolsData)
      setFiles(filesData)
      setAppointments(appointmentsData)
      setMessages(messagesData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-primary-600" size={36} />
        <p className="text-slate-500 font-semibold text-sm">{c('loading')}</p>
      </div>
    )
  }

  const unreadMessages = messages.filter((m) => !m.readAt).length
  const activeAppointments = appointments.filter(
    (a) => a.isActive && a.scheduledAt && new Date(a.scheduledAt) > new Date()
  )

  const stats = [
    {
      href: '/dashboard/tips',
      icon: Lightbulb,
      count: tips.length,
      label: t('tips'),
      colorClass: 'bg-amber-50 text-amber-600 border border-amber-100/60',
    },
    {
      href: '/dashboard/plans',
      icon: Target,
      count: plans.filter((p) => p.isActive).length,
      label: t('plans'),
      colorClass: 'bg-emerald-50 text-emerald-700 border border-emerald-100/60',
    },
    {
      href: '/dashboard/protocols',
      icon: BookOpen,
      count: protocols.filter((p) => p.isActive).length,
      label: t('protocols'),
      colorClass: 'bg-sky-50 text-sky-600 border border-sky-100/60',
    },
    {
      href: '/dashboard/messages',
      icon: Mail,
      count: unreadMessages,
      label: t('unread'),
      colorClass: 'bg-indigo-50 text-indigo-600 border border-indigo-100/60',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
          {t('welcome')}, <span className="text-primary-700 font-bold">{userName || c('patient')}</span>!
        </h1>
        <p className="text-sm text-slate-500 font-medium">Acompanhe suas dicas de saúde, planos e prescrições.</p>
      </div>

      {/* Interactive Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Link
            key={idx}
            href={stat.href}
            className="group glass-card glass-card-hover flex items-center justify-between p-5 border border-slate-100/50 shadow-lg shadow-slate-100/10"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl transition-transform duration-300 group-hover:scale-105 ${stat.colorClass}`}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-slate-900 leading-none">{stat.count}</p>
                <p className="text-sm font-semibold text-slate-500 mt-1.5">{stat.label}</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>

      {/* Online Video Consultation Alert */}
      {activeAppointments.length > 0 && (
        <div className="glass-card border-l-4 border-l-primary-500 border border-slate-100/50 p-6 shadow-xl shadow-primary-50/10">
          <h2 className="text-lg font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
            <Video className="text-primary-600" size={20} />
            {t('upcomingAppointments')}
          </h2>
          <div className="space-y-4">
            {activeAppointments
              .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
              .slice(0, 2)
              .map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-primary-50/30 border border-primary-100/40 hover:bg-primary-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-900 text-sm">{apt.title}</h3>
                    {apt.scheduledAt && (
                      <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-1">
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
                    className="btn-primary flex items-center gap-2 text-xs py-2 px-4 shadow-md shadow-primary-600/10 self-end sm:self-auto"
                  >
                    <Video size={14} />
                    {t('joinAppointment')}
                  </a>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* detailed blocks grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Tips */}
        <div className="glass-card border border-slate-100/50 p-6 flex flex-col h-[380px] shadow-xl shadow-slate-100/10">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
              <Lightbulb className="text-amber-500" size={18} />
              {t('recentTips')}
            </h2>
            <Link
              href="/dashboard/tips"
              className="text-xs font-bold text-primary-700 hover:text-primary-900 flex items-center gap-0.5"
            >
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {tips.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                {t('noTips')}
              </div>
            ) : (
              tips.slice(0, 3).map((tip) => (
                <div
                  key={tip.id}
                  className="p-4 bg-amber-50/20 border border-amber-100/20 rounded-2xl transition-colors hover:bg-amber-50/40"
                >
                  <h3 className="font-semibold text-slate-900 text-sm">{tip.title}</h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1.5">{tip.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Protocols */}
        <div className="glass-card border border-slate-100/50 p-6 flex flex-col h-[380px] shadow-xl shadow-slate-100/10">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
              <BookOpen className="text-sky-500" size={18} />
              {t('activeProtocols')}
            </h2>
            <Link
              href="/dashboard/protocols"
              className="text-xs font-bold text-primary-700 hover:text-primary-900 flex items-center gap-0.5"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {protocols.filter((p) => p.isActive).length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                {t('noProtocols')}
              </div>
            ) : (
              protocols
                .filter((p) => p.isActive)
                .slice(0, 3)
                .map((protocol) => (
                  <div
                    key={protocol.id}
                    className="p-4 bg-sky-50/20 border border-sky-100/20 rounded-2xl transition-colors hover:bg-sky-50/40"
                  >
                    <h3 className="font-semibold text-slate-900 text-sm">{protocol.title}</h3>
                    {protocol.description && (
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1.5">
                        {protocol.description}
                      </p>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Recent Files */}
        <div className="glass-card border border-slate-100/50 p-6 flex flex-col h-[380px] shadow-xl shadow-slate-100/10">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
              <File className="text-emerald-500" size={18} />
              {t('recentFiles')}
            </h2>
            <Link
              href="/dashboard/files"
              className="text-xs font-bold text-primary-700 hover:text-primary-900 flex items-center gap-0.5"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {files.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                {t('noFiles')}
              </div>
            ) : (
              files.slice(0, 3).map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-emerald-50/20 border border-emerald-100/20 rounded-2xl transition-colors hover:bg-emerald-50/40"
                >
                  <div className="space-y-0.5 max-w-[70%]">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">{file.title}</h3>
                    <p className="text-xs text-slate-400 font-medium truncate">{file.fileName}</p>
                  </div>
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-900 hover:underline"
                  >
                    <ExternalLink size={13} />
                    {t('open')}
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="glass-card border border-slate-100/50 p-6 flex flex-col h-[380px] shadow-xl shadow-slate-100/10">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
              <Mail className="text-indigo-500" size={18} />
              {t('recentMessages')}
            </h2>
            <Link
              href="/dashboard/messages"
              className="text-xs font-bold text-primary-700 hover:text-primary-900 flex items-center gap-0.5"
            >
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                {t('noMessages')}
              </div>
            ) : (
              messages.slice(0, 3).map((msg) => (
                <Link
                  key={msg.id}
                  href="/dashboard/messages"
                  className={`block p-4 rounded-2xl border transition-all ${
                    msg.readAt
                      ? 'bg-slate-50/50 border-slate-100/50 hover:bg-slate-50'
                      : 'bg-indigo-50/30 border-indigo-100/20 hover:bg-indigo-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">{msg.subject}</h3>
                    {!msg.readAt && (
                      <span className="shrink-0 text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded-md border border-indigo-700/10">
                        {t('new')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-1">
                    {msg.content}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
