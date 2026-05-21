'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Mail, MailOpen, Calendar, X, Loader2, User, Send } from 'lucide-react'

interface Message {
  id: string
  subject: string
  content: string
  isBroadcast: boolean
  readAt: string | null
  createdAt: string
  sender: { name: string }
}

export default function MessagesPage() {
  const t = useTranslations('patient')
  const c = useTranslations('common')
  const locale = useLocale()

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  useEffect(() => {
    fetch('/api/messages')
      .then((res) => res.json())
      .then((data) => {
        setMessages(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const markAsRead = async (id: string) => {
    await fetch(`/api/messages/${id}`, { method: 'PATCH' })
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, readAt: new Date().toISOString() } : m))
    )
  }

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
        <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">{t('messages')}</h1>
        <p className="text-sm text-slate-500 font-medium">Seu canal direto e seguro de comunicação com os profissionais de saúde.</p>
      </div>

      {messages.length === 0 ? (
        <div className="glass-card border border-slate-100/50 text-center py-16 px-6 shadow-xl shadow-slate-100/10">
          <Mail size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-sm font-semibold">{t('noMessages')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => {
            const isUnread = !msg.readAt
            return (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedMessage(msg)
                  if (isUnread) markAsRead(msg.id)
                }}
                className={`glass-card glass-card-hover border border-slate-100/50 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer transition-all ${
                  isUnread
                    ? 'border-l-4 border-l-primary-500 shadow-md shadow-primary-50/20 bg-primary-50/5'
                    : 'opacity-90 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-4 flex-1 w-full">
                  <div className={`p-2.5 rounded-xl border mt-0.5 ${
                    isUnread
                      ? 'bg-primary-50 text-primary-600 border-primary-100'
                      : 'bg-slate-50 text-slate-400 border-slate-150'
                  }`}>
                    {isUnread ? <Mail size={18} className="animate-bounce" /> : <MailOpen size={18} />}
                  </div>
                  
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-base font-bold font-heading text-slate-900 leading-snug truncate ${
                        isUnread ? 'font-extrabold' : ''
                      }`}>{msg.subject}</h3>
                      
                      {isUnread && (
                        <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary-600 text-white shadow-sm">
                          {c('new')}
                        </span>
                      )}
                      {msg.isBroadcast && (
                        <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
                          {t('broadcastMessage') || 'Broadcast'}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <User size={12} className="text-slate-400" />
                      De: <span className="text-slate-700">{msg.sender.name}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-xs text-slate-400 font-semibold gap-1.5 self-end md:self-auto shrink-0 pl-14 md:pl-0">
                  <Calendar size={14} className="text-slate-300" />
                  {new Date(msg.createdAt).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Message Reader Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-white/95 backdrop-blur-md rounded-2xl max-w-2xl w-full border border-slate-100/60 shadow-2xl overflow-hidden p-6 animate-drop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-heading text-slate-900 leading-snug">{selectedMessage.subject}</h2>
                  {selectedMessage.isBroadcast && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
                      {t('broadcastMessage') || 'Broadcast'}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-semibold">
                  <span className="flex items-center gap-1 text-slate-500">
                    <User size={13} className="text-slate-400" />
                    De: <span className="font-bold text-slate-700">{selectedMessage.sender.name}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-slate-300" />
                    {new Date(selectedMessage.createdAt).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-2 rounded-xl transition-all self-start"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="py-6 overflow-y-auto max-h-[50vh] text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
              {selectedMessage.content}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedMessage(null)}
                className="btn-secondary py-2 px-5 text-sm"
              >
                {c('close') || 'Fechar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

