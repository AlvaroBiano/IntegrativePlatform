'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Copy, Check, X, Calendar, Mail, User } from 'lucide-react'

interface Invite {
  id: string
  token: string
  email: string | null
  createdAt: string
  usedAt: string | null
  expiresAt: string | null
  isActive: boolean
  usedBy: { id: string; name: string; email: string } | null
}

export default function InvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [expiresInDays, setExpiresInDays] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => { fetchInvites() }, [])

  const fetchInvites = async () => {
    const res = await fetch('/api/invites')
    const data = await res.json()
    setInvites(data)
    setLoading(false)
  }

  const createInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email || null, expiresInDays: expiresInDays ? parseInt(expiresInDays) : null }),
    })
    setShowModal(false)
    setEmail('')
    setExpiresInDays('')
    fetchInvites()
  }

  const revokeInvite = async (id: string) => {
    if (!confirm('Revogar este convite?')) return
    await fetch(`/api/invites/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: false }) })
    fetchInvites()
  }

  const deleteInvite = async (id: string) => {
    if (!confirm('Excluir permanentemente?')) return
    await fetch(`/api/invites/${id}`, { method: 'DELETE' })
    fetchInvites()
  }

  const copyLink = (token: string, id: string) => {
    const url = `${window.location.origin}/register?token=${token}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) return <p className="text-center py-12">Carregando...</p>

  const activeInvites = invites.filter((i) => i.isActive && !i.usedAt)
  const usedInvites = invites.filter((i) => i.usedAt)
  const revokedInvites = invites.filter((i) => !i.isActive && !i.usedAt)

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Convites</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Convite
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="card bg-green-50 border border-green-200">
          <p className="text-3xl font-bold text-green-700">{activeInvites.length}</p>
          <p className="text-green-600">Ativos</p>
        </div>
        <div className="card bg-blue-50 border border-blue-200">
          <p className="text-3xl font-bold text-blue-700">{usedInvites.length}</p>
          <p className="text-blue-600">Utilizados</p>
        </div>
        <div className="card bg-red-50 border border-red-200">
          <p className="text-3xl font-bold text-red-700">{revokedInvites.length}</p>
          <p className="text-red-600">Revogados</p>
        </div>
      </div>

      {activeInvites.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Convites Ativos</h2>
          <div className="grid gap-4">
            {activeInvites.map((invite) => (
              <div key={invite.id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{invite.token.slice(0, 8)}...</code>
                      {invite.email && (
                        <span className="flex items-center gap-1 text-sm text-gray-500"><Mail size={14} />{invite.email}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Calendar size={14} />Criado em {new Date(invite.createdAt).toLocaleDateString('pt-BR')}</span>
                      {invite.expiresAt && <span className="flex items-center gap-1"><Calendar size={14} />Expira em {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyLink(invite.token, invite.id)} className="btn-primary flex items-center gap-1 text-sm">
                      {copiedId === invite.id ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar link</>}
                    </button>
                    <button onClick={() => revokeInvite(invite.id)} className="btn-secondary text-sm">Revogar</button>
                    <button onClick={() => deleteInvite(invite.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {usedInvites.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Convites Utilizados</h2>
          <div className="grid gap-4">
            {usedInvites.map((invite) => (
              <div key={invite.id} className="card opacity-75">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{invite.token.slice(0, 8)}...</code>
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded">Utilizado</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {invite.usedBy && <span className="flex items-center gap-1"><User size={14} />{invite.usedBy.name}</span>}
                      <span>Em {new Date(invite.usedAt!).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteInvite(invite.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Novo Convite</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={createInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail (opcional)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="paciente@email.com" />
                <p className="text-xs text-gray-500 mt-1">Se preenchido, só este e-mail poderá usar o convite.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Validade em dias (opcional)</label>
                <input type="number" value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)} className="input-field" placeholder="7" min="1" />
                <p className="text-xs text-gray-500 mt-1">Deixe vazio para sem expiração.</p>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Criar Convite</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
