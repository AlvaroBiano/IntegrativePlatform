import { prisma } from '@/lib/prisma'

interface GoogleAdSlotProps {
  placementKey: string
}

export default async function GoogleAdSlot({ placementKey }: GoogleAdSlotProps) {
  const ad = await prisma.adPlacement.findUnique({
    where: { key: placementKey, isActive: true },
  })

  if (!ad) return null

  return (
    <div className="my-8 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
      <p className="text-xs text-gray-400 mb-2">Advertisement</p>
      <div dangerouslySetInnerHTML={{ __html: ad.adCode }} />
    </div>
  )
}
