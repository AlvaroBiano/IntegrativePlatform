'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  ArrowLeft, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Lightbulb, 
  Target, 
  FileText, 
  Mail, 
  User, 
  Phone, 
  Calendar, 
  Save, 
  Loader2, 
  File, 
  BookOpen, 
  Link as LinkIcon, 
  Video, 
  AlertTriangle,
  FileCheck
} from 'lucide-react'
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

type TabType = 'profile' | 'tips' | 'plans' | 'protocols' | 'files' | 'appointments' | 'info' | 'messages'
type ModalType = 'tip' | 'plan' | 'info' | 'message' | 'file' | 'protocol' | 'appointment'

const endpointMap: Record<ModalType, string> = { 
  tip: 'tips', 
  plan: 'plans', 
  info: 'info', 
  message: 'messages', 
  file: 'files', 
  protocol: 'protocols', 
  appointment: 'appointments' 
}

const tabToModalMap: Partial<Record<TabType, ModalType>> = { 
  tips: 'tip', 
  plans: 'plan', 
  info: 'info', 
  messages: 'message', 
  files: 'file', 
  protocols: 'protocol', 
  appointments: 'appointment' 
}

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
  const [initialData, setInitialData] = useState<any>({})

  const [actionLoading, setActionLoading] = useState(false)
  const [deleteItem, setDeleteItem] = useState<{ type: ModalType; id: string } | null>(null)

  useEffect(() => { 
    fetchPatient() 
  }, [patientId])

  const fetchPatient = async () => {
    try {
      const res = await fetch(`/api/patients/${patientId}`)
      const data = await res.json()
      setPatient(data)
      await fetchContent(data.id)
    } catch (err) {
      console.error('Error fetching patient:', err)
      setLoading(false)
    }
  }

  const fetchContent = async (id: string) => {
    const endpoints = ['tips', 'plans', 'info', 'messages', 'files', 'protocols', 'appointments', 'profile']
    try {
      const results = await Promise.all(
        endpoints.map((ep) => fetch(`/api/patients/${id}/${ep}`).then((r) => r.json()))
      )

      const [tipsData, plansData, infoData, messagesData, filesData, protocolsData, appointmentsData, profileData] = results
      setTips(tipsData || [])
      setPlans(plansData || [])
      setInfo(infoData || [])
      setMessages(messagesData || [])
      setFiles(filesData || [])
      setProtocols(protocolsData || [])
      setAppointments(appointmentsData || [])
      
      if (profileData) {
        setProfile(profileData)
        setProfileData({ 
          phone: profileData.phone || '', 
          birthDate: profileData.birthDate ? new Date(profileData.birthDate).toISOString().split('T')[0] : '', 
          notes: profileData.notes || '' 
        })
      }
    } catch (err) {
      console.error('Error fetching content:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setProfileSaving(true)
    try {
      await fetch(`/api/patients/${patientId}/profile`, { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(profileData) 
      })
      setProfileEditing(false)
      await fetchContent(patientId)
    } catch (err) {
      console.error(err)
    } finally {
      setProfileSaving(false)
    }
  }

  const isFormDirty = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialData)
  }

  const handleCloseModal = () => {
    if (isFormDirty()) {
      if (!confirm(t('confirmUnsavedChanges'))) {
        return
      }
    }
    setShowModal(false)
    setEditingId(null)
    setFormData({})
    setInitialData({})
  }

  const openModal = (type: ModalType, item?: any) => {
    setModalType(type)
    setEditingId(item?.id || null)
    
    let initialFields: any = {}
    if (type === 'tip') {
      initialFields = { title: item?.title || '', content: item?.content || '' }
    } else if (type === 'plan') {
      initialFields = { 
        title: item?.title || '', 
        description: item?.description || '', 
        startDate: item?.startDate ? new Date(item.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], 
        endDate: item?.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '', 
        isActive: item?.isActive ?? true 
      }
    } else if (type === 'info') {
      initialFields = { title: item?.title || '', content: item?.content || '', category: item?.category || '' }
    } else if (type === 'message') {
      initialFields = { subject: item?.subject || '', content: item?.content || '' }
    } else if (type === 'file') {
      initialFields = { 
        title: item?.title || '', 
        description: item?.description || '', 
        fileUrl: item?.fileUrl || '', 
        fileName: item?.fileName || '' 
      }
    } else if (type === 'protocol') {
      initialFields = { 
        title: item?.title || '', 
        description: item?.description || '', 
        content: item?.content || '', 
        startDate: item?.startDate ? new Date(item.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], 
        endDate: item?.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '', 
        isActive: item?.isActive ?? true 
      }
    } else if (type === 'appointment') {
      initialFields = { 
        title: item?.title || '', 
        url: item?.url || '', 
        description: item?.description || '', 
        scheduledAt: item?.scheduledAt ? new Date(item.scheduledAt).toISOString().slice(0, 16) : '', 
        isActive: item?.isActive ?? true 
      }
    }
    
    setFormData(initialFields)
    setInitialData(initialFields)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    const endpoint = endpointMap[modalType]
    const method = editingId ? 'PATCH' : 'POST'
    const url = editingId ? `/api/patients/${patientId}/${endpoint}/${editingId}` : `/api/patients/${patientId}/${endpoint}`
    
    try {
      const payload = { ...formData }
      // Convert dates to ISO strings for API
      if (payload.startDate) payload.startDate = new Date(payload.startDate).toISOString()
      if (payload.endDate) payload.endDate = payload.endDate ? new Date(payload.endDate).toISOString() : null
      if (payload.scheduledAt) payload.scheduledAt = payload.scheduledAt ? new Date(payload.scheduledAt).toISOString() : null

      await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      })
      setShowModal(false)
      setEditingId(null)
      setFormData({})
      setInitialData({})
      await fetchContent(patientId)
    } catch (err) {
      console.error('Error submitting form:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteItem) return
    setActionLoading(true)
    const { type, id } = deleteItem
    const endpoint = endpointMap[type]
    try {
      await fetch(`/api/patients/${patientId}/${endpoint}/${id}`, { method: 'DELETE' })
      setDeleteItem(null)
      await fetchContent(patientId)
    } catch (err) {
      console.error('Error deleting item:', err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="animate-spin text-primary-600" size={36} />
        <p className="text-slate-500 font-medium">{t('loading')}</p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-24 glass-card border border-slate-200/50">
        <AlertTriangle className="mx-auto text-slate-350 mb-3 animate-bounce" size={36} />
        <p className="text-slate-500 font-medium">{c('noResults')}</p>
      </div>
    )
  }

  const tabLabels: Record<TabType, string> = {
    profile: t('profile'), 
    tips: t('tips'), 
    plans: t('plans'), 
    protocols: t('protocols'),
    files: t('files'), 
    appointments: t('appointments'), 
    info: t('info'), 
    messages: t('messages'),
  }

  const modalLabels: Record<ModalType, string> = {
    tip: t('tips'), 
    plan: t('plans'), 
    protocol: t('protocols'), 
    file: t('files'),
    appointment: t('appointments'), 
    info: t('info'), 
    message: t('messages'),
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header breadcrumb bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-slate-100/80">
        <div className="flex items-center gap-4">
          <Link href="/admin/patients" className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200/60 rounded-xl transition-all shadow-sm active:scale-95 text-slate-500 hover:text-slate-800" title={t('backToPatients')}>
            <ArrowLeft size={18} />
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">{patient.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 font-medium">
              <span>{patient.email}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline"></span>
              <span>{c('createdAt')}: {new Date(patient.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area Grid */}
      <div className="grid lg:grid-cols-4 gap-8 items-start">
        {/* Left Tabs Menu Column */}
        <div className="lg:col-span-1 glass-card p-3 border border-slate-200/50 space-y-1">
          {tabs.map((tab) => {
            const ActiveIcon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-500 text-white font-bold shadow-md shadow-primary-500/10' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ActiveIcon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span className="text-sm">{tab.label}</span>
                </div>
                {'count' in tab && tab.count !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                    isActive 
                      ? 'bg-primary-600 border-primary-400 text-white' 
                      : 'bg-slate-100 border-slate-200/60 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Right Active View Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Add Item Top bar, except for profile tab */}
          {activeTab !== 'profile' && (
            <div className="flex justify-between items-center bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-slate-100/50 shadow-sm">
              <h2 className="text-lg font-bold font-heading text-slate-800">{tabLabels[activeTab]}</h2>
              <button 
                onClick={() => openModal(tabToModalMap[activeTab] as ModalType)} 
                className="btn-primary flex items-center gap-2 text-xs py-2 px-4"
              >
                <Plus size={16} /> 
                {c('add')} {modalLabels[tabToModalMap[activeTab] as ModalType] || ''}
              </button>
            </div>
          )}

          {/* PROFILE ACTIVE VIEW */}
          {activeTab === 'profile' && (
            <div className="glass-card border border-slate-200/50">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100/80">
                <h2 className="text-xl font-bold font-heading text-slate-900">{t('profile')}</h2>
                {!profileEditing ? (
                  <button 
                    onClick={() => setProfileEditing(true)} 
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <Edit2 size={15} /> 
                    {c('edit')}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={saveProfile} 
                      disabled={profileSaving} 
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      {profileSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} 
                      {c('save')}
                    </button>
                    <button 
                      onClick={() => { 
                        setProfileEditing(false)
                        setProfileData({ 
                          phone: profile.phone || '', 
                          birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '', 
                          notes: profile.notes || '' 
                        }) 
                      }} 
                      className="btn-secondary text-sm py-2.5 px-4"
                    >
                      {c('cancel')}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Phone Field */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Phone size={14} className="text-slate-400" /> 
                    {t('phone')}
                  </label>
                  {profileEditing ? (
                    <input 
                      type="tel" 
                      value={profileData.phone} 
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} 
                      className="input-field shadow-sm" 
                      placeholder="(00) 00000-0000" 
                    />
                  ) : (
                    <p className="text-slate-800 font-medium pl-6">{profile.phone || <span className="text-slate-400 italic font-normal">{c('noData')}</span>}</p>
                  )}
                </div>

                {/* Birth Date Field */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Calendar size={14} className="text-slate-400" /> 
                    {t('birthDate')}
                  </label>
                  {profileEditing ? (
                    <input 
                      type="date" 
                      value={profileData.birthDate} 
                      onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })} 
                      className="input-field shadow-sm" 
                    />
                  ) : (
                    <p className="text-slate-800 font-medium pl-6">
                      {profile.birthDate 
                        ? new Date(profile.birthDate).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' }) 
                        : <span className="text-slate-400 italic font-normal">{c('noData')}</span>}
                    </p>
                  )}
                </div>

                {/* Clinical Notes Field */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <FileText size={14} className="text-slate-400" /> 
                    {t('notes')}
                  </label>
                  {profileEditing ? (
                    <textarea 
                      value={profileData.notes} 
                      onChange={(e) => setProfileData({ ...profileData, notes: e.target.value })} 
                      className="input-field shadow-sm" 
                      rows={6} 
                      placeholder={t('notesPlaceholder')} 
                    />
                  ) : (
                    <div className="pl-6 bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                      <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed font-medium">
                        {profile.notes || <span className="text-slate-400 italic font-normal">{c('noData')}</span>}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TIPS VIEW */}
          {activeTab === 'tips' && (
            <div className="space-y-4">
              {tips.length === 0 ? (
                <div className="text-center py-16 glass-card border border-slate-200/50">
                  <Lightbulb className="mx-auto text-slate-300 mb-3" size={32} />
                  <p className="text-slate-400 text-sm font-medium">{t('noTips')}</p>
                </div>
              ) : (
                tips.map((tip) => (
                  <div key={tip.id} className="glass-card hover:border-slate-300/80 transition-all border border-slate-200/50 flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <h3 className="font-bold text-lg font-heading text-slate-900">{tip.title}</h3>
                      <p className="text-slate-655 text-sm whitespace-pre-wrap leading-relaxed">{tip.content}</p>
                      <span className="inline-block text-xs font-semibold text-slate-400 pt-2">{new Date(tip.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex md:self-start gap-1">
                      <button onClick={() => openModal('tip', tip)} className="p-2 text-secondary-700 hover:bg-secondary-50 rounded-xl transition-all" title={c('edit')}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteItem({ type: 'tip', id: tip.id })} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title={c('delete')}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PLANS VIEW */}
          {activeTab === 'plans' && (
            <div className="space-y-4">
              {plans.length === 0 ? (
                <div className="text-center py-16 glass-card border border-slate-200/50">
                  <Target className="mx-auto text-slate-300 mb-3" size={32} />
                  <p className="text-slate-400 text-sm font-medium">{t('noPlans')}</p>
                </div>
              ) : (
                plans.map((plan) => (
                  <div key={plan.id} className="glass-card hover:border-slate-300/80 transition-all border border-slate-200/50 flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-lg font-heading text-slate-900">{plan.title}</h3>
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          plan.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-slate-50 text-slate-500 border border-slate-200'
                        }`}>
                          {plan.isActive ? t('active') : t('inactive')}
                        </span>
                      </div>
                      <p className="text-slate-655 text-sm whitespace-pre-wrap leading-relaxed">{plan.description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs font-semibold text-slate-400">
                        <span>{t('startDate')}: {new Date(plan.startDate).toLocaleDateString()}</span>
                        {plan.endDate && <span>{t('endDate')}: {new Date(plan.endDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="flex md:self-start gap-1">
                      <button onClick={() => openModal('plan', plan)} className="p-2 text-secondary-700 hover:bg-secondary-50 rounded-xl transition-all" title={c('edit')}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteItem({ type: 'plan', id: plan.id })} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title={c('delete')}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PROTOCOLS VIEW */}
          {activeTab === 'protocols' && (
            <div className="space-y-4">
              {protocols.length === 0 ? (
                <div className="text-center py-16 glass-card border border-slate-200/50">
                  <BookOpen className="mx-auto text-slate-300 mb-3" size={32} />
                  <p className="text-slate-400 text-sm font-medium">{t('noProtocols')}</p>
                </div>
              ) : (
                protocols.map((protocol) => (
                  <div key={protocol.id} className="glass-card hover:border-slate-300/80 transition-all border border-slate-200/50 flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-lg font-heading text-slate-900">{protocol.title}</h3>
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          protocol.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-slate-50 text-slate-500 border border-slate-200'
                        }`}>
                          {protocol.isActive ? t('active') : t('inactive')}
                        </span>
                      </div>
                      {protocol.description && <p className="text-slate-500 text-sm italic font-medium">{protocol.description}</p>}
                      <p className="text-slate-655 text-sm whitespace-pre-wrap leading-relaxed pt-1 bg-slate-50/40 p-3 rounded-xl border border-slate-100/50 mt-1">{protocol.content}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs font-semibold text-slate-400">
                        <span>{t('startDate')}: {new Date(protocol.startDate).toLocaleDateString()}</span>
                        {protocol.endDate && <span>{t('endDate')}: {new Date(protocol.endDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="flex md:self-start gap-1">
                      <button onClick={() => openModal('protocol', protocol)} className="p-2 text-secondary-700 hover:bg-secondary-50 rounded-xl transition-all" title={c('edit')}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteItem({ type: 'protocol', id: protocol.id })} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title={c('delete')}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* FILES VIEW */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              {files.length === 0 ? (
                <div className="text-center py-16 glass-card border border-slate-200/50">
                  <File className="mx-auto text-slate-300 mb-3" size={32} />
                  <p className="text-slate-400 text-sm font-medium">{t('noFiles')}</p>
                </div>
              ) : (
                files.map((file) => (
                  <div key={file.id} className="glass-card hover:border-slate-300/80 transition-all border border-slate-200/50 flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-primary-50 border border-primary-100 rounded-2xl text-primary-700">
                        <FileCheck size={24} />
                      </div>
                      <div className="space-y-1 flex-1">
                        <h3 className="font-bold text-lg font-heading text-slate-900">{file.title}</h3>
                        {file.description && <p className="text-slate-500 text-sm leading-relaxed">{file.description}</p>}
                        <div className="text-xs font-semibold text-slate-400 flex flex-wrap items-center gap-x-2.5 pt-1">
                          <span className="text-slate-500">{file.fileName}</span>
                          {file.fileSize && (
                            <>
                              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                              <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                            </>
                          )}
                        </div>
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-900 pt-2 transition-colors">
                          {c('open')} <LinkIcon size={12} />
                        </a>
                      </div>
                    </div>
                    <div className="flex md:self-start gap-1">
                      <button onClick={() => openModal('file', file)} className="p-2 text-secondary-700 hover:bg-secondary-50 rounded-xl transition-all" title={c('edit')}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteItem({ type: 'file', id: file.id })} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title={c('delete')}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* APPOINTMENTS VIEW */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center py-16 glass-card border border-slate-200/50">
                  <Video className="mx-auto text-slate-300 mb-3" size={32} />
                  <p className="text-slate-400 text-sm font-medium">{t('noAppointments')}</p>
                </div>
              ) : (
                appointments.map((apt) => (
                  <div key={apt.id} className="glass-card hover:border-slate-300/80 transition-all border border-slate-200/50 flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600">
                        <Video size={24} />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-bold text-lg font-heading text-slate-900">{apt.title}</h3>
                          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            apt.isActive 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : 'bg-slate-50 text-slate-500 border border-slate-200'
                          }`}>
                            {apt.isActive ? t('active') : t('inactive')}
                          </span>
                        </div>
                        {apt.description && <p className="text-slate-500 text-sm leading-relaxed">{apt.description}</p>}
                        {apt.scheduledAt && (
                          <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-1">
                            <Calendar size={13} />
                            {new Date(apt.scheduledAt).toLocaleString(undefined, { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                        <a href={apt.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-900 pt-2 transition-colors">
                          {c('open')} <LinkIcon size={12} />
                        </a>
                      </div>
                    </div>
                    <div className="flex md:self-start gap-1">
                      <button onClick={() => openModal('appointment', apt)} className="p-2 text-secondary-700 hover:bg-secondary-50 rounded-xl transition-all" title={c('edit')}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteItem({ type: 'appointment', id: apt.id })} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title={c('delete')}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PATIENT INFO VIEW */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {info.length === 0 ? (
                <div className="text-center py-16 glass-card border border-slate-200/50">
                  <FileText className="mx-auto text-slate-300 mb-3" size={32} />
                  <p className="text-slate-400 text-sm font-medium">{t('noData')}</p>
                </div>
              ) : (
                info.map((item) => (
                  <div key={item.id} className="glass-card hover:border-slate-300/80 transition-all border border-slate-200/50 flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-lg font-heading text-slate-900">{item.title}</h3>
                        {item.category && (
                          <span className="inline-flex items-center text-[10px] font-bold bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-md">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-655 text-sm whitespace-pre-wrap leading-relaxed">{item.content}</p>
                      <span className="inline-block text-xs font-semibold text-slate-400 pt-2">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex md:self-start gap-1">
                      <button onClick={() => openModal('info', item)} className="p-2 text-secondary-700 hover:bg-secondary-50 rounded-xl transition-all" title={c('edit')}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteItem({ type: 'info', id: item.id })} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title={c('delete')}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* MESSAGES VIEW */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-16 glass-card border border-slate-200/50">
                  <Mail className="mx-auto text-slate-300 mb-3" size={32} />
                  <p className="text-slate-400 text-sm font-medium">{t('noMessages')}</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="glass-card hover:border-slate-300/80 transition-all border border-slate-200/50 flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <h3 className="font-bold text-lg font-heading text-slate-900">{msg.subject}</h3>
                      <p className="text-slate-655 text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <span className="inline-block text-xs font-semibold text-slate-400 pt-2">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex md:self-start gap-1">
                      <button onClick={() => openModal('message', msg)} className="p-2 text-secondary-700 hover:bg-secondary-50 rounded-xl transition-all" title={c('edit')}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteItem({ type: 'message', id: msg.id })} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title={c('delete')}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT ITEM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 animate-drop-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100">
              <h2 className="text-xl font-bold font-heading text-slate-900">{editingId ? c('edit') : c('create')} {modalLabels[modalType]}</h2>
              <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Conditional Title or Subject field */}
              {(modalType === 'tip' || modalType === 'plan' || modalType === 'protocol' || modalType === 'file' || modalType === 'appointment' || modalType === 'info') && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{c('title')}</label>
                  <input 
                    type="text" 
                    value={formData.title || ''} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                    className="input-field" 
                    required 
                    placeholder="Ex: Título descritivo..."
                  />
                </div>
              )}
              {modalType === 'message' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('subject')}</label>
                  <input 
                    type="text" 
                    value={formData.subject || ''} 
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })} 
                    className="input-field" 
                    required 
                    placeholder="Ex: Assunto da mensagem..."
                  />
                </div>
              )}

              {/* Conditional Category field for Info */}
              {modalType === 'info' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('description')}</label>
                  <input 
                    type="text" 
                    value={formData.category || ''} 
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                    className="input-field" 
                    placeholder="Ex: Exames, Medicamentos, Suplementação" 
                  />
                </div>
              )}

              {/* Conditional File Fields */}
              {modalType === 'file' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('fileUrl')}</label>
                    <input 
                      type="url" 
                      value={formData.fileUrl || ''} 
                      onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} 
                      className="input-field" 
                      placeholder="https://drive.google.com/file/d/..." 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('fileName')}</label>
                    <input 
                      type="text" 
                      value={formData.fileName || ''} 
                      onChange={(e) => setFormData({ ...formData, fileName: e.target.value })} 
                      className="input-field" 
                      placeholder="Ex: receita_medica.pdf" 
                      required 
                    />
                  </div>
                </>
              )}

              {/* Conditional Appointment Fields */}
              {modalType === 'appointment' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{c('url')}</label>
                    <input 
                      type="url" 
                      value={formData.url || ''} 
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })} 
                      className="input-field" 
                      placeholder="https://meet.google.com/xyz-abc-123" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('scheduledAt')}</label>
                    <input 
                      type="datetime-local" 
                      value={formData.scheduledAt || ''} 
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })} 
                      className="input-field shadow-sm" 
                    />
                  </div>
                </>
              )}

              {/* Conditional Plan / Protocol dates */}
              {(modalType === 'plan' || modalType === 'protocol') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('startDate')}</label>
                    <input 
                      type="date" 
                      value={formData.startDate || ''} 
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} 
                      className="input-field shadow-sm" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('endDate')}</label>
                    <input 
                      type="date" 
                      value={formData.endDate || ''} 
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} 
                      className="input-field shadow-sm" 
                    />
                  </div>
                </div>
              )}

              {/* IsActive Switch (plan, protocol, appointment) */}
              {(modalType === 'plan' || modalType === 'protocol' || modalType === 'appointment') && (
                <div className="flex items-center gap-3 py-1">
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    checked={formData.isActive ?? true} 
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} 
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 select-none cursor-pointer">{t('isActive')}</label>
                </div>
              )}

              {/* Optional description (for protocol, file, appointment) */}
              {(modalType === 'protocol' || modalType === 'file' || modalType === 'appointment') && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{c('description')}</label>
                  <input 
                    type="text" 
                    value={formData.description || ''} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    className="input-field" 
                    placeholder="Descrição breve opcional..."
                  />
                </div>
              )}

              {/* Main content field (textarea) */}
              {/* For Plans, description is the main content (so it acts as description/content). In standard db, plan has description, protocol has content, tip has content. */}
              {modalType === 'plan' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{c('description')}</label>
                  <textarea 
                    value={formData.description || ''} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    className="input-field" 
                    rows={6} 
                    required 
                    placeholder="Descreva o plano em detalhes..."
                  />
                </div>
              ) : (modalType === 'tip' || modalType === 'protocol' || modalType === 'info' || modalType === 'message') ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{c('content')}</label>
                  <textarea 
                    value={formData.content || ''} 
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                    className="input-field" 
                    rows={6} 
                    required 
                    placeholder="Digite o conteúdo detalhado aqui..."
                  />
                </div>
              ) : null}

              {/* Action buttons */}
              <div className="flex gap-3.5 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {actionLoading && <Loader2 className="animate-spin" size={16} />}
                  {actionLoading ? t('saving') : editingId ? c('save') : c('create')}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary flex-1"
                >
                  {c('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRM DELETE MODAL */}
      {deleteItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setDeleteItem(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 animate-drop-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 animate-bounce">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900">{t('confirmDelete')}</h3>
                <p className="text-sm text-slate-500 mt-1">Essa ação é irreversível e removerá permanentemente este item do registro deste paciente.</p>
              </div>
            </div>
            
            <div className="flex gap-3.5 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="btn-primary bg-rose-600 hover:bg-rose-700 shadow-rose-700/10 hover:shadow-rose-700/20 flex-1 flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 className="animate-spin" size={16} />}
                {actionLoading ? t('deleting') : t('delete')}
              </button>
              <button
                onClick={() => setDeleteItem(null)}
                className="btn-secondary flex-1"
              >
                {c('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
