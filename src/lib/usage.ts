import { prisma } from '@/lib/prisma'

export type UsageEventType =
  | 'call_inbound_started'
  | 'call_inbound_completed'
  | 'call_outbound_started'
  | 'call_outbound_completed'

export async function logUsageEvent(params: {
  organizationId: string
  type: UsageEventType | string
  units?: number
}) {
  const { organizationId, type, units = 1 } = params

  await prisma.usageEvent.create({
    data: {
      organizationId,
      type,
      units,
    },
  })
}
