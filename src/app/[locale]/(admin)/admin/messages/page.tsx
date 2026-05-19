'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Send, Users, Mail, X } from 'lucide-react'

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
  const [patients, setPatients] = useState<Patient[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ recipientId: '', subject: '', content: '', isBroadcast: false })

  useEffect(() => {
    Promise.all([
      fetch('/api/patients').then((r) => r.json()),
      fetch('/api/messages').then((r) => r.json()),
    ]).then(([p, m]) => {
      setPatients(p)
      setMessages(m)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    setShowModal(false)
    setFormData({ recipientId: '', subject: '', content: '', isBroadcast: false })
    fetch('/api/messages').then((r) => r.json()).then(setMessages)
  }

  if (loading) return <p className="text-center py-12">Carregando...</p>

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mensagens</h1>
        <div className="flex gap-3">
          <button onClick={() => { setFormData({ recipientId: '', subject: '', content: '', isBroadcast: true }); setShowModal(true) }} className="btn-primary flex items-center gap-2">
            <Users size={18} /> Enviar para Todos
          </button>
          <button onClick={() => { setFormData({ recipientId: patients[0]?.id || '', subject: '', content: '', isBroadcast: false }); setShowModal(true) }} className="btn-secondary flex items-center gap-2">
            <Mail size={18} /> Individual
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Assunto</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Destinatário</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tipo</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Data</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{msg.subject}</td>
                <td className="py-3 px-4 text-gray-600">{msg.isBroadcast ? 'Todos os pacientes' : msg.recipient?.name}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 rounded ${msg.isBroadcast ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {msg.isBroadcast ? 'Em massa' : 'Individual'}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500">{new Date(msg.createdAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {messages.length === 0 && <p className="text-center py-8 text-gray-500">Nenhuma mensagem enviada</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{formData.isBroadcast ? 'Enviar para Todos' : 'Enviar Mensagem'}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!formData.isBroadcast && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
                  <select value={formData.recipientId} onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })} className="input-field" required>
                    <option value="">Selecione um paciente</option>
                    {patients.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.email})</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="input-field" rows={8} required />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2"><Send size={18} /> Enviar</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
