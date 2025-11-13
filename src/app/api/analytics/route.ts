// Analytics API Route
// GET /api/analytics - Returns analytics data for charts and insights

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subDays, startOfDay, endOfDay } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId') || 'demo-org-id'
    const days = parseInt(searchParams.get('days') || '7') // Default to last 7 days
    const agentId = searchParams.get('agentId')

    // Calculate date range
    const endDate = endOfDay(new Date())
    const startDate = startOfDay(subDays(endDate, days))

    // Build where clause
    const where: any = {
      organizationId,
      startedAt: {
        gte: startDate,
        lte: endDate,
      },
    }
    if (agentId) where.agentId = agentId

    // Get sentiment distribution
    const sentimentDistribution = await prisma.conversation.groupBy({
      by: ['sentiment'],
      where: {
        ...where,
        sentiment: { not: null },
      },
      _count: true,
    })

    // Get status distribution
    const statusDistribution = await prisma.conversation.groupBy({
      by: ['status'],
      where,
      _count: true,
    })

    // Get average duration by agent
    const durationByAgent = await prisma.conversation.groupBy({
      by: ['agentId'],
      where: {
        ...where,
        duration: { not: null },
      },
      _avg: {
        duration: true,
      },
      _count: true,
    })

    // Get agent names for the duration data
    const agentIds = durationByAgent.map((item) => item.agentId)
    const agents = await prisma.voiceAgent.findMany({
      where: { id: { in: agentIds } },
      select: { id: true, name: true },
    })

    const agentMap = new Map(agents.map((agent) => [agent.id, agent.name]))

    // Transform duration data
    const performanceByAgent = durationByAgent.map((item) => ({
      agentId: item.agentId,
      agentName: agentMap.get(item.agentId) || 'Unknown',
      averageDuration: Math.round(item._avg.duration || 0),
      totalCalls: item._count,
    }))

    // Get hourly distribution (calls by hour of day)
    const allConversations = await prisma.conversation.findMany({
      where,
      select: { startedAt: true },
    })

    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: 0,
    }))

    allConversations.forEach((conv) => {
      const hour = conv.startedAt.getHours()
      if (hourlyDistribution[hour]) {
        hourlyDistribution[hour].count++
      }
    })

    // Calculate trends
    const totalConversations = await prisma.conversation.count({ where })
    const previousWhere = {
      ...where,
      startedAt: {
        gte: startOfDay(subDays(startDate, days)),
        lt: startDate,
      },
    }
    const previousConversations = await prisma.conversation.count({ where: previousWhere })

    const trend =
      previousConversations > 0
        ? ((totalConversations - previousConversations) / previousConversations) * 100
        : 0

    return NextResponse.json({
      dateRange: {
        start: startDate,
        end: endDate,
        days,
      },
      summary: {
        totalConversations,
        trend: Math.round(trend * 10) / 10,
      },
      sentimentDistribution: sentimentDistribution.map((item) => ({
        sentiment: item.sentiment?.toLowerCase() || 'unknown',
        count: item._count,
      })),
      statusDistribution: statusDistribution.map((item) => ({
        status: item.status.toLowerCase(),
        count: item._count,
      })),
      performanceByAgent,
      hourlyDistribution,
    })
  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
  }
}

