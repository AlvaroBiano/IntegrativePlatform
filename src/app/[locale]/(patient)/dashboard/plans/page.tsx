export const dynamic = 'force-dynamic'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Target, Calendar, CheckCircle, XCircle } from 'lucide-react'

export default async function PlansPage() {
  const t = await getTranslations('patient')
  const session = await getSession()
  if (!session) redirect('/login')

  const userId = session.id

  const plans = await prisma.plan.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('plans')}</h1>
      {plans.length === 0 ? (
        <div className="card text-center py-12">
          <Target size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">{t('noPlans')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => (
            <div key={plan.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{plan.title}</h2>
                    {plan.isActive ? (
                      <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                        <CheckCircle size={14} /> {t('active')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        <XCircle size={14} /> {t('inactive')}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 whitespace-pre-wrap mb-4">{plan.description}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{t('start')}: {new Date(plan.startDate).toLocaleDateString()}</span>
                    </div>
                    {plan.endDate && (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{t('end')}: {new Date(plan.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
