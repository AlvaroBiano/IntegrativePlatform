'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { BookOpen, Calendar, CheckCircle, XCircle } from 'lucide-react'

interface Protocol { id: string; title: string; description: string | null; content: string; startDate: string; endDate: string | null; isActive: boolean; createdAt: string }

export default function ProtocolsPage() {
  const t = useTranslations('patient')
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    fetch('/api/auth/session').then((r) => r.json()).then((data) => {
      if (data.user) { setUserId(data.user.id); fetch('/api/patients/' + data.user.id + '/protocols').then((r) => r.json()).then(setProtocols).finally(() => setLoading(false)) }
    })
  }, [])

  if (loading) return <p className="text-center py-12">{t('loading')}</p>

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('protocols')}</h1>
      {protocols.length === 0 ? (
        <div className="card text-center py-12"><BookOpen size={48} className="mx-auto text-gray-400 mb-4" /><p className="text-gray-500">{t('noProtocols')}</p></div>
      ) : (
        <div className="space-y-6">
          {protocols.map((protocol) => (
            <div key={protocol.id} className="card">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xl font-semibold">{protocol.title}</h2>
                {protocol.isActive ? <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded"><CheckCircle size={14} /> {t('active')}</span> : <span className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded"><XCircle size={14} /> {t('inactive')}</span>}
              </div>
              {protocol.description && <p className="text-gray-600 mb-4">{protocol.description}</p>}
              <div className="prose prose-sm max-w-none mb-4 whitespace-pre-wrap">{protocol.content}</div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Calendar size={14} />{t('start')}: {new Date(protocol.startDate).toLocaleDateString()}</span>
                {protocol.endDate && <span className="flex items-center gap-1"><Calendar size={14} />{t('end')}: {new Date(protocol.endDate).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
