import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { getOrganizationIdFromRequest } from '@/lib/tenant'

function startOfCurrentBillingPeriod(): Date {
  const now = new Date()
  // Simple monthly period: from the 1st of the current month at 00:00
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
}

function getDefaultCallLimitForPlan(plan: string): number | null {
  const upper = plan.toUpperCase()
  if (upper === 'FREE') return 50
  if (upper === 'PRO') return 1000
  if (upper === 'ENTERPRISE') return null // unlimited
  return null
}

export async function GET(request: NextRequest) {
  try {
    let organizationId: string
    try {
      organizationId = getOrganizationIdFromRequest(request)
    } catch {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    const organization = await prisma.organization.findUnique({ where: { id: organizationId } })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const periodStart = startOfCurrentBillingPeriod()

    const aggregation = await prisma.usageEvent.aggregate({
      _sum: { units: true },
      where: {
        organizationId,
        createdAt: {
          gte: periodStart,
        },
      },
    })

    const usedUnits = aggregation._sum.units ?? 0
    const planLimit = organization.monthlyCallLimit ?? getDefaultCallLimitForPlan(organization.plan)

    const limit = planLimit ?? null
    const remaining = limit != null ? Math.max(limit - usedUnits, 0) : null

    return NextResponse.json({
      organizationId,
      plan: organization.plan.toLowerCase(),
      periodStart,
      used: usedUnits,
      limit,
      remaining,
    })
  } catch (error) {
    console.error('Error fetching billing usage:', error)
    const message =
      error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error'
    return NextResponse.json({ error: 'Failed to fetch usage', message }, { status: 500 })
  }
}
