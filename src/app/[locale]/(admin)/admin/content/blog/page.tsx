'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Search, X, Eye, Loader2, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

interface BlogPost {
  id: string
  title: string
  slug: string
  status: string
  publishedAt: string | null
  createdAt: string
}

export default function BlogAdminPage() {
  const t = useTranslations('admin')
  const c = useTranslations('common')
  const locale = useLocale()

  const [posts, setPosts] = useState<BlogPost[]>([])
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
    excerpt: '',
    content: '',
    coverImage: '',
    status: 'DRAFT',
    seoTitle: '',
    seoDesc: '',
  })
  
  const [initialData, setInitialData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    status: 'DRAFT',
    seoTitle: '',
    seoDesc: '',
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog')
      const data = await res.json()
      setPosts(data)
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
      excerpt: '',
      content: '',
      coverImage: '',
      status: 'DRAFT',
      seoTitle: '',
      seoDesc: '',
    }
    setFormData(reset)
    setInitialData(reset)
  }

  const handleEdit = async (post: BlogPost) => {
    setEditingId(post.id)
    setShowModal(true)
    setModalLoading(true)
    
    try {
      const res = await fetch(`/api/blog/${post.id}`)
      if (res.ok) {
        const fullPost = await res.json()
        const editState = {
          title: fullPost.title || '',
          slug: fullPost.slug || '',
          excerpt: fullPost.excerpt || '',
          content: fullPost.content || '',
          coverImage: fullPost.coverImage || '',
          status: fullPost.status || 'DRAFT',
          seoTitle: fullPost.seoTitle || '',
          seoDesc: fullPost.seoDesc || '',
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
    const url = editingId ? `/api/blog/${editingId}` : '/api/blog'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug || generateSlug(formData.title),
        }),
      })

      if (res.ok) {
        setShowModal(false)
        setEditingId(null)
        const reset = {
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          coverImage: '',
          status: 'DRAFT',
          seoTitle: '',
          seoDesc: '',
        }
        setFormData(reset)
        setInitialData(reset)
        fetchPosts()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const confirmDelete = async (id: string) => {
    if (!confirm(t('confirmDeletePost'))) return
    try {
      await fetch(`/api/blog/${id}`, { method: 'DELETE' })
      fetchPosts()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = posts.filter((p) => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">{t('blogPosts')}</h1>
          <p className="text-sm text-slate-500 font-medium">Publique e edite conteúdos sobre medicina integrativa.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            const reset = {
              title: '',
              slug: '',
              excerpt: '',
              content: '',
              coverImage: '',
              status: 'DRAFT',
              seoTitle: '',
              seoDesc: '',
            }
            setFormData(reset)
            setInitialData(reset)
            setShowModal(true)
          }}
          className="btn-primary flex items-center gap-2 shadow-md shadow-primary-600/10 hover:shadow-lg transition-all"
        >
          <Plus size={18} /> {t('newPost')}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={t('searchPosts')}
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
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">{t('status')}</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">{t('published')}</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-900 text-sm line-clamp-1">{post.title}</p>
                    <p className="text-xs text-slate-400 font-medium">/{post.slug}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        post.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : post.status === 'ARCHIVED'
                          ? 'bg-slate-50 text-slate-700 border-slate-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}
                    >
                      {post.status === 'PUBLISHED'
                        ? t('published')
                        : post.status === 'ARCHIVED'
                        ? t('archived')
                        : t('draft')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-500 text-sm">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2.5">
                      {post.status === 'PUBLISHED' && (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                          title={c('view')}
                        >
                          <Eye size={16} />
                        </Link>
                      )}
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-2 text-secondary-700 hover:bg-secondary-50 rounded-xl transition-all"
                        title={c('edit')}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(post.id)}
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
            <FileText className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-slate-500 text-sm font-medium">{t('noPostsFound')}</p>
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
                {editingId ? t('editPost') : t('newPost')}
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                      className="input-field"
                      placeholder="gerado-automaticamente"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('excerpt')}</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="input-field"
                    rows={2}
                    placeholder="Breve resumo que aparece nas listagens..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('content')} (HTML)</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input-field font-mono text-sm"
                    rows={8}
                    required
                    placeholder="<p>Escreva o conteúdo aqui usando tags HTML...</p>"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('coverImage')}</label>
                  <input
                    type="url"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="input-field"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('seoTitle')}</label>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      className="input-field"
                      placeholder="Título otimizado para o Google"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('seoDescription')}</label>
                    <input
                      type="text"
                      value={formData.seoDesc}
                      onChange={(e) => setFormData({ ...formData, seoDesc: e.target.value })}
                      className="input-field"
                      placeholder="Descrição resumida para busca"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field bg-white"
                  >
                    <option value="DRAFT">{t('draft')}</option>
                    <option value="PUBLISHED">{t('published')}</option>
                    <option value="ARCHIVED">{t('archived')}</option>
                  </select>
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
