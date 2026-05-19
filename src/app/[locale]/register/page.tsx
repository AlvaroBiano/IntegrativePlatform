'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Mail, Lock, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const t = useTranslations('register')
  const c = useTranslations('common')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [inviteValid, setInviteValid] = useState(false)

  useEffect(() => {
    if (token) {
      fetch('/api/invites/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.valid) {
            setInviteValid(true)
            if (data.email) setEmail(data.email)
          } else {
            setError(data.error || c('inviteInvalid'))
          }
        })
        .catch(() => setError(c('error')))
        .finally(() => setValidating(false))
    } else {
      setValidating(false)
    }
  }, [token, c])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    if (password.length < 6) {
      setError(t('passwordMinLength'))
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, inviteToken: token }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || c('error'))
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 3000)
      }
    } catch {
      setError(c('error'))
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto animate-spin text-primary-600 mb-4" />
          <p className="text-gray-600">{c('loading')}</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 px-4">
        <div className="card text-center max-w-md">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('success')}</h1>
          <p className="text-sm text-gray-400">{c('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-700 mb-2">Integrative Platform</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        <div className="card">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg mb-6">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!inviteValid && token && (
            <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg mb-6">
              <p>{c('inviteInvalid')}</p>
            </div>
          )}

          {!token && (
            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mb-6">
              <p>{c('inviteInvalid')}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('name')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-10" placeholder="Seu nome" required disabled={!inviteValid || !token} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="seu@email.com" required disabled={!inviteValid || !token} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10" placeholder={t('passwordMinLength')} required disabled={!inviteValid || !token} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('confirmPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field pl-10" placeholder={t('confirmPassword')} required disabled={!inviteValid || !token} />
              </div>
            </div>

            <button type="submit" disabled={loading || !inviteValid || !token} className="w-full btn-primary py-3 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading && <Loader2 size={20} className="animate-spin" />}
              {t('createAccount')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            <a href="/login" className="text-primary-600 hover:underline font-medium">
              {c('login')}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
