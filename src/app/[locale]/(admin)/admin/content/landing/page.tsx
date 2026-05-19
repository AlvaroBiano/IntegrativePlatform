'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Edit2, Save, X } from 'lucide-react'

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
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Section>>({})

  useEffect(() => { fetchSections() }, [])

  const fetchSections = async () => {
    const res = await fetch('/api/landing')
    const data = await res.json()
    setSections(data)
    setLoading(false)
  }

  const handleSave = async () => {
    if (!editingId) return
    await fetch(`/api/landing/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    })
    setEditingId(null)
    setEditData({})
    fetchSections()
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/landing/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    fetchSections()
  }

  if (loading) return <p className="text-center py-12">Carregando...</p>

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Landing Page</h1>
      <p className="text-gray-600 mb-8">Edite as seções da página inicial. As alterações são refletidas imediatamente.</p>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className={`card ${!section.isActive ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold capitalize">{section.key}</h2>
                <span className="text-sm text-gray-500">Ordem: {section.order}</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleToggleActive(section.id, section.isActive)} className={`px-3 py-1 rounded text-sm ${section.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {section.isActive ? 'Ativo' : 'Inativo'}
                </button>
                {editingId === section.id ? (
                  <>
                    <button onClick={handleSave} className="p-2 text-green-600 hover:bg-green-50 rounded"><Save size={18} /></button>
                    <button onClick={() => { setEditingId(null); setEditData({}) }} className="p-2 text-gray-600 hover:bg-gray-100 rounded"><X size={18} /></button>
                  </>
                ) : (
                  <button onClick={() => { setEditingId(section.id); setEditData({}) }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={18} /></button>
                )}
              </div>
            </div>

            {editingId === section.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input type="text" value={editData.title ?? section.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                  <input type="text" value={editData.subtitle ?? section.subtitle ?? ''} onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                  <textarea value={editData.content ?? section.content ?? ''} onChange={(e) => setEditData({ ...editData, content: e.target.value })} className="input-field" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                    <input type="url" value={editData.imageUrl ?? section.imageUrl ?? ''} onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                    <input type="number" value={editData.order ?? section.order} onChange={(e) => setEditData({ ...editData, order: parseInt(e.target.value) })} className="input-field" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Botão</label>
                    <input type="text" value={editData.buttonText ?? section.buttonText ?? ''} onChange={(e) => setEditData({ ...editData, buttonText: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL do Botão</label>
                    <input type="url" value={editData.buttonUrl ?? section.buttonUrl ?? ''} onChange={(e) => setEditData({ ...editData, buttonUrl: e.target.value })} className="input-field" />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-medium mb-2">{section.title}</h3>
                {section.subtitle && <p className="text-primary-600 mb-2">{section.subtitle}</p>}
                {section.content && <p className="text-gray-600">{section.content}</p>}
                {section.imageUrl && <p className="text-sm text-gray-400 mt-2">Imagem: {section.imageUrl}</p>}
                {section.buttonText && <p className="text-sm text-gray-400 mt-1">Botão: {section.buttonText} → {section.buttonUrl}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
