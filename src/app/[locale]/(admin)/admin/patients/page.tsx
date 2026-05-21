'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Search, X, Eye, ChevronLeft, ChevronRight, AlertTriangle, Loader2, Users } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface Patient {
  id: string
  name: string
  email: string
  createdAt: string
}

const PER_PAGE = 10

export default function PatientsPage() {
  const t = useTranslations('admin')
  const c = useTranslations('common')

  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [initialData, setInitialData] = useState({ name: '', email: '', password: '' })
  
  const [actionLoading, setActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    const res = await fetch('/api/patients')
    const data = await res.json()
    setPatients(data)
    setLoading(false)
  }

  const isFormDirty = () => {
    return (
      formData.name !== initialData.name ||
      formData.email !== initialData.email ||
      formData.password !== initialData.password
    )
  }

  const handleCloseModal = () => {
    if (isFormDirty()) {
      if (!confirm(t('confirmUnsavedChanges'))) {
        return
      }
    }
    setShowModal(false)
    setEditingId(null)
    setFormData({ name: '', email: '', password: '' })
    setInitialData({ name: '', email: '', password: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    const method = editingId ? 'PATCH' : 'POST'
    const url = editingId ? `/api/patients/${editingId}` : '/api/patients'

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      setShowModal(false)
      setEditingId(null)
      setFormData({ name: '', email: '', password: '' })
      setInitialData({ name: '', email: '', password: '' })
      await fetchPatients()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = (patient: Patient) => {
    setEditingId(patient.id)
    const editData = { name: patient.name, email: patient.email, password: '' }
    setFormData(editData)
    setInitialData(editData)
    setShowModal(true)
  }

  const confirmDelete = (id: string) => {
    setDeleteId(id)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setActionLoading(true)
    try {
      await fetch(`/api/patients/${deleteId}`, { method: 'DELETE' })
      setDeleteId(null)
      await fetchPatients()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">{t('patients')}</h1>
          <p className="text-sm text-slate-500 font-medium">Cadastre, edite e acompanhe os pacientes sob sua supervisão médica.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            const emptyData = { name: '', email: '', password: '' }
            setFormData(emptyData)
            setInitialData(emptyData)
            setShowModal(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          {t('addPatient')}
        </button>
      </div>

      {/* Search Input bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          className="input-field pl-11 shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="glass-card overflow-hidden p-0 border border-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">{t('name')}</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">{t('email')}</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">{t('createdAt')}</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900 text-sm">{patient.name}</td>
                  <td className="py-4 px-6 text-slate-600 text-sm">{patient.email}</td>
                  <td className="py-4 px-6 text-slate-400 text-sm">
                    {new Date(patient.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2.5">
                      <Link href={`/admin/patients/${patient.id}`} className="p-2 text-primary-700 hover:bg-primary-50 rounded-xl transition-all" title={c('view')}>
                        <Eye size={16} />
                      </Link>
                      <button onClick={() => handleEdit(patient)} className="p-2 text-secondary-700 hover:bg-secondary-50 rounded-xl transition-all" title={c('edit')}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => confirmDelete(patient.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title={c('delete')}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {paginated.length === 0 && (
          <div className="text-center py-16 px-6">
            <Users className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-slate-500 text-sm font-medium">{t('noPatients')}</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold border transition-all ${p === currentPage ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/10' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Create / Edit Patient Modal Drawer */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100 animate-drop-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100">
              <h2 className="text-xl font-bold font-heading text-slate-900">{editingId ? t('editPatient') : t('addPatient')}</h2>
              <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('name')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                  placeholder="Ex: Ana Maria Silva"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                  placeholder="Ex: ana.silva@email.com"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {editingId ? t('passwordOptional') : t('passwordRequired')}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  required={!editingId}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              
              <div className="flex gap-3.5 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {actionLoading && <Loader2 className="animate-spin" size={16} />}
                  {actionLoading ? t('saving') : t('save')}
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

      {/* Elegant Custom Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 animate-drop-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 animate-bounce">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900">{t('confirmDelete')}</h3>
                <p className="text-sm text-slate-500 mt-1">Essa ação é irreversível e excluirá definitivamente o registro do paciente e todo seu histórico.</p>
              </div>
            </div>
            
            <div className="flex gap-3.5 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={handleDelete}
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
