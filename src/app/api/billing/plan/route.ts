import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import {
  attachSubscriptionToOrganization,
  cancelSubscriptionForOrganization,
} from '@/lib/stripe'
import { getOrganizationIdFromRequest } from '@/lib/tenant'
import { OrganizationWithCounts } from '@/lib/types'

const VALID_PLANS = ['FREE', 'PRO', 'ENTERPRISE'] as const

type Plan = (typeof VALID_PLANS)[number]

function isValidPlan(plan: string): plan is Plan {
  return VALID_PLANS.includes(plan as Plan)
}

function getPriceIdForPlan(plan: Plan): string | null {
  if (plan === 'PRO') {
    const price = process.env.STRIPE_PRICE_PRO
    if (!price && process.env.NODE_ENV === 'production') {
      throw new Error('STRIPE_PRICE_PRO is required in production')
    }
    return price || null
  }

  if (plan === 'ENTERPRISE') {
    const price = process.env.STRIPE_PRICE_ENTERPRISE
    if (!price && process.env.NODE_ENV === 'production') {
      throw new Error('STRIPE_PRICE_ENTERPRISE is required in production')
    }
    return price || null
  }

  return null
}

function transformOrganization(org: OrganizationWithCounts) {
  return {
    id: org.id,
    name: org.name,
    domain: org.domain,
    plan: org.plan.toLowerCase(),
    defaultAccent: org.defaultAccent?.toLowerCase().replace(/_/g, '-') ?? null,
    crmProvider: org.crmProvider?.toLowerCase() ?? null,
    emailAlerts: org.emailAlerts,
    smsAlerts: org.smsAlerts,
    webhookUrl: org.webhookUrl,
    brandingPrimaryColor: org.brandingPrimaryColor,
    brandingLogo: org.brandingLogo,
    brandingCompanyName: org.brandingCompanyName,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
    _count: org._count,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetPlan } = body ?? {}
    const organizationId = getOrganizationIdFromRequest(request)

    if (!targetPlan) {
      return NextResponse.json(
        { error: 'targetPlan is required' },
        { status: 400 },
      )
    }

    const normalizedPlan = String(targetPlan).toUpperCase()

    if (!isValidPlan(normalizedPlan)) {
      return NextResponse.json({ error: 'Invalid target plan' }, { status: 400 })
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        _count: {
          select: {
            users: true,
            voiceAgents: true,
            conversations: true,
          },
        },
      },
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    if (organization.plan === normalizedPlan) {
      return NextResponse.json(transformOrganization(organization))
    }

    if (normalizedPlan === 'FREE') {
      await cancelSubscriptionForOrganization(organizationId)

      const updated = await prisma.organization.update({
        where: { id: organizationId },
        data: { plan: 'FREE' },
        include: {
          _count: {
            select: {
              users: true,
              voiceAgents: true,
              conversations: true,
            },
          },
        },
      })

      return NextResponse.json(transformOrganization(updated))
    }

    // Paid plans: PRO or ENTERPRISE
    const priceId = getPriceIdForPlan(normalizedPlan as Plan)

    if (organization.stripeSubscriptionId) {
      await cancelSubscriptionForOrganization(organizationId)
    }

    if (priceId) {
      await attachSubscriptionToOrganization({
        organizationId,
        priceId,
      })
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: { plan: normalizedPlan },
      include: {
        _count: {
          select: {
            users: true,
            voiceAgents: true,
            conversations: true,
          },
        },
      },
    })

    return NextResponse.json(transformOrganization(updated))
  } catch (error) {
    console.error('Error changing plan:', error)
    return NextResponse.json({ error: 'Failed to change plan' }, { status: 500 })
  }
}

