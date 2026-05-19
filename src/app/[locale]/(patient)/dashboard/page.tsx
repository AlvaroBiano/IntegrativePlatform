'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Lightbulb, Target, BookOpen, File, Video, FileText, Mail, Calendar, ExternalLink } from 'lucide-react'

interface Tip { id: string; title: string; content: string; createdAt: string }
interface Plan { id: string; title: string; description: string; startDate: string; endDate: string | null; isActive: boolean }
interface Protocol { id: string; title: string; description: string | null; content: string; startDate: string; endDate: string | null; isActive: boolean }
interface PatientFile { id: string; title: string; description: string | null; fileUrl: string; fileName: string; createdAt: string }
interface Appointment { id: string; title: string; url: string; description: string | null; scheduledAt: string | null; isActive: boolean }
interface Message { id: string; subject: string; content: string; isBroadcast: boolean; readAt: string | null; createdAt: string }

export default function PatientDashboard() {
  const t = useTranslations('patient')
  const [loading, setLoading] = useState(true)
  const [tips, setTips] = useState<Tip[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [files, setFiles] = useState<PatientFile[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUserId(data.user.id)
          fetchContent(data.user.id)
        }
      })
  }, [])

  const fetchContent = async (id: string) => {
    const endpoints = ['tips', 'plans', 'protocols', 'files', 'appointments', 'messages']
    const results = await Promise.all(endpoints.map((ep) => fetch(`/api/patients/${id}/${ep}`).then((r) => r.json())))
    const [tipsData, plansData, protocolsData, filesData, appointmentsData, messagesData] = results
    setTips(tipsData); setPlans(plansData); setProtocols(protocolsData)
    setFiles(filesData); setAppointments(appointmentsData); setMessages(messagesData)
    setLoading(false)
  }

  if (loading) return <p className="text-center py-12">{t('loading')}</p>

  const unreadMessages = messages.filter((m) => !m.readAt).length
  const activeAppointments = appointments.filter((a) => a.isActive && a.scheduledAt && new Date(a.scheduledAt) > new Date())

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('dashboard')}</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <a href="/dashboard/tips" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4"><div className="p-3 bg-yellow-100 rounded-lg"><Lightbulb className="text-yellow-600" size={24} /></div><div><p className="text-2xl font-bold">{tips.length}</p><p className="text-gray-600">{t('tips')}</p></div></div>
        </a>
        <a href="/dashboard/plans" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4"><div className="p-3 bg-primary-100 rounded-lg"><Target className="text-primary-600" size={24} /></div><div><p className="text-2xl font-bold">{plans.filter((p) => p.isActive).length}</p><p className="text-gray-600">{t('plans')}</p></div></div>
        </a>
        <a href="/dashboard/protocols" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4"><div className="p-3 bg-blue-100 rounded-lg"><BookOpen className="text-blue-600" size={24} /></div><div><p className="text-2xl font-bold">{protocols.filter((p) => p.isActive).length}</p><p className="text-gray-600">{t('protocols')}</p></div></div>
        </a>
        <a href="/dashboard/messages" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4"><div className="p-3 bg-purple-100 rounded-lg"><Mail className="text-purple-600" size={24} /></div><div><p className="text-2xl font-bold">{unreadMessages}</p><p className="text-gray-600">{t('unread')}</p></div></div>
        </a>
      </div>

      {activeAppointments.length > 0 && (
        <div className="card mb-8 border-l-4 border-l-purple-500">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Video className="text-purple-600" size={20} />{t('upcomingAppointments')}</h2>
          <div className="space-y-3">
            {activeAppointments.sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()).slice(0, 3).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <h3 className="font-medium">{apt.title}</h3>
                  {apt.scheduledAt && <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Calendar size={14} />{new Date(apt.scheduledAt).toLocaleString()}</p>}
                </div>
                <a href={apt.url} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2 text-sm"><Video size={16} />{t('joinAppointment')}</a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Lightbulb className="text-yellow-600" size={20} />{t('recentTips')}</h2>
          {tips.length === 0 ? <p className="text-gray-500">{t('noTips')}</p> : (
            <div className="space-y-3">{tips.slice(0, 3).map((tip) => (
              <div key={tip.id} className="p-4 bg-yellow-50 rounded-lg"><h3 className="font-medium">{tip.title}</h3><p className="text-sm text-gray-600 line-clamp-2 mt-1">{tip.content}</p></div>
            ))}</div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><BookOpen className="text-blue-600" size={20} />{t('activeProtocols')}</h2>
          {protocols.filter((p) => p.isActive).length === 0 ? <p className="text-gray-500">{t('noProtocols')}</p> : (
            <div className="space-y-3">{protocols.filter((p) => p.isActive).slice(0, 3).map((protocol) => (
              <div key={protocol.id} className="p-4 bg-blue-50 rounded-lg"><h3 className="font-medium">{protocol.title}</h3>{protocol.description && <p className="text-sm text-gray-600 line-clamp-2 mt-1">{protocol.description}</p>}</div>
            ))}</div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><File className="text-green-600" size={20} />{t('recentFiles')}</h2>
          {files.length === 0 ? <p className="text-gray-500">{t('noFiles')}</p> : (
            <div className="space-y-3">{files.slice(0, 3).map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg"><div><h3 className="font-medium">{file.title}</h3><p className="text-sm text-gray-500">{file.fileName}</p></div><a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm flex items-center gap-1"><ExternalLink size={14} />{t('open')}</a></div>
            ))}</div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Mail className="text-purple-600" size={20} />{t('recentMessages')}</h2>
          {messages.length === 0 ? <p className="text-gray-500">{t('noMessages')}</p> : (
            <div className="space-y-3">{messages.slice(0, 3).map((msg) => (
              <div key={msg.id} className={`p-4 rounded-lg ${msg.readAt ? 'bg-gray-50' : 'bg-purple-50'}`}><div className="flex justify-between items-start"><h3 className="font-medium">{msg.subject}</h3>{!msg.readAt && <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">{t('new')}</span>}</div></div>
            ))}</div>
          )}
        </div>
      </div>
    </div>
  )
}
