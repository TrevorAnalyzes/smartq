import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { organizationSchema } from '@/lib/validations'
import { OrganizationWhereInput, toErrorWithMessage } from '@/lib/types'
import { OrganizationPlan } from '@prisma/client'

// GET /api/organizations - Get all organizations
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const plan = searchParams.get('plan')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: OrganizationWhereInput = {}
    if (plan) where.plan = plan.toUpperCase() as OrganizationPlan

    // Fetch organizations with user count
    const organizations = await prisma.organization.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
            voiceAgents: true,
            conversations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Get total count for pagination
    const totalCount = await prisma.organization.count({ where })

    // Transform data to match frontend format
    const transformedOrganizations = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      domain: org.domain,
      plan: org.plan.toLowerCase(),
      defaultAccent: org.defaultAccent.toLowerCase().replace(/_/g, '-'),
      crmProvider: org.crmProvider?.toLowerCase(),
      emailAlerts: org.emailAlerts,
      smsAlerts: org.smsAlerts,
      webhookUrl: org.webhookUrl,
      brandingPrimaryColor: org.brandingPrimaryColor,
      brandingLogo: org.brandingLogo,
      brandingCompanyName: org.brandingCompanyName,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      _count: org._count,
    }))

    return NextResponse.json({
      organizations: transformedOrganizations,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    })
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }
}

// POST /api/organizations - Create new organization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = organizationSchema.parse(body)

    // Check if domain already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { domain: validatedData.domain },
    })

    if (existingOrg) {
      return NextResponse.json({ error: 'Domain already exists' }, { status: 400 })
    }

    // Create new organization
    const organization = await prisma.organization.create({
      data: {
        name: validatedData.name,
        domain: validatedData.domain,
        plan: validatedData.plan.toUpperCase() as OrganizationPlan,
      },
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

    // Transform data to match frontend format
    const transformedOrganization = {
      id: organization.id,
      name: organization.name,
      domain: organization.domain,
      plan: organization.plan.toLowerCase(),
      defaultAccent: organization.defaultAccent.toLowerCase().replace(/_/g, '-'),
      crmProvider: organization.crmProvider?.toLowerCase(),
      emailAlerts: organization.emailAlerts,
      smsAlerts: organization.smsAlerts,
      webhookUrl: organization.webhookUrl,
      brandingPrimaryColor: organization.brandingPrimaryColor,
      brandingLogo: organization.brandingLogo,
      brandingCompanyName: organization.brandingCompanyName,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      _count: organization._count,
    }

    return NextResponse.json(transformedOrganization, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating organization:', error)

    const errorWithMessage = toErrorWithMessage(error)

    if (errorWithMessage.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data', details: error }, { status: 400 })
    }

    const message = errorWithMessage.message || 'Failed to create organization'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

