'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2, Info, Monitor, Globe, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AdPlacement {
  id: string
  key: string
  name: string
  adCode: string
  page: string
  isActive: boolean
}

export default function SettingsPage() {
  const t = useTranslations('admin')
  const c = useTranslations('common')

  const [adPlacements, setAdPlacements] = useState<AdPlacement[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCode, setEditingCode] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/landing/ads')
      .then((r) => r.json())
      .then((data) => {
        setAdPlacements(data || [])
        const codes: Record<string, string> = {}
        if (data) {
          data.forEach((ad: AdPlacement) => { codes[ad.id] = ad.adCode })
        }
        setEditingCode(codes)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const handleSave = async (id: string) => {
    setSaving(id)
    try {
      await fetch(`/api/landing/ads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adCode: editingCode[id] }),
      })
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(null)
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/landing/ads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      setAdPlacements((prev) => 
        prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
      )
    } catch (err) {
      console.error(err)
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
      <div className="pb-4 border-b border-slate-100">
        <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">{t('settings')}</h1>
        <p className="text-sm text-slate-500 font-medium font-sans">Ajuste os parâmetros de marketing e administre os canais de anúncios da plataforma.</p>
      </div>

      {/* Google Ads Config Glass Card */}
      <div className="glass-card border border-slate-200/50">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 shadow-sm">
            <Monitor size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-900">{t('adPlacements')}</h2>
            <p className="text-sm font-medium text-slate-500 mt-1 font-sans">{t('adPlacementsDesc')}</p>
          </div>
        </div>

        <div className="space-y-6">
          {adPlacements.map((ad) => (
            <div key={ad.id} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30 hover:bg-slate-50/60 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="space-y-0.5">
                  <h3 className="font-semibold text-slate-800 text-sm">{ad.name}</h3>
                  <span className="inline-block text-xs font-bold text-slate-400 uppercase tracking-wider">{ad.page}</span>
                </div>
                <div>
                  <button 
                    onClick={() => handleToggle(ad.id, ad.isActive)} 
                    className={`inline-flex items-center text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                      ad.isActive 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700 font-bold' 
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  >
                    {ad.isActive ? t('active') : t('inactive')}
                  </button>
                </div>
              </div>
              
              <textarea
                value={editingCode[ad.id] || ''}
                onChange={(e) => setEditingCode({ ...editingCode, [ad.id]: e.target.value })}
                className="input-field font-mono text-xs leading-relaxed bg-white/70 shadow-inner"
                rows={4}
                placeholder={t('googleAdsCodePlaceholder')}
              />
              
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => handleSave(ad.id)} 
                  disabled={saving === ad.id} 
                  className="btn-primary flex items-center gap-2 text-xs py-2.5 px-4 shadow-sm"
                >
                  {saving === ad.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving === ad.id ? t('saving') : t('save')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Information Glass Card */}
      <div className="glass-card border border-slate-200/50">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-primary-50 text-primary-700 rounded-2xl border border-primary-100 shadow-sm">
            <Info size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-900">{t('systemInfo')}</h2>
            <p className="text-sm font-medium text-slate-500 mt-1 font-sans">Verifique os metadados e parâmetros básicos de infraestrutura da aplicação.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 text-sm">
          <div className="p-4 bg-slate-50/50 border border-slate-100/60 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
              <Globe size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('activeLanguages')}</p>
              <p className="font-semibold text-slate-800 mt-0.5">PT-BR, EN-US, FR, ES</p>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50/50 border border-slate-100/60 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('adminEmail')}</p>
              <p className="font-semibold text-slate-800 mt-0.5">admin@integrative.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
