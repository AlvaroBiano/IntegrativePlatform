import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PatientSidebar from '@/components/layout/PatientSidebar'

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'PATIENT') {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />
      <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8">{children}</main>
    </div>
  )
}
