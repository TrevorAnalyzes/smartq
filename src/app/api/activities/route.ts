// Activities API Route
// GET /api/activities - Returns recent activity feed

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrganizationIdFromRequest } from '@/lib/tenant'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const organizationId = getOrganizationIdFromRequest(request)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch recent activities
    const activities = await prisma.activity.findMany({
      where: { organizationId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    })

    // Get total count for pagination
    const totalCount = await prisma.activity.count({
      where: { organizationId },
    })

    // Transform data
    const transformedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.type,
      agentName: activity.agentName,
      customerName: activity.customerName,
      customerPhone: activity.customerPhone,
      duration: activity.duration,
      outcome: activity.outcome,
      status: activity.status,
      sentiment: activity.sentiment?.toLowerCase(),
      timestamp: activity.timestamp,
    }))

    return NextResponse.json({
      activities: transformedActivities,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    })
  } catch (error) {
    console.error('Activities API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication/authorization check here
    const organizationId = getOrganizationIdFromRequest(request)

    const body = await request.json()

    // Create new activity
    const activity = await prisma.activity.create({
      data: {
        organizationId,
        type: body.type,
        agentName: body.agentName,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        duration: body.duration,
        outcome: body.outcome,
        status: body.status,
        sentiment: body.sentiment?.toUpperCase(),
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      },
    })

    // Transform response
    const transformedActivity = {
      id: activity.id,
      type: activity.type,
      agentName: activity.agentName,
      customerName: activity.customerName,
      customerPhone: activity.customerPhone,
      duration: activity.duration,
      outcome: activity.outcome,
      status: activity.status,
      sentiment: activity.sentiment?.toLowerCase(),
      timestamp: activity.timestamp,
    }

    return NextResponse.json(transformedActivity, { status: 201 })
  } catch (error) {
    console.error('Activities POST Error:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}
