'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard, Users, FileText, BookOpen, Monitor, Mail, Settings, LogOut, ChevronDown, ChevronRight, Menu, X, Ticket,
} from 'lucide-react'
import { useState } from 'react'

export default function AdminSidebar() {
  const t = useTranslations('admin')
  const pathname = usePathname()
  const router = useRouter()
  const [contentOpen, setContentOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/admin', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/admin/patients', icon: Users, label: t('patients') },
    { href: '/admin/invites', icon: Ticket, label: 'Convites' },
  ]

  const contentLinks = [
    { href: '/admin/content/blog', label: t('blogPosts') },
    { href: '/admin/content/books', label: t('books') },
    { href: '/admin/content/landing', label: t('landingPage') },
  ]

  const bottomLinks = [
    { href: '/admin/messages', icon: Mail, label: t('messages') },
    { href: '/admin/settings', icon: Settings, label: t('settings') },
  ]

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-bold">Admin</h2>
        <button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-400"><X size={20} /></button>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
              <link.icon size={20} /><span>{link.label}</span>
            </Link>
          )
        })}
        <div>
          <button onClick={() => setContentOpen(!contentOpen)} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
            <Monitor size={20} /><span>{t('content')}</span>{contentOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {contentOpen && (
            <div className="ml-8 mt-1 space-y-1">
              {contentLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                    {link.label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
        {bottomLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
              <link.icon size={20} /><span>{link.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-gray-800 transition-colors">
          <LogOut size={20} /><span>Logout</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg">
        <Menu size={24} />
      </button>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-64 bg-gray-900 text-white flex flex-col"><SidebarContent /></div>
        </div>
      )}
      <aside className="w-64 bg-gray-900 text-white min-h-screen hidden md:flex flex-col"><SidebarContent /></aside>
    </>
  )
}
