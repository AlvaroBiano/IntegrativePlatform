'use client'

import { useEffect, useState } from 'react'
import { Send, Users, Mail, X, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Patient {
  id: string
  name: string
  email: string
}

interface Message {
  id: string
  subject: string
  isBroadcast: boolean
  createdAt: string
  recipient: { name: string } | null
}

export default function MessagesAdminPage() {
  const t = useTranslations('admin')
  const c = useTranslations('common')

  const [patients, setPatients] = useState<Patient[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  
  const [formData, setFormData] = useState({ recipientId: '', subject: '', content: '', isBroadcast: false })
  const [initialData, setInitialData] = useState({ recipientId: '', subject: '', content: '', isBroadcast: false })

  useEffect(() => {
    Promise.all([
      fetch('/api/patients').then((r) => r.json()),
      fetch('/api/messages').then((r) => r.json()),
    ]).then(([p, m]) => {
      setPatients(p || [])
      setMessages(m || [])
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  const isFormDirty = () => {
    return (
      formData.recipientId !== initialData.recipientId ||
      formData.subject !== initialData.subject ||
      formData.content !== initialData.content ||
      formData.isBroadcast !== initialData.isBroadcast
    )
  }

  const handleCloseModal = () => {
    if (isFormDirty()) {
      if (!confirm(t('confirmUnsavedChanges'))) {
        return
      }
    }
    setShowModal(false)
    setFormData({ recipientId: '', subject: '', content: '', isBroadcast: false })
    setInitialData({ recipientId: '', subject: '', content: '', isBroadcast: false })
  }

  const handleOpenModal = (isBroadcast: boolean) => {
    const data = { 
      recipientId: !isBroadcast && patients.length > 0 ? patients[0].id : '', 
      subject: '', 
      content: '', 
      isBroadcast 
    }
    setFormData(data)
    setInitialData(data)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      setShowModal(false)
      setFormData({ recipientId: '', subject: '', content: '', isBroadcast: false })
      setInitialData({ recipientId: '', subject: '', content: '', isBroadcast: false })
      const res = await fetch('/api/messages')
      const updatedMessages = await res.json()
      setMessages(updatedMessages || [])
    } catch (err) {
      console.error(err)
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">{t('messages')}</h1>
          <p className="text-sm text-slate-500 font-medium font-sans">Envie comunicados em massa para todos os pacientes ou converse de forma direta.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleOpenModal(true)} 
            className="btn-primary flex items-center gap-2 text-xs py-2.5 px-4 shadow-sm"
          >
            <Users size={16} /> 
            {t('broadcastMessage')}
          </button>
          <button 
            onClick={() => handleOpenModal(false)} 
            className="btn-secondary flex items-center gap-2 text-xs py-2.5 px-4 border border-slate-200"
          >
            <Mail size={16} /> 
            {t('messageTypeIndividual')}
          </button>
        </div>
      </div>

      {/* Messages Listing Table */}
      <div className="glass-card overflow-hidden p-0 border border-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">{t('subject')}</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">{t('recipient')}</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">{t('messageType')}</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">{t('messageDate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900 text-sm">{msg.subject}</td>
                  <td className="py-4 px-6 text-slate-655 text-sm">
                    {msg.isBroadcast ? t('allPatients') : (msg.recipient?.name || <span className="text-slate-400 italic font-normal">N/A</span>)}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                      msg.isBroadcast 
                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {msg.isBroadcast ? t('messageTypeBroadcast') : t('messageTypeIndividual')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-400 text-sm">
                    {new Date(msg.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {messages.length === 0 && (
          <div className="text-center py-16 px-6">
            <Mail className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-slate-500 text-sm font-medium">{t('noMessages')}</p>
          </div>
        )}
      </div>

      {/* CREATE MESSAGE MODAL DRAWER */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 animate-drop-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100">
              <h2 className="text-xl font-bold font-heading text-slate-900">
                {formData.isBroadcast ? t('broadcastMessage') : t('sendMessage')}
              </h2>
              <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {!formData.isBroadcast && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('recipient')}</label>
                  <select 
                    value={formData.recipientId} 
                    onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })} 
                    className="input-field shadow-sm bg-white" 
                    required
                  >
                    <option value="">{t('messageRecipientSelect')}</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('subject')}</label>
                <input 
                  type="text" 
                  value={formData.subject} 
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })} 
                  className="input-field shadow-sm" 
                  required 
                  placeholder="Ex: Assunto importante sobre a consulta..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('messageContent')}</label>
                <textarea 
                  value={formData.content} 
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                  className="input-field shadow-sm" 
                  rows={8} 
                  required 
                  placeholder="Digite sua mensagem detalhada aqui..."
                />
              </div>
              
              <div className="flex gap-3.5 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  {actionLoading ? t('saving') : t('send')}
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
    </div>
  )
}
