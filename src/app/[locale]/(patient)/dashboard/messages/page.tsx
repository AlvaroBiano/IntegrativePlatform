'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Mail, Calendar, X } from 'lucide-react'

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

  if (loading) return <p className="text-center py-12">{t('loading')}</p>

  if (messages.length === 0) {
    return (
      <div className="card text-center py-12">
        <Mail size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">{t('noMessages')}</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('messages')}</h1>
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`card cursor-pointer hover:shadow-lg transition-shadow ${
              !msg.readAt ? 'border-l-4 border-l-purple-500' : ''
            }`}
            onClick={() => {
              setSelectedMessage(msg)
              if (!msg.readAt) markAsRead(msg.id)
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{msg.subject}</h3>
                  {!msg.readAt && (
                    <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">{c('new')}</span>
                  )}
                  {msg.isBroadcast && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Broadcast</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">De: {msg.sender.name}</p>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar size={14} className="mr-1" />
                {new Date(msg.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMessage(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedMessage.subject}</h2>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">De: {selectedMessage.sender.name}</p>
            <div className="whitespace-pre-wrap text-gray-700">{selectedMessage.content}</div>
          </div>
        </div>
      )}
    </div>
  )
}
