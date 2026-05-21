'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Edit2, Save, X, Loader2, Sparkles } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

interface Section {
  id: string
  key: string
  title: string
  subtitle: string | null
  content: string | null
  imageUrl: string | null
  buttonText: string | null
  buttonUrl: string | null
  order: number
  isActive: boolean
}

export default function LandingAdminPage() {
  const t = useTranslations('admin')
  const c = useTranslations('common')
  const locale = useLocale()

  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Loading states
  const [actionLoading, setActionLoading] = useState(false)
  const [editData, setEditData] = useState<Partial<Section>>({})

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/landing')
      const data = await res.json()
      // Order sections by order property
      const sorted = data.sort((a: Section, b: Section) => a.order - b.order)
      setSections(sorted)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (sectionId: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/landing/${sectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (res.ok) {
        setEditingId(null)
        setEditData({})
        fetchSections()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/landing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      fetchSections()
    } catch (err) {
      console.error(err)
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-0.5">
        <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">{t('landingPage')}</h1>
        <p className="text-sm text-slate-500 font-medium">{t('landingSubtitle')}</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => {
          const isEditing = editingId === section.id
          return (
            <div
              key={section.id}
              className={`glass-card border border-slate-100/50 p-6 shadow-xl shadow-slate-100/20 transition-all ${
                !section.isActive ? 'opacity-60 bg-slate-50/50' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold font-heading text-slate-900 capitalize flex items-center gap-2">
                    <Sparkles size={16} className="text-primary-500" />
                    {section.key}
                  </h2>
                  <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border bg-slate-50 text-slate-600 border-slate-100">
                    {t('order')}: {section.order}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => handleToggleActive(section.id, section.isActive)}
                    className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      section.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/75'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/50'
                    }`}
                  >
                    {section.isActive ? c('active') : c('inactive')}
                  </button>
                  
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSave(section.id)}
                        disabled={actionLoading}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        title={c('save')}
                      >
                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={18} />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditData({})
                        }}
                        disabled={actionLoading}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        title={c('cancel')}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(section.id)
                        setEditData({
                          title: section.title,
                          subtitle: section.subtitle || '',
                          content: section.content || '',
                          imageUrl: section.imageUrl || '',
                          order: section.order,
                          buttonText: section.buttonText || '',
                          buttonUrl: section.buttonUrl || '',
                        })
                      }}
                      className="p-2 text-secondary-700 hover:bg-secondary-50 rounded-xl transition-all"
                      title={c('edit')}
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        {t('title')}
                      </label>
                      <input
                        type="text"
                        value={editData.title ?? ''}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Subtítulo
                      </label>
                      <input
                        type="text"
                        value={editData.subtitle ?? ''}
                        onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      {t('content')}
                    </label>
                    <textarea
                      value={editData.content ?? ''}
                      onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                      className="input-field"
                      rows={3}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        {t('imageUrl')}
                      </label>
                      <input
                        type="url"
                        value={editData.imageUrl ?? ''}
                        onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
                        className="input-field"
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        {t('order')}
                      </label>
                      <input
                        type="number"
                        value={editData.order ?? 0}
                        onChange={(e) => setEditData({ ...editData, order: parseInt(e.target.value) || 0 })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        {t('buttonText')}
                      </label>
                      <input
                        type="text"
                        value={editData.buttonText ?? ''}
                        onChange={(e) => setEditData({ ...editData, buttonText: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        {t('buttonUrl')}
                      </label>
                      <input
                        type="url"
                        value={editData.buttonUrl ?? ''}
                        onChange={(e) => setEditData({ ...editData, buttonUrl: e.target.value })}
                        className="input-field"
                        placeholder="https://exemplo.com"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold font-heading text-slate-900 leading-snug">{section.title}</h3>
                  {section.subtitle && (
                    <p className="text-sm font-semibold text-primary-700 tracking-wide">{section.subtitle}</p>
                  )}
                  {section.content && (
                    <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-3xl">{section.content}</p>
                  )}
                  
                  {(section.imageUrl || section.buttonText) && (
                    <div className="grid sm:grid-cols-2 gap-4 pt-4 mt-2 border-t border-slate-100 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      {section.imageUrl && (
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 font-bold">{t('imageUrl')}</p>
                          <p className="text-slate-600 font-medium lowercase truncate">{section.imageUrl}</p>
                        </div>
                      )}
                      {section.buttonText && (
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 font-bold">{t('buttonText')}</p>
                          <p className="text-slate-600 font-medium">
                            {section.buttonText} <span className="lowercase font-normal text-slate-400">({section.buttonUrl})</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
