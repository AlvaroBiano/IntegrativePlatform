'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'

interface AdPlacement {
  id: string
  key: string
  name: string
  adCode: string
  page: string
  isActive: boolean
}

export default function SettingsPage() {
  const [adPlacements, setAdPlacements] = useState<AdPlacement[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCode, setEditingCode] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/landing/ads')
      .then((r) => r.json())
      .then((data) => {
        setAdPlacements(data)
        const codes: Record<string, string> = {}
        data.forEach((ad: AdPlacement) => { codes[ad.id] = ad.adCode })
        setEditingCode(codes)
        setLoading(false)
      })
  }, [])

  const handleSave = async (id: string) => {
    setSaving(id)
    await fetch(`/api/landing/ads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adCode: editingCode[id] }),
    })
    setSaving(null)
  }

  const handleToggle = async (id: string, current: boolean) => {
    await fetch(`/api/landing/ads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    setAdPlacements((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)))
  }

  if (loading) return <p className="text-center py-12">Carregando...</p>

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Configurações</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Espaços de Anúncio (Google Ads)</h2>
        <p className="text-gray-600 mb-6">Insira os códigos do Google AdSense para cada posição. Os anúncios aparecem no Blog e na Livraria.</p>

        <div className="space-y-6">
          {adPlacements.map((ad) => (
            <div key={ad.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium">{ad.name}</h3>
                  <span className="text-sm text-gray-500">{ad.page}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleToggle(ad.id, ad.isActive)} className={`px-3 py-1 rounded text-sm ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {ad.isActive ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </div>
              <textarea
                value={editingCode[ad.id] || ''}
                onChange={(e) => setEditingCode({ ...editingCode, [ad.id]: e.target.value })}
                className="input-field font-mono text-sm"
                rows={4}
                placeholder="<!-- Cole o código do Google Ads aqui -->"
              />
              <button onClick={() => handleSave(ad.id)} disabled={saving === ad.id} className="btn-primary mt-3 flex items-center gap-2">
                <Save size={16} />
                {saving === ad.id ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Informações do Sistema</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Admin Email</p>
            <p className="font-medium">admin@integrative.com</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Idiomas Ativos</p>
            <p className="font-medium">PT-BR, EN-US, FR, ES</p>
          </div>
        </div>
      </div>
    </div>
  )
}
