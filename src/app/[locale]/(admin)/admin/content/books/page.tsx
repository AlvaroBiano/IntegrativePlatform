'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Search, X, Eye } from 'lucide-react'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  slug: string
  author: string
  price: string | null
  isActive: boolean
  createdAt: string
}

export default function BooksAdminPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '', slug: '', author: '', description: '', coverImage: '', price: '', purchaseUrl: '', isbn: '', pages: '', publisher: '', publishedYear: '', isActive: true,
  })

  useEffect(() => { fetchBooks() }, [])

  const fetchBooks = async () => {
    const res = await fetch('/api/books')
    const data = await res.json()
    setBooks(data)
    setLoading(false)
  }

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editingId ? 'PATCH' : 'POST'
    const url = editingId ? `/api/books/${editingId}` : '/api/books'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, slug: formData.slug || generateSlug(formData.title), price: formData.price ? parseFloat(formData.price) : null, pages: formData.pages ? parseInt(formData.pages) : null, publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : null }),
    })

    setShowModal(false)
    setEditingId(null)
    setFormData({ title: '', slug: '', author: '', description: '', coverImage: '', price: '', purchaseUrl: '', isbn: '', pages: '', publisher: '', publishedYear: '', isActive: true })
    fetchBooks()
  }

  const handleEdit = (book: Book) => {
    setEditingId(book.id)
    setFormData({ title: book.title, slug: book.slug, author: book.author, description: '', coverImage: '', price: book.price || '', purchaseUrl: '', isbn: '', pages: '', publisher: '', publishedYear: '', isActive: book.isActive })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este livro?')) return
    await fetch(`/api/books/${id}`, { method: 'DELETE' })
    fetchBooks()
  }

  const filtered = books.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <p className="text-center py-12">Carregando...</p>

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Livraria</h1>
        <button onClick={() => { setEditingId(null); setFormData({ title: '', slug: '', author: '', description: '', coverImage: '', price: '', purchaseUrl: '', isbn: '', pages: '', publisher: '', publishedYear: '', isActive: true }); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Livro
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" placeholder="Buscar por título ou autor..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Título</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Autor</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Preço</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((book) => (
              <tr key={book.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{book.title}</td>
                <td className="py-3 px-4 text-gray-600">{book.author}</td>
                <td className="py-3 px-4">{book.price ? `R$ ${Number(book.price).toFixed(2)}` : '-'}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 rounded ${book.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {book.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/bookstore/${book.slug}`} target="_blank" className="p-2 text-gray-600 hover:bg-gray-100 rounded"><Eye size={16} /></Link>
                    <button onClick={() => handleEdit(book)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(book.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-gray-500">Nenhum livro encontrado</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingId ? 'Editar Livro' : 'Novo Livro'}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: formData.slug || generateSlug(e.target.value) })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                  <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="input-field" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (HTML)</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={4} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Capa</label>
                <input type="url" value={formData.coverImage} onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })} className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link de Compra</label>
                  <input type="url" value={formData.purchaseUrl} onChange={(e) => setFormData({ ...formData, purchaseUrl: e.target.value })} className="input-field" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                  <input type="text" value={formData.isbn} onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Páginas</label>
                  <input type="number" value={formData.pages} onChange={(e) => setFormData({ ...formData, pages: e.target.value })} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Editora</label>
                  <input type="text" value={formData.publisher} onChange={(e) => setFormData({ ...formData, publisher: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                  <input type="number" value={formData.publishedYear} onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })} className="input-field" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Ativo</label>
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
