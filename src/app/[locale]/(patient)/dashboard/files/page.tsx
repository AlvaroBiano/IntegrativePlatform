'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { File, ExternalLink, Calendar } from 'lucide-react'

interface PatientFile { id: string; title: string; description: string | null; fileUrl: string; fileName: string; fileSize: number | null; mimeType: string | null; createdAt: string }

export default function FilesPage() {
  const t = useTranslations('patient')
  const [files, setFiles] = useState<PatientFile[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    fetch('/api/auth/session').then((r) => r.json()).then((data) => {
      if (data.user) { setUserId(data.user.id); fetch('/api/patients/' + data.user.id + '/files').then((r) => r.json()).then(setFiles).finally(() => setLoading(false)) }
    })
  }, [])

  if (loading) return <p className="text-center py-12">{t('loading')}</p>

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('files')}</h1>
      {files.length === 0 ? (
        <div className="card text-center py-12"><File size={48} className="mx-auto text-gray-400 mb-4" /><p className="text-gray-500">{t('noFiles')}</p></div>
      ) : (
        <div className="space-y-4">
          {files.map((file) => (
            <div key={file.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg"><File className="text-blue-600" size={24} /></div>
                  <div>
                    <h2 className="text-lg font-semibold">{file.title}</h2>
                    {file.description && <p className="text-gray-600 mt-1">{file.description}</p>}
                    <p className="text-sm text-gray-400 mt-2">{file.fileName}{file.fileSize ? ` (${(file.fileSize / 1024 / 1024).toFixed(1)} MB)` : ''}</p>
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1"><Calendar size={14} />{new Date(file.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2 text-sm"><ExternalLink size={16} />{t('open')}</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
