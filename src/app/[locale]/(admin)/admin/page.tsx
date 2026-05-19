export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { Users, FileText, BookOpen, Mail } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [patientsCount, postsCount, booksCount, messagesCount] = await Promise.all([
    prisma.user.count({ where: { role: 'PATIENT' } }),
    prisma.blogPost.count(),
    prisma.book.count({ where: { isActive: true } }),
    prisma.message.count(),
  ])

  const recentPatients = await prisma.user.findMany({
    where: { role: 'PATIENT' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, email: true, createdAt: true },
  })

  const recentPosts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, title: true, status: true, createdAt: true },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/admin/patients" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg"><Users className="text-blue-600" size={24} /></div>
            <div><p className="text-2xl font-bold">{patientsCount}</p><p className="text-gray-600">Pacientes</p></div>
          </div>
        </Link>
        <Link href="/admin/content/blog" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg"><FileText className="text-green-600" size={24} /></div>
            <div><p className="text-2xl font-bold">{postsCount}</p><p className="text-gray-600">Posts</p></div>
          </div>
        </Link>
        <Link href="/admin/content/books" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg"><BookOpen className="text-purple-600" size={24} /></div>
            <div><p className="text-2xl font-bold">{booksCount}</p><p className="text-gray-600">Livros</p></div>
          </div>
        </Link>
        <Link href="/admin/messages" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg"><Mail className="text-orange-600" size={24} /></div>
            <div><p className="text-2xl font-bold">{messagesCount}</p><p className="text-gray-600">Mensagens</p></div>
          </div>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Pacientes Recentes</h2>
          {recentPatients.length === 0 ? (
            <p className="text-gray-500">Nenhum paciente</p>
          ) : (
            <div className="space-y-3">
              {recentPatients.map((p) => (
                <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.email}</p>
                  </div>
                  <span className="text-sm text-gray-400">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Posts Recentes</h2>
          {recentPosts.length === 0 ? (
            <p className="text-gray-500">Nenhum post</p>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{post.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {post.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
