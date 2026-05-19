export const dynamic = 'force-dynamic'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { FileText, Tag, Calendar } from 'lucide-react'

export default async function InfoPage() {
  const t = await getTranslations('patient')
  const session = await getSession()
  if (!session) redirect('/login')

  const userId = session.id

  const infos = await prisma.patientInfo.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('info')}</h1>
      {infos.length === 0 ? (
        <div className="card text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">{t('noInfo')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {infos.map((info) => (
            <div key={info.id} className="card">
              <div className="flex items-start gap-3 mb-3">
                <FileText className="text-primary-600 mt-1" size={20} />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{info.title}</h2>
                  {info.category && (
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Tag size={12} />
                      {info.category}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap ml-8">{info.content}</p>
              <div className="flex items-center text-sm text-gray-500 mt-4 ml-8">
                <Calendar size={14} className="mr-1" />
                {new Date(info.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
