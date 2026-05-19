'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Search, X, Eye } from 'lucide-react'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  slug: string
  status: string
  publishedAt: string | null
  createdAt: string
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '', slug: '', excerpt: '', content: '', coverImage: '', status: 'DRAFT' as string, seoTitle: '', seoDesc: '',
  })

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    const res = await fetch('/api/blog')
    const data = await res.json()
    setPosts(data)
    setLoading(false)
  }

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editingId ? 'PATCH' : 'POST'
    const url = editingId ? `/api/blog/${editingId}` : '/api/blog'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, slug: formData.slug || generateSlug(formData.title) }),
    })

    setShowModal(false)
    setEditingId(null)
    setFormData({ title: '', slug: '', excerpt: '', content: '', coverImage: '', status: 'DRAFT', seoTitle: '', seoDesc: '' })
    fetchPosts()
  }

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id)
    setFormData({ title: post.title, slug: post.slug, excerpt: '', content: '', coverImage: '', status: post.status, seoTitle: '', seoDesc: '' })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este post?')) return
    await fetch(`/api/blog/${id}`, { method: 'DELETE' })
    fetchPosts()
  }

  const filtered = posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <p className="text-center py-12">Carregando...</p>

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Posts do Blog</h1>
        <button onClick={() => { setEditingId(null); setFormData({ title: '', slug: '', excerpt: '', content: '', coverImage: '', status: 'DRAFT', seoTitle: '', seoDesc: '' }); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Post
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" placeholder="Buscar posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Título</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Publicado em</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((post) => (
              <tr key={post.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{post.title}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 rounded ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : post.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {post.status === 'PUBLISHED' ? 'Publicado' : post.status === 'ARCHIVED' ? 'Arquivado' : 'Rascunho'}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('pt-BR') : '-'}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    {post.status === 'PUBLISHED' && (
                      <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 text-gray-600 hover:bg-gray-100 rounded"><Eye size={16} /></Link>
                    )}
                    <button onClick={() => handleEdit(post)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(post.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-gray-500">Nenhum post encontrado</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingId ? 'Editar Post' : 'Novo Post'}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: formData.slug || generateSlug(e.target.value) })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="input-field" placeholder="gerado-automaticamente" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resumo</label>
                <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} className="input-field" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo (HTML)</label>
                <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="input-field" rows={8} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem de Capa</label>
                <input type="url" value={formData.coverImage} onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                  <input type="text" value={formData.seoTitle} onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                  <input type="text" value={formData.seoDesc} onChange={(e) => setFormData({ ...formData, seoDesc: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input-field">
                  <option value="DRAFT">Rascunho</option>
                  <option value="PUBLISHED">Publicado</option>
                  <option value="ARCHIVED">Arquivado</option>
                </select>
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
