import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8">{children}</main>
    </div>
  )
}
