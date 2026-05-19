export const dynamic = 'force-dynamic'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Lightbulb, Calendar } from 'lucide-react'

export default async function TipsPage() {
  const t = await getTranslations('patient')
  const session = await getSession()
  if (!session) redirect('/login')

  const userId = session.id

  const tips = await prisma.tip.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('tips')}</h1>
      {tips.length === 0 ? (
        <div className="card text-center py-12">
          <Lightbulb size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">{t('noTips')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {tips.map((tip) => (
            <div key={tip.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{tip.title}</h2>
                  <p className="text-gray-600 whitespace-pre-wrap">{tip.content}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-4">
                <Calendar size={14} className="mr-1" />
                {new Date(tip.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
