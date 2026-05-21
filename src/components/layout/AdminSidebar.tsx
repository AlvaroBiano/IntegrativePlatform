'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import {
  LayoutDashboard, Users, FileText, BookOpen, Monitor, Mail, Settings, LogOut, ChevronDown, ChevronRight, Menu, X, Ticket, Globe,
} from 'lucide-react'
import { useState } from 'react'

export default function AdminSidebar() {
  const t = useTranslations('admin')
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = useLocale()
  const [contentOpen, setContentOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const locales = [
    { code: 'pt-BR', label: 'Português', flag: '🇧🇷', short: 'PT' },
    { code: 'en-US', label: 'English', flag: '🇺🇸', short: 'EN' },
    { code: 'fr', label: 'Français', flag: '🇫🇷', short: 'FR' },
    { code: 'es', label: 'Español', flag: '🇪🇸', short: 'ES' },
  ]

  const handleLocaleChange = (targetLocale: string) => {
    const segments = pathname.split('/')
    const localesList = ['pt-BR', 'en-US', 'fr', 'es']
    
    if (localesList.includes(segments[1])) {
      segments[1] = targetLocale
    } else {
      segments.splice(1, 0, targetLocale)
    }
    
    const newPathname = segments.join('/')
    router.push(newPathname)
    setLangOpen(false)
    setMobileOpen(false)
  }

  const links = [
    { href: '/admin', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/admin/patients', icon: Users, label: t('patients') },
    { href: '/admin/invites', icon: Ticket, label: t('invites') },
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
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-xl shadow-slate-100/40 text-slate-800">
      <div className="p-6 border-b border-slate-100/80 flex items-center justify-between">
        <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-md shadow-primary-600/10">
            <span className="font-heading font-black text-lg">I</span>
          </div>
          <div>
            <h2 className="font-heading font-bold text-base leading-none text-slate-900">Integrative</h2>
            <p className="text-[10px] tracking-wider text-slate-500 uppercase font-semibold mt-0.5">Admin Area</p>
          </div>
        </Link>
        <button onClick={() => setMobileOpen(false)} className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"><X size={18} /></button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.endsWith(link.href)
          return (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className={isActive ? 'admin-sidebar-link-active' : 'admin-sidebar-link'}>
              <link.icon size={20} className={isActive ? 'text-primary-800' : 'text-slate-500'} />
              <span>{link.label}</span>
            </Link>
          )
        })}

        <div>
          <button onClick={() => setContentOpen(!contentOpen)} className="admin-sidebar-link w-full justify-between">
            <span className="flex items-center gap-3.5">
              <Monitor size={20} className="text-slate-500" />
              <span>{t('content')}</span>
            </span>
            {contentOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
          </button>
          
          {contentOpen && (
            <div className="ml-7 pl-4 border-l border-slate-100 mt-1 space-y-1.5 py-1">
              {contentLinks.map((link) => {
                const isActive = pathname === link.href || pathname.endsWith(link.href)
                return (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-sm transition-all duration-200 font-medium ${isActive ? 'bg-primary-50 text-primary-900 font-bold' : 'text-slate-500 hover:text-primary-800 hover:bg-primary-50/30'}`}>
                    {link.label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {bottomLinks.map((link) => {
          const isActive = pathname === link.href || pathname.endsWith(link.href)
          return (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className={isActive ? 'admin-sidebar-link-active' : 'admin-sidebar-link'}>
              <link.icon size={20} className={isActive ? 'text-primary-800' : 'text-slate-500'} />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Language Switcher & Logout */}
      <div className="p-4 border-t border-slate-100/80 space-y-2.5">
        {/* Language dropdown */}
        <div className="relative">
          <button onClick={() => setLangOpen(!langOpen)} className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 transition-all text-slate-700 text-sm font-medium">
            <span className="flex items-center gap-2.5">
              <Globe size={16} className="text-slate-400" />
              <span>{locales.find(l => l.code === currentLocale)?.label || 'Language'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-base leading-none">{locales.find(l => l.code === currentLocale)?.flag}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </span>
          </button>
          
          {langOpen && (
            <div className="absolute bottom-full right-0 left-0 mb-2 bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 py-1.5 z-50 animate-drop-in origin-bottom">
              {locales.map((loc) => (
                <button
                  key={loc.code}
                  onClick={() => handleLocaleChange(loc.code)}
                  className={`flex items-center justify-between w-full px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${loc.code === currentLocale ? 'font-bold text-primary-900 bg-primary-50/30' : 'text-slate-600'}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{loc.flag}</span>
                    <span>{loc.label}</span>
                  </span>
                  <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md font-semibold">{loc.short}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-rose-600 hover:bg-rose-50/80 transition-all font-medium active:scale-98">
          <LogOut size={20} className="text-rose-500" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/90 backdrop-blur-md text-slate-700 rounded-xl shadow-md border border-slate-100 active:scale-95 transition-all">
        <Menu size={22} />
      </button>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-64 animate-drop-in"><SidebarContent /></div>
        </div>
      )}
      <aside className="w-64 min-h-screen hidden md:flex flex-col flex-shrink-0"><SidebarContent /></aside>
    </>
  )
}
