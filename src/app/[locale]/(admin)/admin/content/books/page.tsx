'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Search, X, Eye, Loader2, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

interface Book {
  id: string
  title: string
  slug: string
  author: string
  price: number | null
  isActive: boolean
  createdAt: string
}

export default function BooksAdminPage() {
  const t = useTranslations('admin')
  const c = useTranslations('common')
  const locale = useLocale()

  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Loading states
  const [actionLoading, setActionLoading] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: '',
    description: '',
    coverImage: '',
    price: '',
    purchaseUrl: '',
    isbn: '',
    pages: '',
    publisher: '',
    publishedYear: '',
    isActive: true,
  })

  const [initialData, setInitialData] = useState({
    title: '',
    slug: '',
    author: '',
    description: '',
    coverImage: '',
    price: '',
    purchaseUrl: '',
    isbn: '',
    pages: '',
    publisher: '',
    publishedYear: '',
    isActive: true,
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books')
      const data = await res.json()
      setBooks(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const handleTitleChange = (val: string) => {
    setFormData(prev => {
      const newSlug = prev.slug === generateSlug(prev.title) || !prev.slug ? generateSlug(val) : prev.slug
      return { ...prev, title: val, slug: newSlug }
    })
  }

  const isFormDirty = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialData)
  }

  const handleCloseModal = () => {
    if (isFormDirty()) {
      if (!confirm(t('confirmUnsavedChanges'))) {
        return
      }
    }
    setShowModal(false)
    setEditingId(null)
    const reset = {
      title: '',
      slug: '',
      author: '',
      description: '',
      coverImage: '',
      price: '',
      purchaseUrl: '',
      isbn: '',
      pages: '',
      publisher: '',
      publishedYear: '',
      isActive: true,
    }
    setFormData(reset)
    setInitialData(reset)
  }

  const handleEdit = async (book: Book) => {
    setEditingId(book.id)
    setShowModal(true)
    setModalLoading(true)

    try {
      const res = await fetch(`/api/books/${book.id}`)
      if (res.ok) {
        const fullBook = await res.json()
        const editState = {
          title: fullBook.title || '',
          slug: fullBook.slug || '',
          author: fullBook.author || '',
          description: fullBook.description || '',
          coverImage: fullBook.coverImage || '',
          price: fullBook.price !== null ? String(fullBook.price) : '',
          purchaseUrl: fullBook.purchaseUrl || '',
          isbn: fullBook.isbn || '',
          pages: fullBook.pages !== null ? String(fullBook.pages) : '',
          publisher: fullBook.publisher || '',
          publishedYear: fullBook.publishedYear !== null ? String(fullBook.publishedYear) : '',
          isActive: fullBook.isActive ?? true,
        }
        setFormData(editState)
        setInitialData(editState)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setModalLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)

    const method = editingId ? 'PATCH' : 'POST'
    const url = editingId ? `/api/books/${editingId}` : '/api/books'

    try {
      const payload = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        price: formData.price ? parseFloat(formData.price) : null,
        pages: formData.pages ? parseInt(formData.pages) : null,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : null,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setShowModal(false)
        setEditingId(null)
        const reset = {
          title: '',
          slug: '',
          author: '',
          description: '',
          coverImage: '',
          price: '',
          purchaseUrl: '',
          isbn: '',
          pages: '',
          publisher: '',
          publishedYear: '',
          isActive: true,
        }
        setFormData(reset)
        setInitialData(reset)
        fetchBooks()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const confirmDelete = async (id: string) => {
    if (!confirm(t('confirmDeleteBook'))) return
    try {
      await fetch(`/api/books/${id}`, { method: 'DELETE' })
      fetchBooks()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  )

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">{t('books')}</h1>
          <p className="text-sm text-slate-500 font-medium">Recomende e organize livros de saúde e bem-estar.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            const reset = {
              title: '',
              slug: '',
              author: '',
              description: '',
              coverImage: '',
              price: '',
              purchaseUrl: '',
              isbn: '',
              pages: '',
              publisher: '',
              publishedYear: '',
              isActive: true,
            }
            setFormData(reset)
            setInitialData(reset)
            setShowModal(true)
          }}
          className="btn-primary flex items-center gap-2 shadow-md shadow-primary-600/10 hover:shadow-lg transition-all"
        >
          <Plus size={18} /> {t('newBook')}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={t('searchBooks')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12 bg-white/70 backdrop-blur-sm border-slate-200 focus:border-primary-500 focus:ring focus:ring-primary-100"
        />
      </div>

      {/* Table Card */}
      <div className="glass-card border border-slate-100/50 overflow-hidden shadow-xl shadow-slate-100/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">{t('title')}</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">{t('author')}</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">{c('price')}</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">{t('status')}</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((book) => (
                <tr key={book.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-900 text-sm line-clamp-1">{book.title}</p>
                    <p className="text-xs text-slate-400 font-medium">/{book.slug}</p>
                  </td>
                  <td className="py-4 px-6 text-slate-600 text-sm font-medium">{book.author}</td>
                  <td className="py-4 px-6 text-slate-900 text-sm font-semibold">
                    {book.price !== null
                      ? locale === 'pt-BR'
                        ? `R$ ${Number(book.price).toFixed(2)}`
                        : `$${Number(book.price).toFixed(2)}`
                      : '-'}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        book.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-slate-50 text-slate-700 border-slate-100'
                      }`}
                    >
                      {book.isActive ? c('active') : c('inactive')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2.5">
                      <Link
                        href={`/bookstore/${book.slug}`}
                        target="_blank"
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        title={c('view')}
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => handleEdit(book)}
                        className="p-2 text-secondary-700 hover:bg-secondary-50 rounded-xl transition-all"
                        title={c('edit')}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(book.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title={c('delete')}
                      >
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
            <BookOpen className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-slate-500 text-sm font-medium">{t('noBooksFound')}</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
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
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold border transition-all ${
                p === currentPage
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/10'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
              }`}
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

      {/* Create / Edit Modal Drawer */}
      {showModal && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl border border-slate-100 animate-drop-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100">
              <h2 className="text-xl font-bold font-heading text-slate-900">
                {editingId ? t('editBook') : t('newBook')}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {modalLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <Loader2 className="animate-spin text-primary-600" size={32} />
                <p className="text-slate-500 text-sm font-medium">{c('loading')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('title')}</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{c('author')}</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                      className="input-field"
                      placeholder="gerado-automaticamente"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('coverImage')}</label>
                    <input
                      type="url"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      className="input-field"
                      required
                      placeholder="https://exemplo.com/capa.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{c('description')} (HTML)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field font-mono text-sm"
                    rows={4}
                    required
                    placeholder="<p>Escreva a sinopse ou descrição detalhada do livro...</p>"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('pricePlaceholder')}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input-field"
                      placeholder="Ex: 49.90"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('purchaseUrl')}</label>
                    <input
                      type="url"
                      value={formData.purchaseUrl}
                      onChange={(e) => setFormData({ ...formData, purchaseUrl: e.target.value })}
                      className="input-field"
                      required
                      placeholder="https://amazon.com/..."
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('isbn')}</label>
                    <input
                      type="text"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      className="input-field"
                      placeholder="Ex: 978-3-16-148410-0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('pages')}</label>
                    <input
                      type="number"
                      value={formData.pages}
                      onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                      className="input-field"
                      placeholder="Ex: 320"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('publisher')}</label>
                    <input
                      type="text"
                      value={formData.publisher}
                      onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('year')}</label>
                    <input
                      type="number"
                      value={formData.publishedYear}
                      onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                      className="input-field"
                      placeholder="Ex: 2024"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 py-1">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">
                    {t('isActive')}
                  </label>
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {actionLoading && <Loader2 size={16} className="animate-spin" />}
                    {actionLoading
                      ? editingId
                        ? t('saving')
                        : t('creating')
                      : editingId
                      ? c('save')
                      : c('create')}
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
            )}
          </div>
        </div>
      )}
    </div>
  )
}
