'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Search, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Patient {
  id: string
  name: string
  email: string
  createdAt: string
}

const PER_PAGE = 10

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    const res = await fetch('/api/patients')
    const data = await res.json()
    setPatients(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editingId ? 'PATCH' : 'POST'
    const url = editingId ? `/api/patients/${editingId}` : '/api/patients'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    setShowModal(false)
    setEditingId(null)
    setFormData({ name: '', email: '', password: '' })
    fetchPatients()
  }

  const handleEdit = (patient: Patient) => {
    setEditingId(patient.id)
    setFormData({ name: patient.name, email: patient.email, password: '' })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return
    await fetch(`/api/patients/${id}`, { method: 'DELETE' })
    fetchPatients()
  }

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  if (loading) return <p className="text-center py-12">Carregando...</p>

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
        <button onClick={() => { setEditingId(null); setFormData({ name: '', email: '', password: '' }); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Adicionar Paciente
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          className="input-field pl-10"
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Nome</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Criado em</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((patient) => (
              <tr key={patient.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{patient.name}</td>
                <td className="py-3 px-4 text-gray-600">{patient.email}</td>
                <td className="py-3 px-4 text-gray-500">{new Date(patient.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/patients/${patient.id}`} className="p-2 text-green-600 hover:bg-green-50 rounded"><Eye size={16} /></Link>
                    <button onClick={() => handleEdit(patient)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(patient.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginated.length === 0 && <p className="text-center py-8 text-gray-500">Nenhum paciente encontrado</p>}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {currentPage > 1 && (
            <button onClick={() => setCurrentPage(currentPage - 1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-4 py-2 rounded-lg ${p === currentPage ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'}`}
            >
              {p}
            </button>
          ))}
          {currentPage < totalPages && (
            <button onClick={() => setCurrentPage(currentPage + 1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingId ? 'Editar Paciente' : 'Novo Paciente'}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha {!editingId && '(obrigatório)'}</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field" required={!editingId} />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">{editingId ? 'Salvar' : 'Criar'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
