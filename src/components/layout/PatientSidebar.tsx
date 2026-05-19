'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LayoutDashboard, Lightbulb, Target, BookOpen, File, Video, FileText, Mail, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function PatientSidebar() {
  const t = useTranslations('patient')
  const c = useTranslations('common')
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/dashboard/tips', icon: Lightbulb, label: t('tips') },
    { href: '/dashboard/plans', icon: Target, label: t('plans') },
    { href: '/dashboard/protocols', icon: BookOpen, label: t('protocols') },
    { href: '/dashboard/files', icon: File, label: t('files') },
    { href: '/dashboard/appointments', icon: Video, label: t('appointments') },
    { href: '/dashboard/info', icon: FileText, label: t('info') },
    { href: '/dashboard/messages', icon: Mail, label: t('messages') },
  ]

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-bold text-primary-700">{c('patient')}</h2>
        <button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-500"><X size={20} /></button>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className={isActive ? 'admin-sidebar-link-active' : 'admin-sidebar-link'}>
              <link.icon size={20} /><span>{link.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors">
          <LogOut size={20} /><span>{c('logout')}</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white text-gray-700 rounded-lg shadow-lg border">
        <Menu size={24} />
      </button>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-64 bg-white border-r flex flex-col"><SidebarContent /></div>
        </div>
      )}
      <aside className="w-64 bg-white border-r min-h-screen hidden md:flex flex-col"><SidebarContent /></aside>
    </>
  )
}
