import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Fetch CRM integration for the organization
    const crmIntegration = await prisma.cRMIntegration.findUnique({
      where: { organizationId },
    })

    // If no integration exists, return empty array
    if (!crmIntegration) {
      return NextResponse.json([])
    }

    // Return the integration as an array (for consistency with frontend)
    return NextResponse.json([
      {
        id: crmIntegration.id,
        provider: crmIntegration.provider,
        status: crmIntegration.status,
        lastSync: crmIntegration.lastSync?.toISOString(),
        contactsCount: crmIntegration.contactsCount,
        dealsCount: crmIntegration.dealsCount,
      },
    ])
  } catch (error) {
    console.error('Error fetching CRM status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CRM status' },
      { status: 500 }
    )
  }
}

