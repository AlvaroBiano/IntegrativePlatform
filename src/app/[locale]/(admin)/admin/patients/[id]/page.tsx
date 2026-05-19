'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Plus, Edit2, Trash2, X, Lightbulb, Target, FileText, Mail, User, Phone, Calendar, Save, Loader2, File, BookOpen, Link as LinkIcon, Video } from 'lucide-react'
import Link from 'next/link'

interface Patient { id: string; name: string; email: string; createdAt: string }
interface Tip { id: string; title: string; content: string; createdAt: string }
interface Plan { id: string; title: string; description: string; startDate: string; endDate: string | null; isActive: boolean; createdAt: string }
interface PatientInfo { id: string; title: string; content: string; category: string | null; createdAt: string }
interface Message { id: string; subject: string; content: string; createdAt: string }
interface Profile { id?: string; userId: string; phone: string | null; birthDate: string | null; notes: string | null }
interface PatientFile { id: string; title: string; description: string | null; fileUrl: string; fileName: string; fileSize: number | null; mimeType: string | null; createdAt: string }
interface Protocol { id: string; title: string; description: string | null; content: string; startDate: string; endDate: string | null; isActive: boolean; createdAt: string }
interface Appointment { id: string; title: string; url: string; description: string | null; scheduledAt: string | null; isActive: boolean; createdAt: string }

type TabType = 'profile' | 'tips' | 'plans' | 'info' | 'messages' | 'files' | 'protocols' | 'appointments'
type ModalType = 'tip' | 'plan' | 'info' | 'message' | 'file' | 'protocol' | 'appointment'

const endpointMap: Record<ModalType, string> = { tip: 'tips', plan: 'plans', info: 'info', message: 'messages', file: 'files', protocol: 'protocols', appointment: 'appointments' }
const tabToModalMap: Partial<Record<TabType, ModalType>> = { tips: 'tip', plans: 'plan', info: 'info', messages: 'message', files: 'file', protocols: 'protocol', appointments: 'appointment' }

export default function PatientDetailPage() {
  const t = useTranslations('admin')
  const c = useTranslations('common')
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [tips, setTips] = useState<Tip[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [info, setInfo] = useState<PatientInfo[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [files, setFiles] = useState<PatientFile[]>([])
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const [profile, setProfile] = useState<Profile>({ userId: patientId, phone: null, birthDate: null, notes: null })
  const [profileEditing, setProfileEditing] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileData, setProfileData] = useState({ phone: '', birthDate: '', notes: '' })

  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<ModalType>('tip')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => { fetchPatient() }, [patientId])

  const fetchPatient = async () => {
    const res = await fetch(`/api/patients/${patientId}`)
    const data = await res.json()
    setPatient(data)
    fetchContent(data.id)
  }

  const fetchContent = async (id: string) => {
    const endpoints = ['tips', 'plans', 'info', 'messages', 'files', 'protocols', 'appointments', 'profile']
    const results = await Promise.all(endpoints.map((ep) => fetch(`/api/patients/${id}/${ep}`).then((r) => r.json())))

    const [tipsData, plansData, infoData, messagesData, filesData, protocolsData, appointmentsData, profileData] = results
    setTips(tipsData); setPlans(plansData); setInfo(infoData); setMessages(messagesData)
    setFiles(filesData); setProtocols(protocolsData); setAppointments(appointmentsData)
    setProfile(profileData)
    setProfileData({ phone: profileData.phone || '', birthDate: profileData.birthDate ? new Date(profileData.birthDate).toISOString().split('T')[0] : '', notes: profileData.notes || '' })
    setLoading(false)
  }

  const saveProfile = async () => {
    setProfileSaving(true)
    await fetch(`/api/patients/${patientId}/profile`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profileData) })
    setProfileSaving(false); setProfileEditing(false); fetchContent(patientId)
  }

  const openModal = (type: ModalType, item?: any) => {
    setModalType(type); setEditingId(item?.id || null)
    if (type === 'tip') setFormData({ title: item?.title || '', content: item?.content || '' })
    else if (type === 'plan') setFormData({ title: item?.title || '', description: item?.description || '', startDate: item?.startDate ? new Date(item.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], endDate: item?.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '', isActive: item?.isActive ?? true })
    else if (type === 'info') setFormData({ title: item?.title || '', content: item?.content || '', category: item?.category || '' })
    else if (type === 'message') setFormData({ subject: item?.subject || '', content: item?.content || '' })
    else if (type === 'file') setFormData({ title: item?.title || '', description: item?.description || '', fileUrl: item?.fileUrl || '', fileName: item?.fileName || '' })
    else if (type === 'protocol') setFormData({ title: item?.title || '', description: item?.description || '', content: item?.content || '', startDate: item?.startDate ? new Date(item.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], endDate: item?.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '', isActive: item?.isActive ?? true })
    else if (type === 'appointment') setFormData({ title: item?.title || '', url: item?.url || '', description: item?.description || '', scheduledAt: item?.scheduledAt ? new Date(item.scheduledAt).toISOString().split('T')[0] : '', isActive: item?.isActive ?? true })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const endpoint = endpointMap[modalType]
    const method = editingId ? 'PATCH' : 'POST'
    const url = editingId ? `/api/patients/${patientId}/${endpoint}/${editingId}` : `/api/patients/${patientId}/${endpoint}`
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
    setShowModal(false); setEditingId(null); fetchContent(patientId)
  }

  const handleDelete = async (type: ModalType, id: string) => {
    if (!confirm(c('confirmDelete'))) return
    const endpoint = endpointMap[type]
    await fetch(`/api/patients/${patientId}/${endpoint}/${id}`, { method: 'DELETE' })
    fetchContent(patientId)
  }

  if (loading) return <p className="text-center py-12">{t('loading')}</p>
  if (!patient) return <p className="text-center py-12">{c('noResults')}</p>

  const tabLabels: Record<TabType, string> = {
    profile: t('profile'), tips: t('tips'), plans: t('plans'), protocols: t('protocols'),
    files: t('files'), appointments: t('appointments'), info: t('info'), messages: t('messages'),
  }

  const modalLabels: Record<ModalType, string> = {
    tip: t('tips'), plan: t('plans'), protocol: t('protocols'), file: t('files'),
    appointment: t('appointments'), info: t('info'), message: t('messages'),
  }

  const tabs = [
    { key: 'profile' as TabType, icon: User, label: tabLabels.profile },
    { key: 'tips' as TabType, icon: Lightbulb, label: tabLabels.tips, count: tips.length },
    { key: 'plans' as TabType, icon: Target, label: tabLabels.plans, count: plans.length },
    { key: 'protocols' as TabType, icon: BookOpen, label: tabLabels.protocols, count: protocols.length },
    { key: 'files' as TabType, icon: File, label: tabLabels.files, count: files.length },
    { key: 'appointments' as TabType, icon: Video, label: tabLabels.appointments, count: appointments.length },
    { key: 'info' as TabType, icon: FileText, label: tabLabels.info, count: info.length },
    { key: 'messages' as TabType, icon: Mail, label: tabLabels.messages, count: messages.length },
  ]

  const noDataLabels: Record<TabType, string> = {
    profile: '', tips: c('noData'), plans: c('noData'), protocols: c('noData'),
    files: c('noData'), appointments: c('noData'), info: c('noData'), messages: c('noData'),
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/patients" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
          <p className="text-gray-600">{patient.email}</p>
          <p className="text-sm text-gray-400">{c('createdAt')}: {new Date(patient.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-8 border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3 py-3 border-b-2 transition-colors whitespace-nowrap text-sm ${activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <tab.icon size={16} /><span>{tab.label}</span>
            {'count' in tab && tab.count !== undefined && <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{tab.count}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="max-w-2xl">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{t('profile')}</h2>
              {!profileEditing ? (
                <button onClick={() => setProfileEditing(true)} className="btn-primary flex items-center gap-2"><Edit2 size={16} /> {c('edit')}</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={saveProfile} disabled={profileSaving} className="btn-primary flex items-center gap-2">{profileSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {c('save')}</button>
                  <button onClick={() => { setProfileEditing(false); setProfileData({ phone: profile.phone || '', birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '', notes: profile.notes || '' }) }} className="btn-secondary">{c('cancel')}</button>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Phone size={16} /> {c('name')}</label>
                {profileEditing ? <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="input-field" placeholder="(00) 00000-0000" /> : <p className="text-gray-900">{profile.phone || <span className="text-gray-400 italic">{c('noData')}</span>}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Calendar size={16} /> {t('startDate')}</label>
                {profileEditing ? <input type="date" value={profileData.birthDate} onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })} className="input-field" /> : <p className="text-gray-900">{profile.birthDate ? new Date(profile.birthDate).toLocaleDateString() : <span className="text-gray-400 italic">{c('noData')}</span>}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><FileText size={16} /> {c('description')}</label>
                {profileEditing ? <textarea value={profileData.notes} onChange={(e) => setProfileData({ ...profileData, notes: e.target.value })} className="input-field" rows={6} placeholder="Alergias, condições especiais, histórico médico, etc." /> : <p className="text-gray-900 whitespace-pre-wrap">{profile.notes || <span className="text-gray-400 italic">{c('noData')}</span>}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'profile' && (
        <>
          <div className="flex justify-end mb-6">
            <button onClick={() => openModal(tabToModalMap[activeTab] as ModalType)} className="btn-primary flex items-center gap-2">
              <Plus size={18} /> {c('add')} {modalLabels[tabToModalMap[activeTab] as ModalType] || ''}
            </button>
          </div>

          {activeTab === 'tips' && (
            <div className="space-y-4">
              {tips.length === 0 ? <p className="text-center py-8 text-gray-500">{noDataLabels.tips}</p> : tips.map((tip) => (
                <div key={tip.id} className="card"><div className="flex justify-between items-start"><div><h3 className="font-semibold text-lg">{tip.title}</h3><p className="text-gray-600 mt-2 whitespace-pre-wrap">{tip.content}</p><p className="text-sm text-gray-400 mt-3">{new Date(tip.createdAt).toLocaleDateString()}</p></div><div className="flex gap-2"><button onClick={() => openModal('tip', tip)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button><button onClick={() => handleDelete('tip', tip.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button></div></div></div>
              ))}
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="space-y-4">
              {plans.length === 0 ? <p className="text-center py-8 text-gray-500">{noDataLabels.plans}</p> : plans.map((plan) => (
                <div key={plan.id} className="card"><div className="flex justify-between items-start"><div><div className="flex items-center gap-3"><h3 className="font-semibold text-lg">{plan.title}</h3><span className={`text-xs px-2 py-1 rounded ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{plan.isActive ? t('active') : t('inactive')}</span></div><p className="text-gray-600 mt-2 whitespace-pre-wrap">{plan.description}</p><div className="flex gap-4 mt-3 text-sm text-gray-500"><span>{t('startDate')}: {new Date(plan.startDate).toLocaleDateString()}</span>{plan.endDate && <span>{t('endDate')}: {new Date(plan.endDate).toLocaleDateString()}</span>}</div></div><div className="flex gap-2"><button onClick={() => openModal('plan', plan)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button><button onClick={() => handleDelete('plan', plan.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button></div></div></div>
              ))}
            </div>
          )}

          {activeTab === 'protocols' && (
            <div className="space-y-4">
              {protocols.length === 0 ? <p className="text-center py-8 text-gray-500">{noDataLabels.protocols}</p> : protocols.map((protocol) => (
                <div key={protocol.id} className="card"><div className="flex justify-between items-start"><div><div className="flex items-center gap-3"><h3 className="font-semibold text-lg">{protocol.title}</h3><span className={`text-xs px-2 py-1 rounded ${protocol.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{protocol.isActive ? t('active') : t('inactive')}</span></div>{protocol.description && <p className="text-gray-500 mt-1">{protocol.description}</p>}<div className="mt-3 text-sm text-gray-500"><span>{t('startDate')}: {new Date(protocol.startDate).toLocaleDateString()}</span>{protocol.endDate && <span className="ml-4">{t('endDate')}: {new Date(protocol.endDate).toLocaleDateString()}</span>}</div></div><div className="flex gap-2"><button onClick={() => openModal('protocol', protocol)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button><button onClick={() => handleDelete('protocol', protocol.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button></div></div></div>
              ))}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-4">
              {files.length === 0 ? <p className="text-center py-8 text-gray-500">{noDataLabels.files}</p> : files.map((file) => (
                <div key={file.id} className="card"><div className="flex justify-between items-start"><div className="flex items-start gap-4"><div className="p-3 bg-blue-100 rounded-lg"><File className="text-blue-600" size={24} /></div><div><h3 className="font-semibold text-lg">{file.title}</h3>{file.description && <p className="text-gray-600 mt-1">{file.description}</p>}<p className="text-sm text-gray-400 mt-2">{file.fileName}{file.fileSize ? ` (${(file.fileSize / 1024 / 1024).toFixed(1)} MB)` : ''}</p><a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm mt-1 inline-block">{c('open')} →</a></div></div><div className="flex gap-2"><button onClick={() => openModal('file', file)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button><button onClick={() => handleDelete('file', file.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button></div></div></div>
              ))}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {appointments.length === 0 ? <p className="text-center py-8 text-gray-500">{noDataLabels.appointments}</p> : appointments.map((apt) => (
                <div key={apt.id} className="card"><div className="flex justify-between items-start"><div className="flex items-start gap-4"><div className="p-3 bg-purple-100 rounded-lg"><Video className="text-purple-600" size={24} /></div><div><div className="flex items-center gap-3"><h3 className="font-semibold text-lg">{apt.title}</h3><span className={`text-xs px-2 py-1 rounded ${apt.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{apt.isActive ? t('active') : t('inactive')}</span></div>{apt.description && <p className="text-gray-600 mt-1">{apt.description}</p>}{apt.scheduledAt && <p className="text-sm text-gray-500 mt-2 flex items-center gap-1"><Calendar size={14} />{new Date(apt.scheduledAt).toLocaleString()}</p>}<a href={apt.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm mt-2 inline-block flex items-center gap-1"><LinkIcon size={14} />{c('open')} →</a></div></div><div className="flex gap-2"><button onClick={() => openModal('appointment', apt)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button><button onClick={() => handleDelete('appointment', apt.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button></div></div></div>
              ))}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4">
              {info.length === 0 ? <p className="text-center py-8 text-gray-500">{noDataLabels.info}</p> : info.map((item) => (
                <div key={item.id} className="card"><div className="flex justify-between items-start"><div><div className="flex items-center gap-3"><h3 className="font-semibold text-lg">{item.title}</h3>{item.category && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{item.category}</span>}</div><p className="text-gray-600 mt-2 whitespace-pre-wrap">{item.content}</p><p className="text-sm text-gray-400 mt-3">{new Date(item.createdAt).toLocaleDateString()}</p></div><div className="flex gap-2"><button onClick={() => openModal('info', item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button><button onClick={() => handleDelete('info', item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button></div></div></div>
              ))}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-4">
              {messages.length === 0 ? <p className="text-center py-8 text-gray-500">{noDataLabels.messages}</p> : messages.map((msg) => (
                <div key={msg.id} className="card"><div className="flex justify-between items-start"><div><h3 className="font-semibold text-lg">{msg.subject}</h3><p className="text-gray-600 mt-2 whitespace-pre-wrap">{msg.content}</p><p className="text-sm text-gray-400 mt-3">{new Date(msg.createdAt).toLocaleDateString()}</p></div><div className="flex gap-2"><button onClick={() => openModal('message', msg)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button><button onClick={() => handleDelete('message', msg.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button></div></div></div>
              ))}
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingId ? c('edit') : c('create')} {modalLabels[modalType]}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(modalType === 'tip' || modalType === 'plan' || modalType === 'protocol' || modalType === 'file' || modalType === 'appointment' || modalType === 'info') && (
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{c('title')}</label><input type="text" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" required /></div>
              )}
              {modalType === 'message' && (
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('subject')}</label><input type="text" value={formData.subject || ''} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="input-field" required /></div>
              )}
              {modalType === 'info' && (
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{c('description')}</label><input type="text" value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field" placeholder="Ex: Exames, Medicamentos" /></div>
              )}
              {modalType === 'file' && (
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('fileUrl')}</label><input type="url" value={formData.fileUrl || ''} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} className="input-field" placeholder="https://drive.google.com/..." required /></div>
              )}
              {modalType === 'appointment' && (
                <>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">{c('url')}</label><input type="url" value={formData.url || ''} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="input-field" placeholder="https://meet.google.com/..." required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('scheduledAt')}</label><input type="datetime-local" value={formData.scheduledAt || ''} onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })} className="input-field" /></div>
                </>
              )}
              {(modalType === 'plan' || modalType === 'protocol') && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('startDate')}</label><input type="date" value={formData.startDate || ''} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="input-field" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('endDate')}</label><input type="date" value={formData.endDate || ''} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="input-field" /></div>
                </div>
              )}
              {(modalType === 'plan' || modalType === 'protocol' || modalType === 'appointment') && (
                <div className="flex items-center gap-2"><input type="checkbox" id="isActive" checked={formData.isActive ?? true} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} /><label htmlFor="isActive" className="text-sm font-medium text-gray-700">{t('isActive')}</label></div>
              )}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{c('description')}</label><input type="text" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{c('content')}</label><textarea value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="input-field" rows={6} required /></div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">{editingId ? c('save') : c('create')}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">{c('cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
