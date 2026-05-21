'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Copy, Check, X, Calendar, Mail, User, ShieldAlert, AlertTriangle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('admin')
  const c = useTranslations('common')

  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  const [email, setEmail] = useState('')
  const [expiresInDays, setExpiresInDays] = useState('')
  const [initialEmail, setInitialEmail] = useState('')
  const [initialExpiresInDays, setInitialExpiresInDays] = useState('')
  
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Custom Confirmation Modals States
  const [revokeId, setRevokeId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => { 
    fetchInvites() 
  }, [])

  const fetchInvites = async () => {
    try {
      const res = await fetch('/api/invites')
      const data = await res.json()
      setInvites(data || [])
    } catch (err) {
      console.error('Error fetching invites:', err)
    } finally {
      setLoading(false)
    }
  }

  const isFormDirty = () => {
    return email !== initialEmail || expiresInDays !== initialExpiresInDays
  }

  const handleCloseModal = () => {
    if (isFormDirty()) {
      if (!confirm(t('confirmUnsavedChanges'))) {
        return
      }
    }
    setShowModal(false)
    setEmail('')
    setExpiresInDays('')
    setInitialEmail('')
    setInitialExpiresInDays('')
  }

  const handleOpenModal = () => {
    setEmail('')
    setExpiresInDays('')
    setInitialEmail('')
    setInitialExpiresInDays('')
    setShowModal(true)
  }

  const createInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email || null, 
          expiresInDays: expiresInDays ? parseInt(expiresInDays) : null 
        }),
      })
      setShowModal(false)
      setEmail('')
      setExpiresInDays('')
      setInitialEmail('')
      setInitialExpiresInDays('')
      await fetchInvites()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRevokeInvite = async () => {
    if (!revokeId) return
    setActionLoading(true)
    try {
      await fetch(`/api/invites/${revokeId}`, { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ isActive: false }) 
      })
      setRevokeId(null)
      await fetchInvites()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteInvite = async () => {
    if (!deleteId) return
    setActionLoading(true)
    try {
      await fetch(`/api/invites/${deleteId}`, { method: 'DELETE' })
      setDeleteId(null)
      await fetchInvites()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const copyLink = (token: string, id: string) => {
    const url = `${window.location.origin}/register?token=${token}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="animate-spin text-primary-600" size={36} />
        <p className="text-slate-500 font-medium">{t('loading')}</p>
      </div>
    )
  }

  const activeInvites = invites.filter((i) => i.isActive && !i.usedAt)
  const usedInvites = invites.filter((i) => i.usedAt)
  const revokedInvites = invites.filter((i) => !i.isActive && !i.usedAt)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">{t('invites')}</h1>
          <p className="text-sm text-slate-500 font-medium">Crie convites exclusivos e controle as permissões de acesso da plataforma.</p>
        </div>
        <button 
          onClick={handleOpenModal} 
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> 
          {t('createInvite')}
        </button>
      </div>

      {/* Stats Cards grid */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="glass-card flex items-center justify-between p-5 border-l-4 border-l-emerald-500 shadow-sm">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('inviteStatusActive')}</p>
            <p className="text-3xl font-extrabold font-heading text-slate-900 mt-1">{activeInvites.length}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Check size={20} />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between p-5 border-l-4 border-l-primary-500 shadow-sm">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('inviteStatusUsed')}</p>
            <p className="text-3xl font-extrabold font-heading text-slate-900 mt-1">{usedInvites.length}</p>
          </div>
          <div className="p-3 bg-primary-50 text-primary-700 rounded-xl">
            <User size={20} />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between p-5 border-l-4 border-l-rose-400 shadow-sm">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('inviteStatusRevoked')}</p>
            <p className="text-3xl font-extrabold font-heading text-slate-900 mt-1">{revokedInvites.length}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <X size={20} />
          </div>
        </div>
      </div>

      {/* Active Invites List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-slate-800 flex items-center gap-2">
          <span>{t('inviteStatusActive')}</span>
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md font-bold">{activeInvites.length}</span>
        </h2>
        {activeInvites.length === 0 ? (
          <p className="text-slate-400 text-sm font-medium italic py-4 pl-1">{c('noData')}</p>
        ) : (
          <div className="grid gap-4">
            {activeInvites.map((invite) => (
              <div key={invite.id} className="glass-card border border-slate-200/50 hover:border-slate-300/80 transition-all p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <code className="text-xs bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg font-mono font-bold text-slate-700">
                        {invite.token.slice(0, 8)}...
                      </code>
                      {invite.email && (
                        <span className="flex items-center gap-1.5 text-sm text-slate-655 font-semibold bg-primary-50 text-primary-700 border border-primary-100 px-2.5 py-0.5 rounded-lg">
                          <Mail size={13} />
                          {invite.email}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-400">
                      <span className="flex items-center gap-1"><Calendar size={13} /> {t('inviteCreatedAt')}: {new Date(invite.createdAt).toLocaleDateString()}</span>
                      {invite.expiresAt && (
                        <span className="flex items-center gap-1 text-rose-500/80">
                          <Calendar size={13} /> 
                          {t('inviteExpiresAt')}: {new Date(invite.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <button 
                      onClick={() => copyLink(invite.token, invite.id)} 
                      className="btn-primary flex items-center justify-center gap-1.5 text-xs py-2 px-4 shadow-sm"
                    >
                      {copiedId === invite.id ? (
                        <>
                          <Check size={14} /> 
                          {t('copied')}
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> 
                          {t('inviteCopyLink')}
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => setRevokeId(invite.id)} 
                      className="btn-secondary text-xs py-2 px-4"
                    >
                      Revogar
                    </button>
                    <button 
                      onClick={() => setDeleteId(invite.id)} 
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all" 
                      title={t('inviteDelete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Used Invites List */}
      {usedInvites.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-100/85">
          <h2 className="text-xl font-bold font-heading text-slate-800 flex items-center gap-2">
            <span>{t('inviteStatusUsed')}</span>
            <span className="text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-md font-bold">{usedInvites.length}</span>
          </h2>
          <div className="grid gap-4">
            {usedInvites.map((invite) => (
              <div key={invite.id} className="glass-card border border-slate-200/50 p-5 bg-slate-50/50 opacity-90">
                <div className="flex items-center justify-between gap-5">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <code className="text-xs bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg font-mono font-bold text-slate-500">
                        {invite.token.slice(0, 8)}...
                      </code>
                      <span className="text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-md">
                        {t('inviteStatusUsedSingle')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                      {invite.usedBy && (
                        <span className="flex items-center gap-1 text-slate-700 font-bold">
                          <User size={13} />
                          {invite.usedBy.name} ({invite.usedBy.email})
                        </span>
                      )}
                      <span>Em {new Date(invite.usedAt!).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setDeleteId(invite.id)} 
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE INVITE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100 animate-drop-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100">
              <h2 className="text-xl font-bold font-heading text-slate-900">{t('createInvite')}</h2>
              <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={createInvite} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('inviteEmail')}</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="input-field shadow-sm" 
                  placeholder="paciente@email.com" 
                />
                <p className="text-xs text-slate-400 font-medium mt-1.5">Se preenchido, apenas este e-mail poderá registrar-se com este convite.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('inviteExpiration')}</label>
                <input 
                  type="number" 
                  value={expiresInDays} 
                  onChange={(e) => setExpiresInDays(e.target.value)} 
                  className="input-field shadow-sm" 
                  placeholder="7" 
                  min="1" 
                />
                <p className="text-xs text-slate-400 font-medium mt-1.5">Número de dias até expirar. Deixe em branco para expiração ilimitada.</p>
              </div>
              
              <div className="flex gap-3.5 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {actionLoading && <Loader2 className="animate-spin" size={16} />}
                  {actionLoading ? t('saving') : t('createInvite')}
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

      {/* CUSTOM CONFIRM REVOKE MODAL */}
      {revokeId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setRevokeId(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 animate-drop-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900">Revogar Convite</h3>
                <p className="text-sm text-slate-500 mt-1">{t('inviteRevokeConfirm')}</p>
              </div>
            </div>
            
            <div className="flex gap-3.5 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={handleRevokeInvite}
                disabled={actionLoading}
                className="btn-primary bg-amber-600 hover:bg-amber-700 shadow-amber-700/10 hover:shadow-amber-700/20 flex-1 flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 className="animate-spin" size={16} />}
                {actionLoading ? t('saving') : c('confirm')}
              </button>
              <button
                onClick={() => setRevokeId(null)}
                className="btn-secondary flex-1"
              >
                {c('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRM DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 animate-drop-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 animate-bounce">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900">{t('inviteDelete')}</h3>
                <p className="text-sm text-slate-500 mt-1">{t('inviteDeleteConfirm')}</p>
              </div>
            </div>
            
            <div className="flex gap-3.5 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={handleDeleteInvite}
                disabled={actionLoading}
                className="btn-primary bg-rose-600 hover:bg-rose-700 shadow-rose-700/10 hover:shadow-rose-700/20 flex-1 flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 className="animate-spin" size={16} />}
                {actionLoading ? t('deleting') : t('delete')}
              </button>
              <button
                onClick={() => setDeleteId(null)}
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
