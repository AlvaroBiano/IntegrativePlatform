'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { File, ExternalLink, Calendar, Loader2 } from 'lucide-react'

interface PatientFile {
  id: string
  title: string
  description: string | null
  fileUrl: string
  fileName: string
  fileSize: number | null
  mimeType: string | null
  createdAt: string
}

export default function FilesPage() {
  const t = useTranslations('patient')
  const c = useTranslations('common')
  const locale = useLocale()

  const [files, setFiles] = useState<PatientFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          fetch(`/api/patients/${data.user.id}/files`)
            .then((r) => r.json())
            .then(setFiles)
            .finally(() => setLoading(false))
        }
      })
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-primary-600" size={36} />
        <p className="text-slate-500 font-semibold text-sm">{c('loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-0.5">
        <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">{t('files')}</h1>
        <p className="text-sm text-slate-500 font-medium">Acesse exames, prescrições de receitas e documentos de suporte clínico.</p>
      </div>

      {files.length === 0 ? (
        <div className="glass-card border border-slate-100/50 text-center py-16 px-6 shadow-xl shadow-slate-100/10">
          <File size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-sm font-semibold">{t('noFiles')}</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {files.map((file) => (
            <div
              key={file.id}
              className="glass-card border border-slate-100/50 p-6 shadow-xl shadow-slate-100/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-primary-100 hover:bg-white/95 transition-all"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-2xl shrink-0">
                  <File size={22} />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h2 className="text-lg font-bold font-heading text-slate-900 truncate">{file.title}</h2>
                  {file.description && (
                    <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">{file.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-semibold uppercase tracking-wider pt-1">
                    <span className="truncate max-w-[200px] lowercase font-normal text-slate-500">
                      {file.fileName}
                      {file.fileSize ? ` (${(file.fileSize / 1024 / 1024).toFixed(1)} MB)` : ''}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-400">
                      <Calendar size={13} />
                      {new Date(file.createdAt).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              <a
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm shadow-md shadow-primary-600/10 hover:shadow-lg transition-all w-full md:w-auto justify-center"
              >
                <ExternalLink size={16} />
                {t('open')}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
