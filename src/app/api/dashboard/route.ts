// Dashboard API Route
// GET /api/dashboard - Returns aggregated dashboard metrics

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrganizationIdFromRequest } from '@/lib/tenant'

export async function GET(request: NextRequest) {
  try {
    const organizationId = getOrganizationIdFromRequest(request)

    // Get active agents count
    const activeAgents = await prisma.voiceAgent.count({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
    })

    // Get total calls (conversations) count
    const totalCalls = await prisma.conversation.count({
      where: { organizationId },
    })

    // Get successful calls count (ended status)
    const successfulCalls = await prisma.conversation.count({
      where: {
        organizationId,
        status: 'ENDED',
      },
    })

    // Calculate success rate
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0

    // Get average call duration (in seconds)
    const avgDuration = await prisma.conversation.aggregate({
      where: {
        organizationId,
        duration: { not: null },
      },
      _avg: {
        duration: true,
      },
    })

    // Get sentiment distribution
    const sentimentCounts = await prisma.conversation.groupBy({
      by: ['sentiment'],
      where: {
        organizationId,
        sentiment: { not: null },
      },
      _count: {
        _all: true,
      },
    })

    // Calculate customer satisfaction (percentage of positive sentiment)
    const totalWithSentiment = sentimentCounts.reduce((sum, item) => sum + (item._count._all || 0), 0)
    const positiveCount =
      sentimentCounts.find((item) => item.sentiment === 'POSITIVE')?._count._all || 0
    const customerSatisfaction =
      totalWithSentiment > 0 ? (positiveCount / totalWithSentiment) * 100 : 0

    // Return dashboard metrics
    return NextResponse.json({
      activeAgents,
      totalCalls,
      successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
      revenueGenerated: 0, // TODO: Implement revenue tracking
      averageCallDuration: Math.round(avgDuration._avg?.duration || 0),
      customerSatisfaction: Math.round(customerSatisfaction * 10) / 10,
    })
  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard metrics' }, { status: 500 })
  }
}

